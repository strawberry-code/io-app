import React, { useState } from "react";
import { Text, View, H3 } from "native-base";
import { ActivityIndicator, Alert, Modal, StyleSheet } from "react-native";
import { FiscalCode } from "italia-ts-commons/lib/strings";

import { LabelledItem } from "../../../components/LabelledItem";
import StyledIconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";

import variables from "../../../theme/variables";

import { useLogin } from "../../../utils/hooks/useLogin";

import ContainerLogin from "./ContainerLogin";

const checkUsernameValid = (username: string): boolean =>
  FiscalCode.decode(username).isRight();

const SSILoginScreen = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {
    modalVisible,
    success,
    error,
    message,
    isLoading,
    loginUser,
    hideModal
  } = useLogin();

  const emptyFields = () => {
    if (
      username.length === 0 ||
      checkUsernameValid(username) ||
      password.length === 0
    ) {
      Alert.alert(
        I18n.t("ssi.login.fieldErrorTitle"),
        I18n.t("ssi.login.fieldError"),
        undefined,
        { cancelable: true }
      );
      return true;
    }

    return false;
  };

  return (
    <View style={{ flex: 1 }}>
      <ContainerLogin
        buttonPrimary={
          <ButtonDefaultOpacity
            block
            lightText
            iconLeft
            onPress={async () => {
              if (emptyFields()) {
                return;
              }
              await loginUser(username, password);
            }}
          >
            <StyledIconFont name="io-profilo" color="white" />
            <Text>{I18n.t("spid.login")}</Text>
          </ButtonDefaultOpacity>
        }
        buttonSecondary={
          <ButtonDefaultOpacity block lightText icon disabled>
            <Text>{I18n.t("authentication.landing.loginSpid")}</Text>
          </ButtonDefaultOpacity>
        }
      >
        <H3>{I18n.t("ssi.login.subtitle")}</H3>
        <View spacer />
        <LabelledItem
          type={"text"}
          label={I18n.t("profile.fiscalCode.fiscalCode")}
          icon="io-carta"
          isValid={
            username.length > 0 ? checkUsernameValid(username) : undefined
          }
          inputProps={{
            value: username,
            placeholder: I18n.t("profile.fiscalCode.fiscalCode"),
            returnKeyType: "done",
            onChangeText: setUsername
          }}
        />
        <View spacer />
        <LabelledItem
          type={"text"}
          label={I18n.t("global.password")}
          icon="io-lucchetto"
          isValid={password.length > 0 ? true : undefined}
          inputProps={{
            value: password,
            placeholder: I18n.t("global.password"),
            returnKeyType: "done",
            secureTextEntry: true,
            onChangeText: setPassword
          }}
        />
      </ContainerLogin>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          {/* BLACK OPACHE BACKGROUND */}
          <View style={styles.bgOpacity} />

          <View style={styles.modalView}>
            {isLoading && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <ActivityIndicator
                  size="large"
                  color={variables.brandPrimary}
                />
              </>
            )}

            {success && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <StyledIconFont
                  size={60}
                  color={variables.brandPrimary}
                  name="io-complete"
                  style={{ height: 63 }}
                />
              </>
            )}

            {error && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <StyledIconFont
                  size={60}
                  color={variables.brandDanger}
                  name="io-notice"
                />
                <ButtonDefaultOpacity block onPress={() => hideModal()}>
                  <Text style={styles.buttonText}>
                    {I18n.t("ssi.shareReqScreen.tryAgainButton")}
                  </Text>
                </ButtonDefaultOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SSILoginScreen;

const styles = StyleSheet.create({
  bgOpacity: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "black",
    width: "100%",
    height: "100%",
    opacity: 0.5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    width: "80%",
    height: "45%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 35,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: variables.brandPrimary,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    elevation: 2
  },
  buttonText: {
    color: variables.colorWhite,
    fontSize: variables.fontSize2,
    lineHeight: variables.lineHeightH2,
    textAlign: "center"
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",
    fontSize: variables.fontSize3,
    lineHeight: variables.lineHeightH3
  }
});
