import React from "react";
import { Text, View } from "native-base";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native";

import IconFont from "../../../../components/ui/IconFont";
import customVariables from "../../../../theme/variables";

const { width } = Dimensions.get("window");
const MENUITEM_WIDTH = width * 0.5;
const BUTTON_VERTICAL_GUTTER = 30;
const BUTTON_DIAMETER = MENUITEM_WIDTH * 0.7;

const styles = StyleSheet.create({
  container: {
    width: MENUITEM_WIDTH,
    height: MENUITEM_WIDTH,
    justifyContent: "center"
  },
  button: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: MENUITEM_WIDTH,
    elevation: 5,
    width: BUTTON_DIAMETER,
    height: BUTTON_DIAMETER,
    borderColor: customVariables.brandPrimary,
    borderWidth: 1,
    shadowColor: customVariables.brandPrimary,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 2
    }
  }
});

interface Props {
  text: string;
  icon: string;
  variant?: "right" | "left";
  onPress: () => void;
}

const MenuItem: React.FC<Props> = ({ text, icon, variant, onPress }) => {
  const variantContainerStyle: StyleProp<ViewStyle> = [
    styles.container,
    variant === "right" && { alignItems: "flex-end" },
    variant === "left" && { alignItems: "flex-start" }
  ];

  const variantButtonStyle: StyleProp<ViewStyle> = [
    styles.button,
    {
      marginRight:
        variant === "right" ? BUTTON_VERTICAL_GUTTER * 0.5 : undefined
    },
    {
      marginLeft: variant === "left" ? BUTTON_VERTICAL_GUTTER * 0.5 : undefined
    }
  ];

  return (
    <View style={variantContainerStyle}>
      <TouchableOpacity
        style={variantButtonStyle}
        delayPressIn={50}
        onPress={onPress}
      >
        <IconFont
          style={{
            textAlign: "center",
            justifyContent: "center",
            marginBottom: 5
          }}
          name={icon}
          size={50}
        />
        <Text alignCenter textBreakStrategy="balanced" xsmall>
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MenuItem;
