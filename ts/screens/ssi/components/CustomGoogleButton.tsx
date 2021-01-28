import React from "react";
import { Text } from "native-base";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  GoogleSigninButton,
  GoogleSigninButtonProps
} from "@react-native-community/google-signin";

import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    flexDirection: "row",
    shadowOffset: {
      width: 10,
      height: 10
    },
    elevation: 5,
    borderRadius: 5,
    backgroundColor: "white",
    marginRight: 10
  },
  text: {
    alignSelf: "center",
    flex: 1,
    textAlign: "center",
    color: customVariables.brandPrimary
  }
});

type Props = GoogleSigninButtonProps;

const CustomGoogleButton: React.FC<Props> = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Icon}
        color={GoogleSigninButton.Color.Dark}
        disabled={disabled}
      />
      <Text style={styles.text}>
        {I18n.t("ssi.recoverVCs.google.loginButton")}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomGoogleButton;
