import React, { ReactNode } from "react";
import { Dimensions, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { View } from "native-base";

import variables from "../../../theme/variables";
import I18n from "../../../i18n";

import LoginHeader from "./LoginHeader";

interface Props {
  children: ReactNode;
  buttonPrimary: ReactNode;
  buttonSecondary: ReactNode;
}

const BORDER_RADIUS = 25;
const { width, height: WINDOW_HEIGHT } = Dimensions.get("window");
const height = 0.2 * WINDOW_HEIGHT;

const ContainerLogin = (props: Props) => (
  <SafeAreaView style={styles.container}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={variables.brandPrimaryLight}
    />
    <LoginHeader title={I18n.t("ssi.login.title")} icon="io-lombardia" />

    <View style={{ flex: 1 }}>
      <View style={styles.absoluteFillObject} />
      <View style={styles.body}>{props.children}</View>
      <View style={styles.footer}>
        <View spacer />
        {props.buttonPrimary}
        <View spacer />
        {props.buttonSecondary}
      </View>
    </View>
  </SafeAreaView>
);

export default ContainerLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {
    paddingHorizontal: 10,
    height: WINDOW_HEIGHT * 0.22
  },
  bgWhite: {
    backgroundColor: "white"
  },
  body: {
    borderRadius: BORDER_RADIUS,
    borderTopLeftRadius: 0,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 30,
    height: WINDOW_HEIGHT * 0.58
  },
  absoluteFillObject: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    backgroundColor: variables.brandPrimary
  }
});
