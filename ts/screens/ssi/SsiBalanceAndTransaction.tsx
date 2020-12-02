import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableHighlight,
  Dimensions,
  Platform,
  TextStyle
} from "react-native";
import { Picker, Form } from "native-base";
import { NavigationComponent } from "react-navigation";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import IconFont from "../../components/ui/IconFont";
import { Transaction, Asset } from "./types";

/* Dummy Users
 "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54"
 '0x7506f0045f03cc82c73341a45f190ab9a1a85a93'
  0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a51
*/
const DUMMY_USER = "0x7506f0045f03cc82c73341a45f190ab9a1a85a93".toLowerCase();

interface BalanceAndTransactionProps {
  navigation: NavigationComponent;
}

/*
const fontRegular = Platform.OS === 'android'? 'TitilliumWeb-Regular': 'TitilliumWeb'


const fontBold: TextStyle = Platform.OS === 'android' 
  ? { fontFamily : 'TitilliumWeb-Bold', fontWeight: 'normal'}
  : { fontFamily: 'Titillium Web', fontWeight: 'bold'}
 */

const SsiBalanceAndTransctionScreen: React.FC<BalanceAndTransactionProps> = ({
  navigation
}) => {
  const [assets, setAssets] = useState<Array<Asset>>([]);
  const [transactionList, setTransactionList] = useState<Array<Transaction>>([]); // prettier-ignore
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setisLoading] = useState<boolean>(true);

  // console.log('assetList=', assets)
  //  console.log("transactionList=", transactionList);

  const fetchAssets = async () => {
    setisLoading(true);
    try {
      const response = await fetch(
        "https://tokenization.pub.blockchaincc.ga/api/asset/app/listassets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userAddress: DUMMY_USER
          })
        }
      );

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data);
      }

      console.log("data from assets from API", data);
      setAssets(data.docs);
      setSelectedAsset(data.docs[0].address);
    } catch (e) {
      console.error(e);
    }
    setisLoading(false);
  };

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
            userAddress: DUMMY_USER
          })
        }
      );
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data);
      }

      console.log("data from transactionList from API", data);
      setTransactionList(data.docs);
    } catch (e) {
      console.error(e);
    }
    setisLoading(false);
  };

  useEffect(() => {
    console.log("called fetch assets");
    void fetchAssets();
  }, []);

  useEffect(() => {
    console.log("called fetch transactionList");
    void fetchTransactionList(selectedAsset);
  }, [selectedAsset]);

  const handleChangeAssets = (value: string) => {
    setSelectedAsset(value);
  };

  const assetChosen = assets.find(asset => asset.address === selectedAsset);

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
        <Text style={{ fontSize: variables.h5FontSize, marginLeft: 20 }}>
          Asset Selection
        </Text>
        <Form>
          <Picker
            note
            mode="dialog"
            iosIcon={<IconFont name="io-plus" />}
            textStyle={{ fontFamily: "Titillium Web" }}
            style={{ marginHorizontal: 10, width: 200 }}
            itemStyle={{
              color: "red",
              fontFamily: "Titillium Web",
              fontSize: 50,
              backgroundColor: "green",
              textAlign: "left"
            }}
            selectedValue={selectedAsset}
            onValueChange={handleChangeAssets}
          >
            {assets &&
              assets.map(asset => (
                <Picker.Item
                  key={asset.assetName}
                  label={asset.assetName}
                  value={asset.address}
                />
              ))}
          </Picker>
        </Form>

        <BalanceComponent
          transactions={transactionList}
          symbol={assetChosen?.symbol}
        />
        <Text
          style={{
            fontSize: variables.h5FontSize,
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
            <Text style={{ fontSize: variables.fontSizeBase, marginLeft: 10 }}>
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
    color: variables.colorWhite,
    fontSize: variables.h4FontSize,
    fontFamily: variables.fontFamily
  },
  receiveText: {
    color: variables.brandPrimary,
    fontSize: variables.h5FontSize,
    fontFamily: variables.fontFamily
  }
});

const transactionStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 10,
    padding: 30,
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
  }
});

interface TransactionProps {
  item: Transaction;
}

const TransactionComponent: React.FC<TransactionProps> = ({ item }) => {
  // console.log('transaction item', item)
  const userAddress = DUMMY_USER;

  const date = new Date(item.timestamp).toLocaleDateString();
  const valueToShow = (item.value / 100).toFixed(2);

  const color = item.to === userAddress ? "green" : "black";
  return (
    <View style={transactionStyle.container}>
      <Text style={{ color, fontSize: variables.h5FontSize }}>
        {color === "green" ? "+ " : "- "}
        {valueToShow}
      </Text>
      <Text style={{ fontFamily: variables.fontFamily }}>Data: {date}</Text>
    </View>
  );
};

interface BalanceProps {
  transactions: Array<Transaction>;
  symbol: Asset["symbol"] | undefined;
}

const BalanceComponent: React.FC<BalanceProps> = ({ transactions, symbol }) => {
  const userAddress = DUMMY_USER;

  const balanceCalculation = transactions.reduce(
    (total: number, transaction) => {
      let newTotal = total; // eslint-disable-line
      if (transaction.to === userAddress) {
        return (newTotal += transaction.value);
      }

      if (transaction.from === userAddress) {
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
    fontSize: variables.h2FontSize,
    color: variables.colorWhite,
    backgroundColor: variables.brandPrimary,
    padding: 10
  },
  total: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    fontSize: variables.h4FontSize
  }
});

export default SsiBalanceAndTransctionScreen;
