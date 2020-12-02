import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";
import { Picker, Form, Item, Input, Label, Button } from "native-base";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import AssetListPicker from "./components/AssetListPicker";

const SsiWalletSendScreen: React.FC = ({ navigation }) => {
  const [selected, setSelected] = useState(undefined);

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      goBack={true}
    >
      <View style={{ flex: 1, justifyContent: "space-between", padding: 20 }}>
        <View style={{ justifyContent: "space-between" }}>
          <Text style={title.text}>Invia dal Wallet</Text>
          <IconFont
            name="io-qr"
            color={variables.brandPrimary}
            size={variables.iconSize6}
            onPress={() => navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)}
          />
        </View>

        <View>
          <AssetListPicker />
          <Form>
            <Item stackedLabel>
              <Label style={{ color: variables.brandPrimary }}>Amount</Label>
              <Input />
            </Item>
          </Form>
        </View>

        <TouchableHighlight
          style={button.container}
          onPress={() => alert("da definire")}
        >
          <Text style={button.text}>
            {I18n.t("ssi.balanceAndTransaction.sendButton")}
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
    borderRadius: 5
  },
  text: {
    fontSize: variables.h4FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  }
});

const title = StyleSheet.create({
  text: {
    fontSize: variables.h2FontSize,
    color: variables.brandPrimary,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "bold" : "normal",
    marginBottom: 20
  }
});

export default SsiWalletSendScreen;
