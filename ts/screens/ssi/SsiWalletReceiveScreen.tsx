import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";

const SsiWalletReceiveScreen: React.FC = () => {
  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      goBack={true}
    >
      <Text style={styles.title}>Ricevi nel Wallet</Text>
      <View style={{ padding: 30, justifyContent: "space-around" }}>
        <Image
          source={require("../../../img/icons/qr_code_image.png")}
          style={styles.image}
        />
        <Text style={styles.descriptionTitle}>Descrizione</Text>
        <Text style={styles.descriptionText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac
          ipsum porttitor, egestas erat in, blandit lorem.{" "}
        </Text>
        <Text style={styles.descriptionTitle}>Indirizzo</Text>
        <Text style={styles.addressText}>0x123456789</Text>
        <TouchableHighlight
          style={button.container}
          onPress={() => alert("da definire")}
        >
          <Text style={button.text}>
            {I18n.t("ssi.balanceAndTransaction.receiveButton")}
          </Text>
        </TouchableHighlight>
      </View>
    </TopScreenComponent>
  );
};

const button = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "100%",
    backgroundColor: variables.brandPrimary,
    borderRadius: 5,
    marginTop: 10
  },
  text: {
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular"
  }
});

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h2FontSize,
    padding: 20,
    backgroundColor: variables.brandPrimary,
    color: variables.colorWhite
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
    alignSelf: "center"
  },
  descriptionTitle: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontSize: variables.h4FontSize,
    color: variables.brandPrimary,
    textAlign: "center"
  },
  descriptionText: {
    fontSize: variables.fontSizeBase,
    marginBottom: 10
  },
  addressText: {
    fontSize: 20,
    textAlign: "center"
  }
});

export default SsiWalletReceiveScreen;
