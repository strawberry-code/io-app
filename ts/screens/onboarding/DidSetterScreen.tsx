import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  Platform,
  Alert
} from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

import { abortOnboarding } from "../../store/actions/onboarding";
import { createDIDSuccess } from "../../store/actions/didset";
import { DidSingleton } from "../../types/DID";
import variables from "../../theme/variables";
import IconFont from "../../components/ui/IconFont";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import NetCode from "../ssi/NetCode";
import VCstore from "../ssi/VCstore";
import { GlobalState } from "../../store/reducers/types";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import RecoverIdentityModal from "./RecoverIdentityModal";
import PassPhraseWordList from "./components/PassPhraseWordList";

type ResultStatus = "completed" | "error" | "show_recovery_key" | "";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DidSetterScreen: React.FC<Props> = ({
  abortOnboarding,
  createDIDSuccess,
  notificationToken
}) => {
  // LOADING STATUS MANAGEMENT
  const [result, setResult] = useState<ResultStatus>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingVisible, setLoadingVisible] = useState<boolean>(false);

  // RECOVERY KEY VALUE TO COPY TO CLIPBOARD WITH BUTTON
  const [recoveryKey, setRecoveryKey] = useState<string>("");

  // visibility of Recover Identity Modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // checking if button is Pressed for changing styles
  const [isPress, setIsPress] = useState<boolean>(false);

  // changing loading states helper
  const changeLoadingStates = (
    visibility: boolean,
    message: string,
    status: ResultStatus,
    isWaiting: boolean
  ) => {
    setLoadingVisible(visibility);
    setLoadingMessage(message);
    setResult(status);
    setIsLoading(isWaiting);
  };

  const handleLogin = async () => {
    console.log(
      "⚠️ GENERANDO un nuovo DID! (eventuale DID precedente è stato sovrascritto)"
    );
    try {
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.generatingIdentity"),
        "",
        true
      );

      await DidSingleton.generateEthWallet();

      if (!notificationToken) {
        console.log(
          `[DidSetterScreen][handleLogin]: impossibile creare l'user nel backend perchè manca il push device token`
        );
      }
      await NetCode.createNewUser(
        DidSingleton.getDidAddress(),
        notificationToken
      );

      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.savingIdentity"),
        "",
        true
      );
      const savedOnKeychain = await DidSingleton.saveDidOnKeychain();

      if (!savedOnKeychain) {
        throw new Error("Salvataggio identità non riuscita");
      }

      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.generatingIdentityCompleted"),
        "completed",
        false
      );
      setTimeout(() => {
        console.log(`[I18n.locale]: ${I18n.locale}`);
        console.log(
          `[DidSingleton.getMnemonicToBeExported()]: ${DidSingleton.getMnemonicToBeExported()}`
        );
        console.log(
          `[typeof DidSingleton.getMnemonicToBeExported()]: ${typeof DidSingleton.getMnemonicToBeExported()}`
        );
        setRecoveryKey(DidSingleton.getMnemonicToBeExported());
        changeLoadingStates(
          true,
          I18n.t("ssi.onboarding.yourRecoverKey"),
          "show_recovery_key",
          false
        );
      }, 2000);
    } catch (e) {
      console.error(e);
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.generatingError"),
        "error",
        false
      );
    }
  };

  const generateVC = async () => {
    try {
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.generatingVC"),
        "",
        true
      );
      await VCstore.storeVC(
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcFlYUWlPakUxTkRFME9UTTNNalFzSW1WNGNDSTZNVGMzTXpBeU9UY3lNeXdpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaUxDSm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OWxlR0Z0Y0d4bGN5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lpd2lRMkZ5ZEdGSlpHVnVkR2wwWVNKZExDSmpjbVZrWlc1MGFXRnNVM1ZpYW1WamRDSTZleUpwWkNJNklqRXlNelFpTENKbWFYSnpkRTVoYldVaU9pSkVZVzVwWld4bElpd2liR0Z6ZEU1aGJXVWlPaUpTYjNOemFTSXNJbUpwY25Sb1pHRjVJam9pTVRrNU1TMHdPQzB5TlZReE56b3lPVG95TUM0eU56bGFJaXdpY0d4aFkyVlBaa0pwY25Sb0lqb2lVbTl0WlNKOWZTd2lZM0psWkdWdWRHbGhiRk5qYUdWdFlTSTZleUpwWkNJNklrTmhjblJoU1dSbGJuUnBkR0VpTENKMGVYQmxJam9pVW1WbmFXOXVaVXh2YldKaGNtUnBZUzFpYkdGaWJHRWlmU3dpYVhOeklqb2laR2xrT21WMGFISTZNSGhtTVRJek1tWTROREJtTTJGa04yUXlNMlpqWkdGaE9EUmtObU0yTm1SaFl6STBaV1ppTVRrNElpd2lhblJwSWpvaWFIUjBjRG92TDJWNFlXMXdiR1V1WldSMUwyTnlaV1JsYm5ScFlXeHpMek0zTXpJaUxDSnpkV0lpT2lKa2FXUTZaWFJvY2pvd2VFVTJRMFUwT1RnNU9ERmlOR0poT1dVNE0yVXlNRGxtT0VVd01qWXlPVFE1TkVaRE16RmlZemtpTENKdVltWWlPakUxTkRFME9UTTNNalFzSW01dmJtTmxJam9pTmpZd0lUWXpORFZHVTJWeUlpd2lhV1FpT2lJMk5qVTVOVFF6TUMwME5EVTRMVFJtTUdFdE9ERTFPUzAyWVdNeE1EUmhPVFEzTkRjaWZRLm92cmZuY2E2NUh4LUVMS3hsNlk2a0hoZjhnZDhPbTE0MEdYeGpSNXhGb3JPd3R2R1lMeWZVbnc4V2FYOTVlcVM2QnYxTzcwTGx3XzM0cTFkanhCSEJ3Il19LCJpc3MiOiJkaWQ6ZXRocjoweGYxMjMyZjg0MGYzYWQ3ZDIzZmNkYWE4NGQ2YzY2ZGFjMjRlZmIxOTgifQ.s-914n4v_V69q96G_Ak2fQow4wIUg-Y-WbP_drHjnfx6-9X5ooSKETHrhLPdB6DTGQ8c-1cWnIEko5FwsvYXiw"
      );
      setTimeout(() => {
        changeLoadingStates(
          true,
          I18n.t("ssi.onboarding.generatingVCCompleted"),
          "completed",
          false
        );
      }, 2000);

      setTimeout(() => createDIDSuccess(), 2000);
    } catch (e) {
      console.error("Credenziale verificata non generata", e);
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.generatingVCError"),
        "error",
        false
      );
    }
  };

  const handleAbort = () => {
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: abortOnboarding
        }
      ]
    );
  };

  const touchProps = {
    activeOpacity: 1,
    underlayColor: variables.brandPrimaryDark, // <-- "backgroundColor" will be always overwritten by "underlayColor"
    style: isPress ? buttonPrimary.containerPress : buttonPrimary.container, // <-- but you can still apply other style changes
    onHideUnderlay: () => setIsPress(false),
    onShowUnderlay: () => setIsPress(true),
    onPress: handleLogin // <-- "onPress" is apparently required
  };

  return (
    <LinearGradient
      colors={[variables.brandPrimaryLight, variables.brandPrimary]}
      style={{ flex: 1 }}
    >
      <View style={topbar.container}>
        <TouchableOpacity onPress={handleAbort}>
          <IconFont name="io-back" size={35} color={variables.colorWhite} />
        </TouchableOpacity>
      </View>
      <View style={main.container}>
        <View style={logoBox.container}>
          <IconFont
            name="io-lombardia"
            size={100}
            color={variables.colorWhite}
          />
        </View>
        <View style={textBox.container}>
          <Text style={textBox.title}>{I18n.t("ssi.title")}</Text>
          <Text style={textBox.subtitle}>
            {I18n.t("ssi.onboarding.subtitle")}
          </Text>
        </View>
        <TouchableHighlight {...touchProps}>
          <Text style={isPress ? buttonPrimary.textPress : buttonPrimary.text}>
            {I18n.t("ssi.onboarding.createIdentity")}
          </Text>
        </TouchableHighlight>
        <TouchableOpacity
          style={buttonSecondary.container}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text style={buttonSecondary.text}>
            {I18n.t("ssi.onboarding.recoverIdentity")}
          </Text>
        </TouchableOpacity>
      </View>
      <RecoverIdentityModal
        visible={modalVisible}
        close={() => setModalVisible(false)}
        changeLoadingStates={changeLoadingStates}
      />
      {loadingVisible && (
        <View style={loading.bg}>
          <View
            style={
              result === "show_recovery_key"
                ? loading.recoveryKeyCard
                : loading.card
            }
          >
            <Text style={loading.stateText}>{loadingMessage}</Text>
            {result === "error" && (
              <IconFont
                name="io-error"
                size={70}
                color={variables.brandDanger}
                style={{ height: 75 }}
              />
            )}
            {result === "completed" && (
              <IconFont
                name="io-complete"
                size={70}
                color={variables.brandPrimary}
                style={{ height: 75 }}
              />
            )}
            {!isLoading && result === "show_recovery_key" && (
              <>
                <Text style={loading.recoveryKeyText}>
                  {I18n.t("ssi.onboarding.saveYourRecoverKey")}
                </Text>
                <PassPhraseWordList passPhrase={recoveryKey} />
                <TouchableOpacity
                  style={loadingButton.container}
                  onPress={generateVC}
                >
                  <Text style={loadingButton.textSmall}>Continua</Text>
                </TouchableOpacity>
              </>
            )}
            {isLoading && <RefreshIndicator />}
            {!isLoading && result === "error" && (
              <TouchableOpacity
                style={loadingButton.container}
                onPress={() => setLoadingVisible(false)}
              >
                <Text style={loadingButton.text}>Riprova</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const loading = StyleSheet.create({
  bg: {
    backgroundColor: variables.brandPrimary,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  card: {
    backgroundColor: variables.colorWhite,
    width: "80%",
    height: "60%",
    borderRadius: 5,
    alignItems: "center",
    padding: 30,
    justifyContent: "space-evenly"
  },
  recoveryKeyCard: {
    backgroundColor: variables.colorWhite,
    width: "90%", // 80%
    height: "80%", // 60%
    borderRadius: 5,
    alignItems: "center",
    padding: 20,
    justifyContent: "space-evenly"
  },
  stateText: {
    fontSize: variables.h4FontSize,
    color: variables.colorBlack,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    textAlign: "center"
  },
  cardLoading: {
    justifyContent: "space-between"
  },
  cardNotLoading: {
    justifyContent: "space-evenly"
  },
  recoveryKeyText: {
    fontSize: variables.fontSize2,
    color: variables.colorBlack,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    textAlign: "center",
    marginBottom: 20
  }
});

const loadingButton = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "100%",
    backgroundColor: variables.brandPrimary,
    borderRadius: 5
  },
  round: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: variables.brandPrimary
  },
  text: {
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  },
  textSmall: {
    fontSize: variables.h5FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  },
  copyToClipboard: {
    justifyContent: "center",
    alignItems: "center"
  }
});

const topbar = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingVertical: 20
  }
});

const main = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1
  }
});

const logoBox = StyleSheet.create({
  container: {
    marginVertical: 30
  }
});

const textBox = StyleSheet.create({
  container: {
    marginBottom: 50
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h2FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  },
  subtitle: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  }
});

const buttonPrimary = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: variables.colorWhite,
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 10
  },
  containerPress: {
    width: "100%",
    backgroundColor: variables.brandPrimaryDark,
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 10
  },
  text: {
    fontSize: variables.fontSize3,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.brandPrimary
  },
  textPress: {
    fontSize: variables.fontSize3,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.colorWhite
  }
});

const buttonSecondary = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 8
  },
  text: {
    fontSize: variables.fontSize3,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.colorWhite
  }
});

const mapStateToProps = (state: GlobalState) => ({
  notificationToken: notificationsInstallationSelector(state).token
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createDIDSuccess: () => dispatch(createDIDSuccess()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(mapStateToProps, mapDispatchToProps)(DidSetterScreen);
