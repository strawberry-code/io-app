import React, { useState } from "react";
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
  StyleSheet,
  Platform
} from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

import { createDIDSuccess } from "../../store/actions/didset";
import { DidSingleton } from "../../types/DID";
import variables from "../../theme/variables";
import I18n from "../../i18n";
import IconFont from "../../components/ui/IconFont";

interface Props {
  close: () => void;
  visible: boolean;
  createDIDSuccess: ReturnType<typeof mapDispatchToProps>;
  changeLoadingStates: (
    visibility: boolean,
    message: string,
    status: "error" | "completed" | "",
    isWaiting: boolean
  ) => void;
}

const RecoverIdentityModal: React.FC<Props> = ({
  close,
  visible,
  createDIDSuccess,
  changeLoadingStates
}) => {
  const [recoveryKey, setRecoveryKey] = useState<string>("");
  const [isPress, setIsPress] = React.useState<boolean>(false);

  const handleRecoveryInput = (text: string) => {
    setRecoveryKey(text);
  };

  // DELAY FUNCTION FOR SHOWING LOADING SPINNER WHEN CREATNG CREDENTIAL
  const delay = (seconds: number): Promise<void> =>
    new Promise(r => setTimeout(() => void r(), seconds * 1000));

  const handleRecovery = async () => {
    console.log(" ⚠️RECUPERANDOO LA TUA IDENTITA....");
    changeLoadingStates(
      true,
      I18n.t("ssi.onboarding.recoveringIdentity"),
      "",
      true
    );
    close();
    await delay(1);

    try {
      const recoveredWallet = await DidSingleton.recoverEthWallet(recoveryKey);

      if (!recoveredWallet) {
        throw new Error("Non è possibile recuperare l'identità");
      }

      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.savingIdentity"),
        "",
        true
      );
      await DidSingleton.saveDidOnKeychain();
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.recoveringIdentityCompleted"),
        "completed",
        false
      );

      setTimeout(() => createDIDSuccess(), 2000);
    } catch (e) {
      console.error("Errore:", e);
      changeLoadingStates(
        true,
        I18n.t("ssi.onboarding.recoveringError"),
        "error",
        false
      );
    }
  };

  const touchProps = {
    activeOpacity: 1,
    underlayColor: variables.brandPrimaryDark, // <-- "backgroundColor" will be always overwritten by "underlayColor"
    style: isPress ? buttonPrimary.containerPress : buttonPrimary.container, // <-- but you can still apply other style changes
    onHideUnderlay: () => setIsPress(false),
    onShowUnderlay: () => setIsPress(true),
    onPress: handleRecovery // <-- "onPress" is apparently required
  };

  return (
    <Modal visible={visible} animationType="slide">
      <LinearGradient
        colors={[variables.brandPrimaryLight, variables.brandPrimary]}
        style={{ flex: 1 }}
      >
        <View style={topbar.container}>
          <TouchableOpacity onPress={close}>
            <IconFont name="io-back" size={35} color={variables.colorWhite} />
          </TouchableOpacity>
          <IconFont
            name="io-lombardia"
            size={30}
            color={variables.colorWhite}
            style={{ marginRight: 15 }}
          />
        </View>
        <View style={main.container}>
          <View>
            <Text style={textBox.title}>
              {I18n.t("ssi.onboarding.recoverIdentityTitle")}
            </Text>
            <Text style={textBox.subtitle}>
              {I18n.t("ssi.onboarding.recoverIdentitySubtitle")}
            </Text>
          </View>

          <View style={input.group}>
            <Text style={input.label}>
              {I18n.t("ssi.onboarding.recoverIdenityLabel")}:
            </Text>
            <TextInput
              onChangeText={handleRecoveryInput}
              style={input.container}
              value={recoveryKey}
            />
            <TouchableHighlight
              {...touchProps}
              style={
                isPress ? buttonPrimary.containerPress : buttonPrimary.container
              }
            >
              <Text
                style={isPress ? buttonPrimary.textPress : buttonPrimary.text}
              >
                {I18n.t("ssi.onboarding.recoverIdentity")}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const topbar = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const main = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
    justifyContent: "space-around"
  }
});

const input = StyleSheet.create({
  group: {
    width: "100%",
    flex: 0.85
  },
  container: {
    backgroundColor: variables.colorWhite,
    width: "100%",
    borderRadius: 5,
    fontSize: variables.fontSize2,
    marginBottom: "5%"
  },
  label: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "left",
    width: "100%",
    marginBottom: 5
  }
});

const textBox = StyleSheet.create({
  title: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h2FontSize,
    color: variables.colorWhite,
    textAlign: "center",
    marginBottom: 10
  },
  subtitle: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    fontSize: variables.h5FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  }
});

const buttonPrimary = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: variables.brandPrimaryDark,
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 10
  },
  containerPress: {
    width: "100%",
    backgroundColor: variables.brandPrimaryLight,
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
    color: variables.colorWhite
  },
  textPress: {
    fontSize: variables.fontSize3,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.colorWhite
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createDIDSuccess: (did: typeof DidSingleton) =>
    dispatch(createDIDSuccess(did))
});

export default connect(undefined, mapDispatchToProps)(RecoverIdentityModal);
