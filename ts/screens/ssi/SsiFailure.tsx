import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { NavigationComponent } from "react-navigation";

import ROUTES from "../../navigation/routes";
import IconFont from "../../components/ui/IconFont";
import variables from "../../theme/variables";

interface Props {
  navigation: NavigationComponent;
}

const SsiFailure: React.FC<Props> = ({ navigation }) => {
  const message = navigation.getParam(
    "message",
    "Error occurred: something went wrong!" // valore di default
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[variables.brandDanger, variables.brandDanger]}
        style={topBox.container}
      >
        <IconFont
          name="io-close"
          size={130}
          color={variables.colorWhite}
          style={{ height: 135 }}
        />
      </LinearGradient>
      <View style={bottomBox.container}>
        <Text style={bottomBox.title}>{message}</Text>
        {/* <Text style={bottomBox.description}>{message}</Text> */}
        <TouchableHighlight
          style={[button.container]}
          onPress={() => navigation.navigate(ROUTES.SSI_HOME)}
        >
          <Text style={button.text}>Home</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const topBox = StyleSheet.create({
  container: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center"
  }
});

const bottomBox = StyleSheet.create({
  container: {
    flex: 0.6,
    justifyContent: "space-around"
  },
  title: {
    fontSize: variables.h3FontSize,
    color: variables.colorBlack,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    textAlign: "center"
  }
});

const button = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: "10%",
    marginHorizontal: 30,
    width: "auto",
    backgroundColor: variables.brandDarkGray,
    borderRadius: 5
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h3FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  }
});

export default SsiFailure;