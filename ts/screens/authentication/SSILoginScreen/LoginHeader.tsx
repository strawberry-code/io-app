import { H2, View } from "native-base";
import React from "react";
import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { IconProps } from "react-native-vector-icons/Icon";
import StyledIconFont from "../../../components/ui/IconFont";
import variables from "../../../theme/variables";

const { width, height: WINDOW_HEIGHT } = Dimensions.get("window");
const height = WINDOW_HEIGHT * 0.2;

const styles = StyleSheet.create({
  bgWhite: {
    backgroundColor: "white"
  },
  icon: {
    fontSize: 50,
    marginRight: 20,
    color: "white"
  },
  title: {
    color: "white"
  },
  header: {
    width,
    height,
    borderBottomLeftRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden"
  }
});

interface Props {
  title: string;
  icon: string;
  iconStyle?: IconProps["style"];
}

const LoginHeader: React.FC<Props> = ({ title, iconStyle, icon }) => {
  const iconStyleProp = !iconStyle ? styles.icon : iconStyle;

  return (
    <View style={styles.bgWhite}>
      <LinearGradient
        colors={[variables.brandPrimaryLight, variables.brandPrimary]}
        style={styles.header}
      >
        <StyledIconFont name={icon} style={iconStyleProp} />
        <H2 style={styles.title}>{title}</H2>
      </LinearGradient>
    </View>
  );
};

export default LoginHeader;
