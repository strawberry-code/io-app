import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Platform
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Share from "react-native-share";

import { DID } from "../../types/DID";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";

const DUMMY_USER = {
  address: "0x7506f0045F03cC82c73341A45f190ab9A1a85A93",
  privKey: "adac18e2cb203dde7ee4691de0a6d8fb22ca57982cabd334f4bac403794159c2"
};

const DUMMY_USER_2 = {
  address: "0x5b9839858b38c3bF19811bcdbEC09Fb95a4e6B54",
  privKey: "84a70b263aa545e0f2cfb6cff58380ee3fb761970c1b2ab19461270be4c3f39d"
};

const DUMMY_USER_3 = {
  address: "0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a51",
  privKey: "d603b3993036898349156db1b63143c18193d6c93b20ced4f0817cf7f87662d2"
};

const SsiWalletReceiveScreen: React.FC = () => {
  const userDID = new DID();
  console.log("generating DID qrcode", userDID.getEthAddress());

  const shareOptions = {
    message: `Questo è il mio indirizzo ${DUMMY_USER_3.address}`
  };

  const shareAddressHandler = async () => {
    try {
      const shareResponse = await Share.open(shareOptions);
      console.log("Success: ", shareResponse);
    } catch (e) {
      console.log("Error: ", (e as Error).message);
    }
  };
  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      goBack={true}
    >
      <Text style={styles.title}>{I18n.t("ssi.receiveIntoWallet.title")}</Text>
      <View style={{ padding: 30, justifyContent: "space-around" }}>
        <View style={styles.qrcode}>
          <QRCode value={DUMMY_USER_3.address} size={200} />
        </View>
        <Text style={styles.descriptionTitle}>
          {I18n.t("ssi.receiveIntoWallet.descriptionTitle")}
        </Text>
        <Text style={styles.descriptionText}>
          {I18n.t("ssi.receiveIntoWallet.descriptionContent")}
        </Text>
        <Text style={styles.descriptionTitle}>
          {I18n.t("ssi.receiveIntoWallet.addressTitle")}
        </Text>
        <Text style={styles.addressText}>{DUMMY_USER_3.address}</Text>
        <TouchableHighlight
          style={button.container}
          onPress={() => void shareAddressHandler()}
        >
          <Text style={button.text}>
            {I18n.t("ssi.receiveIntoWallet.receiveButton")}
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
  qrcode: {
    marginBottom: 20,
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
    marginBottom: 10,
    textAlign: "center"
  },
  addressText: {
    fontSize: 18,
    textAlign: "center"
  },
  makeBold: {
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold"
  }
});

export default SsiWalletReceiveScreen;
