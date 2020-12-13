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

  const handleRecovery = async () => {
    close();
    console.log(" ⚠️RECUPERANDOO LA TUA IDENTITA....");

    try {
      changeLoadingStates(true, "Recuperando identità", "", true);
      const recoveredWallet = await DidSingleton.recoverEthWallet(recoveryKey);

      if (!recoveredWallet) {
        throw new Error("Non è possibile recuperare l'identità");
      }

      changeLoadingStates(true, "Salvando identità", "", true);
      await DidSingleton.saveDidOnKeychain();
      changeLoadingStates(
        true,
        "Recuperata l'identità con successo",
        "completed",
        false
      );

      setTimeout(() => createDIDSuccess(), 2000);
    } catch (e) {
      console.error("Errore:", e);
      changeLoadingStates(
        true,
        "Errore recupero dell'identità",
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
            size={35}
            color={variables.colorWhite}
          />
        </View>
        <View style={main.container}>
          <View style={textBox.container}>
            <Text style={textBox.title}>Digita la chiave di recupero</Text>
          </View>

          <Text style={input.label}>Chiave:</Text>
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
              Recupera identità
            </Text>
          </TouchableHighlight>
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
    justifyContent: "space-between"
  }
});

const main = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1
  }
});

const input = StyleSheet.create({
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
  container: {
    marginBottom: "20%"
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h2FontSize,
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createDIDSuccess: (did: typeof DidSingleton) =>
    dispatch(createDIDSuccess(did))
});

export default connect(undefined, mapDispatchToProps)(RecoverIdentityModal);
