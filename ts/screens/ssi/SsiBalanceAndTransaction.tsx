import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableHighlight,
  Platform
} from "react-native";
import { NavigationComponent } from "react-navigation";
import { connect } from "react-redux";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { Transaction, Asset } from "./types";
import AssetListPicker from "./components/AssetListPicker";
import { DID } from "../../types/DID";

/* Dummy Users
 "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54"
 '0x7506f0045f03cc82c73341a45f190ab9a1a85a93'
  0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a51
*/
const DUMMY_USER = "0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a51";

interface BalanceAndTransactionProps {
  navigation: NavigationComponent;
  ssiAssetList: Array<Asset>;
  assetSelected: Asset["address"];
}

/*
const fontRegular = Platform.OS === 'android'? 'TitilliumWeb-Regular': 'TitilliumWeb'


const fontBold: TextStyle = Platform.OS === 'android'
  ? { fontFamily : 'TitilliumWeb-Bold', fontWeight: 'normal'}
  : { fontFamily: 'Titillium Web', fontWeight: 'bold'}
 */

const SsiBalanceAndTransctionScreen: React.FC<BalanceAndTransactionProps> = ({
  navigation,
  ssiAssetList,
  assetSelected
}) => {
  const [transactionList, setTransactionList] = useState<Array<Transaction>>([]); // prettier-ignore
  const [isLoading, setisLoading] = useState<boolean>(true);

  // console.log('assetList=', assets)
  //  console.log("transactionList=", transactionList);
  // console.log("ssiAssetList", ssiAssetList);
  const userDID = new DID();
  const ethAddress = userDID.getEthAddress();

  const fetchTransactionList = async (assetAddress: string | undefined) => {
    setisLoading(true);
    try {
      const response = await fetch(
        `https://tokenization.pub.blockchaincc.ga/api/transaction/app/list/${assetAddress}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userAddress: DUMMY_USER.toLowerCase()
          })
        }
      );
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }

      console.log("data from transactionList from API", data);
      setTransactionList(data.docs);
    } catch (e) {
      console.error('Error:', e);
    }
    setisLoading(false);
  };

  useEffect(() => {
    if (!assetSelected) return;
    console.log("called fetch transactionList");
    void fetchTransactionList(assetSelected);
  }, [assetSelected]);

  const assetChosen = ssiAssetList.find(
    asset => asset.address === assetSelected
  );

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.balanceAndTransaction.title")}
      goBack={true}
    >
      {isLoading && (
        <View style={loading.overlay}>
          <RefreshIndicator />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AssetListPicker />
        <BalanceComponent
          transactions={transactionList}
          symbol={assetChosen?.symbol}
        />
        <Text
          style={{
            color: variables.brandPrimary,
            marginHorizontal: 10,
            marginBottom: 10
          }}
        >
          {I18n.t("ssi.balanceAndTransaction.transactionTitle")}
        </Text>
        <FlatList
          nestedScrollEnabled={true}
          ListEmptyComponent={() => (
            <Text style={{ marginLeft: 10 }}>
              Non ci sono transazioni al momento
            </Text>
          )}
          data={transactionList}
          renderItem={({ item }) => <TransactionComponent item={item} />}
          keyExtractor={(_item, index) => index.toString()}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
          backgroundColor: "#D3EAD8"
        }}
      >
        <TouchableHighlight
          style={[button.container, button.send]}
          onPress={() => navigation.navigate(ROUTES.SSI_WALLET_SEND_SCREEN)}
        >
          <Text style={button.sendText}>
            {I18n.t("ssi.balanceAndTransaction.sendButton")}
          </Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[button.container, button.receive]}
          onPress={() => navigation.navigate(ROUTES.SSI_WALLET_RECEIVE_SCREEN)}
        >
          <Text style={button.receiveText}>
            {I18n.t("ssi.balanceAndTransaction.receiveButton")}
          </Text>
        </TouchableHighlight>
      </View>
    </TopScreenComponent>
  );
};

const loading = StyleSheet.create({
  overlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 1,
    opacity: 0.8,
    justifyContent: "center",
    height: "100%",
    width: "100%"
  }
});

const button = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5
  },
  send: {
    backgroundColor: variables.brandPrimary,
    borderColor: variables.brandPrimary,
    borderWidth: 1
  },
  receive: {
    backgroundColor: variables.colorWhite,
    borderColor: variables.brandPrimary,
    borderWidth: 1
  },
  sendText: {
    color: variables.colorWhite
  },
  receiveText: {
    color: variables.brandPrimary
  }
});

const transactionStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 10,
    padding: 20,
    borderColor: variables.brandPrimary,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    shadowOffset: {
      width: 10,
      height: 10
    },
    backgroundColor: "white",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  value: {
    marginRight: "auto",
    justifyContent: "center"
  },
  info: {
    alignItems: "flex-end"
  },
  bold: {
    fontWeight: Platform.OS === "android" ? "bold" : "600"
  },
  smMarginBottom: {
    marginBottom: 10
  }
});

interface TransactionProps {
  item: Transaction;
}

const TransactionComponent: React.FC<TransactionProps> = ({ item }) => {
  // console.log('transaction item', item)
  const userAddress = DUMMY_USER.toLowerCase();
  const userDID = new DID();
  const ethAddress = userDID.getEthAddress().toLowerCase();

  const date = new Date(item.timestamp).toLocaleDateString();
  const valueToShow = (item.value / 100).toFixed(2);

  const color = item.to.toLowerCase() === userAddress ? "green" : "red";
  return (
    <View style={transactionStyle.container}>
      <View style={transactionStyle.value}>
        <Text style={{ color }}>
          {color === "green" ? "+ " : "- "}
          {valueToShow}
        </Text>
      </View>
      <View style={transactionStyle.info}>
        <Text style={transactionStyle.smMarginBottom}>
          <Text style={transactionStyle.bold}>Data</Text>: {date}
        </Text>
        {item.to.toLocaleLowerCase() === userAddress ? (
          <Text>
            <Text style={transactionStyle.bold}>Ricevuto da</Text>:{" "}
            {`${item.addressFrom.fullname.substr(0, 13)}...`}
          </Text>
        ) : (
          <Text>
            <Text style={transactionStyle.bold}>Inviato a</Text>:{" "}
            {`${item.addressTo.fullname.substr(0, 13)}...`}
          </Text>
        )}
      </View>
    </View>
  );
};

interface BalanceProps {
  transactions: Array<Transaction>;
  symbol: Asset["symbol"] | undefined;
}

const BalanceComponent: React.FC<BalanceProps> = ({ transactions, symbol }) => {
  const userAddress = DUMMY_USER.toLowerCase();
  const userDID = new DID();
  const ethAddress = userDID.getEthAddress().toLowerCase();

  const balanceCalculation = transactions.reduce(
    (total: number, transaction) => {
      let newTotal = total; // eslint-disable-line
      if (transaction.to.toLowerCase() === userAddress) {
        return (newTotal += transaction.value);
      }

      if (transaction.from.toLowerCase() === userAddress) {
        return (newTotal -= transaction.value);
      }

      return total;
    },
    0
  );

  const finalCalculation = (balanceCalculation / 100).toFixed(2);

  return (
    <View style={balanceStyle.container}>
      <Text style={balanceStyle.title}>
        {I18n.t("ssi.balanceAndTransaction.balanceTitle")}
      </Text>
      <Text style={balanceStyle.total}>
        {finalCalculation} {symbol}
      </Text>
    </View>
  );
};

const balanceStyle = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
    shadowOffset: {
      width: 10,
      height: 10
    },
    backgroundColor: "white",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  title: {
    color: variables.colorWhite,
    backgroundColor: variables.brandPrimary,
    padding: 10
  },
  total: {
    paddingVertical: 20,
    paddingHorizontal: 10
  }
});

const mapStateToProps = (state: GlobalState) => ({
  ssiAssetList: state.ssi.ssiAssetList,
  assetSelected: state.ssi.assetSelected
});

export default connect(mapStateToProps)(SsiBalanceAndTransctionScreen);
