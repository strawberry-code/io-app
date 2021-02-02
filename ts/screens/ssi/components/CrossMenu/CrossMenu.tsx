import React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps, withNavigation } from "react-navigation";

import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";

import MenuItem from "./MenuItem";

type Props = NavigationInjectedProps;

const CrossMenu: React.FC<Props> = ({ navigation }) => (
  <View>
    <View style={styles.row}>
      <MenuItem
        text={I18n.t("ssi.vcslist.button")}
        icon="io-service-list"
        variant="right"
        onPress={() =>
          navigation.navigate(ROUTES.SSI_VERIFIED_CREDENTIALS_SCREEN)
        }
      />
      <MenuItem
        text={I18n.t("ssi.balanceAndTransaction.title")}
        icon="io-portafoglio"
        variant="left"
        onPress={() =>
          navigation.navigate(ROUTES.SSI_WALLET_BALANCE_AND_TRANSACTION)
        }
      />
    </View>
    <View style={styles.row}>
      <MenuItem
        text={I18n.t("ssi.sendFromWallet.title")}
        icon="inbox-upload"
        variant="right"
        onPress={() => navigation.navigate(ROUTES.SSI_WALLET_SEND_SCREEN)}
      />
      <MenuItem
        text={I18n.t("ssi.receiveIntoWallet.title")}
        icon="inbox-download"
        variant="left"
        onPress={() => navigation.navigate(ROUTES.SSI_WALLET_RECEIVE_SCREEN)}
      />
    </View>
  </View>
);

export default withNavigation(CrossMenu);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center"
  }
});
