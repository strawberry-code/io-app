import React, { DispatchWithoutAction, useState } from "react";
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
import { connect, MapDispatchToProps } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

import { abortOnboarding } from "../../store/actions/onboarding";
import { createDIDSuccess } from "../../store/actions/didset";
import { DidSingleton } from "../../types/DID";
import variables from "../../theme/variables";
import IconFont from "../../components/ui/IconFont";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import RecoverIdentityModal from "./RecoverIdentityModal";

type ResultStatus = "completed" | "error" | "";

type Props = ReturnType<typeof mapDispatchToProps>;

const DidSetterScreen: React.FC<Props> = ({
  abortOnboarding,
  createDIDSuccess
}) => {
  // LOADING STATUS MANAGEMENT
  const [result, setResult] = React.useState<ResultStatus>("");
  const [loadingMessage, setLoadingMessage] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingVisible, setLoadingVisible] = React.useState<boolean>(false);

  // visibility of Recover Identity Modal
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  // checking if button is Pressed for changing styles
  const [isPress, setIsPress] = React.useState<boolean>(false);

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
      changeLoadingStates(true, "Generando identità", "", true);

      await DidSingleton.generateEthWallet();

      changeLoadingStates(true, "Salvando identità", "", true);
      const savedOnKeychain = await DidSingleton.saveDidOnKeychain();

      if (!savedOnKeychain) {
        throw new Error("Salvataggio identità non riuscita");
      }

      changeLoadingStates(
        true,
        "Indetità creata con successo",
        "completed",
        false
      );
      setTimeout(() => createDIDSuccess(), 2000);
    } catch (e) {
      console.error(e);
      changeLoadingStates(
        true,
        "Creazione identità non riuscita",
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
          <Text style={textBox.title}>SSI</Text>
          <Text style={textBox.subtitle}>
            Prendi il controllo della tua identità
          </Text>
        </View>
        <TouchableHighlight {...touchProps}>
          <Text style={isPress ? buttonPrimary.textPress : buttonPrimary.text}>
            Crea nuova identità
          </Text>
        </TouchableHighlight>
        <TouchableOpacity
          style={buttonSecondary.container}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text style={buttonSecondary.text}>Recupera identità</Text>
        </TouchableOpacity>
      </View>
      <RecoverIdentityModal
        visible={modalVisible}
        close={() => setModalVisible(false)}
        changeLoadingStates={changeLoadingStates}
      />
      {loadingVisible && (
        <View style={loading.bg}>
          <View style={loading.card}>
            <Text style={loading.stateText}>{loadingMessage}</Text>
            {result === "error" && (
              <IconFont
                name="io-error"
                size={70}
                color={variables.brandDanger}
              />
            )}
            {result === "completed" && (
              <IconFont
                name="io-complete"
                size={70}
                color={variables.brandPrimary}
              />
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
    height: "50%",
    borderRadius: 5,
    alignItems: "center",
    padding: 30,
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
  }
});

const loadingButton = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "100%",
    backgroundColor: variables.brandPrimary,
    borderRadius: 5
  },
  text: {
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  }
});

const topbar = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createDIDSuccess: () => dispatch(createDIDSuccess()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(undefined, mapDispatchToProps)(DidSetterScreen);
