import { Buffer } from "buffer";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  TextInput,
  TouchableOpacity,
  Modal
} from "react-native";
import { Form, Item, Label } from "native-base";
import { ethers } from "ethers";
import { connect } from "react-redux";
import { NavigationComponent } from "react-navigation";

import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import { DID } from "../../types/DID";
import AssetListPicker from "./components/AssetListPicker";
import { SsiCustomGoBack } from "./components/SsiCustomGoBack";
import { Asset } from "./types";

const DUMMY_USER_2 = {
  address: "0x5b9839858b38c3bF19811bcdbEC09Fb95a4e6B54",
  privateKey: "84a70b263aa545e0f2cfb6cff58380ee3fb761970c1b2ab19461270be4c3f39d"
};

const DUMMY_USER_3 = {
  address: "0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a51",
  privateKey: "d603b3993036898349156db1b63143c18193d6c93b20ced4f0817cf7f87662d2"
};

const DUMMY_USER = {
  address: "0x7506f0045F03cC82c73341A45f190ab9A1a85A93",
  privateKey: "adac18e2cb203dde7ee4691de0a6d8fb22ca57982cabd334f4bac403794159c2"
};

interface CreateTXObject {
  userObject: {
    address: string;
    privateKey: string;
  };
  assetObject: Asset;
  amountToSend: string;
  recipientAddress: string;
}

interface Props {
  navigation: NavigationComponent;
  assetList: Array<Asset>;
  assetSelected: Asset["address"];
}

const SsiWalletSendScreen: React.FC<Props> = ({
  navigation,
  assetList,
  assetSelected
}) => {
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");

  // TRANSACTION LOADING STATE MANAGEMENT
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    "Transazione non riuscita"
  );
  const [transactionResult, setTransactionResult] = useState<
    "error" | "completed" | ""
  >("");

  useEffect(() => {
    console.log("inside useEffect");
    if (!navigation.state.params || !navigation.state.params.action) {
      return;
    }
    console.log("navigation state inside useEffect", navigation.state);
    const {
      action: navigationAction,
      data: navigationData
    } = navigation.state.params;

    if (navigationAction === "SSI_WALLET_RECIPIENT_SCANNED" && navigationData) {
      setRecipient(navigationData);
    }
  }, [navigation.state.params]);

  const userDID = new DID();
  const user = {
    address: userDID.getEthAddress(),
    privateKey: userDID.getPrivateKey()
  };

  const assetObjectSelected: Asset | undefined = assetList.find(
    a => a.address === assetSelected
  );

  // Oggetto che viene passato nella funzione createRawTx
  const createTxObject: CreateTXObject = {
    userObject: user,
    recipientAddress: recipient,
    assetObject: assetObjectSelected,
    amountToSend: amount
  };

  const createRawTx = async ({
    userObject,
    recipientAddress,
    amountToSend,
    assetObject
  }: CreateTXObject) => {
    console.log("assetSelected", assetObject.symbol);
    console.log("amount", amount);
    console.log("recipient", recipientAddress);
    const amount = parseFloat(amountToSend) * 100;

    setModalVisible(true);
    setIsLoading(true);
    setLoadingMessage("Creando la transazione");

    try {
      const responseOne = await fetch(
        `https://tokenization.pub.blockchaincc.ga/api/user/app/createRawTx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount,
            userAddress: userObject.address.toLowerCase(),
            addressTo: recipientAddress,
            assetAbi: assetObject.abi,
            assetAddress: assetObject.address
          })
        }
      );

      if (responseOne.status !== 200) {
        throw new Error(`Something went wrong: ${responseOne}`);
      }
      setLoadingMessage("Firmando la transazione");

      const unsignedTx = await responseOne.json();
      console.log("response data", unsignedTx);

      const { gas: gasLimit, ...restUnsignedTx } = unsignedTx;

      const ethersFormatTx = {
        ...restUnsignedTx,
        gasLimit
      };

      console.log("ethersTx", ethersFormatTx);

      const privateKey = Buffer.from(userObject.privateKey, "hex");
      console.log("privateKey", privateKey); // --> {{qui recuperiamo la priv Key dell'utente che per esigenze di testing possiamo aggiungere momentaneamente al Dummy_user facendolo diventare un oggetto con 2 proprietà: address e privKey}}

      const wallet = new ethers.Wallet(privateKey);
      console.log("wallet.address", wallet.address);

      const signedTx = await wallet.signTransaction(ethersFormatTx);
      console.log("signedTx", signedTx);

      setLoadingMessage("Inviando la transazione");
      const responseTwo = await fetch(
        `https://tokenization.pub.blockchaincc.ga/api/user/app/sendTx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount,
            signedTx,
            userAddress: userObject.address.toLowerCase(),
            addressTo: recipientAddress,
            assetAbi: assetObject.abi,
            assetAddress: assetObject.address
          })
        }
      );

      if (responseTwo.status !== 200) {
        throw new Error(`Something went wrong: ${responseTwo}`);
      }

      const dataTwo = await responseTwo.json();
      console.log("responseTwo", dataTwo);

      if (dataTwo.status) {
        setIsLoading(false);
        setLoadingMessage("Transazione effettuata");
        setTransactionResult("completed");
      }
    } catch (e) {
      console.error("Error: ", e);

      setIsLoading(false);
      setLoadingMessage("Transazione non riuscita");
      setTransactionResult("error");
    }
  };

  const handleAmount = (text: string) => {
    const textValue = text.replace(",", ".");
    console.log("target", textValue);
    const number = parseFloat(textValue).toFixed(2);
    if (+number < 0) {
      alert("Si accettano solo numeri positivi");
    }
    setAmount(number);
    console.log("number", number);
  };

  const handleRecipient = (text: string) => {
    setRecipient(text);
  };

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      customGoBack={
        <SsiCustomGoBack cb={() => navigation.navigate("SSI_HOME")} />
      }
    >
      <View style={{ flex: 1, justifyContent: "space-between", padding: 20 }}>
        <View style={{ justifyContent: "space-between" }}>
          <Text style={title.text}>Invia dal Wallet</Text>
        </View>

        <View>
          <AssetListPicker />
          <Form>
            <Item stackedLabel>
              <Label
                style={{
                  color: variables.brandPrimary,
                  fontSize: 20
                }}
              >
                Inviare a:
              </Label>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  onChangeText={handleRecipient}
                  style={{
                    fontSize: variables.fontSizeBase,
                    width: "80%"
                  }}
                  value={recipient}
                />
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE, {
                      action: "SSI_WALLET_SCAN_RECIPIENT"
                    })
                  }
                  style={{ width: "20%", marginLeft: 20 }}
                >
                  <IconFont
                    name="io-qr"
                    color={variables.brandPrimary}
                    size={30}
                  />
                </TouchableOpacity>
              </View>
            </Item>
            <Item stackedLabel>
              <Label style={{ color: variables.brandPrimary, fontSize: 20 }}>
                Importo
              </Label>
              <TextInput
                onChangeText={handleAmount}
                keyboardType="number-pad"
                placeholder="0"
                style={{ width: "100%", fontSize: variables.fontSizeBase }}
              />
            </Item>
          </Form>
        </View>

        <TouchableHighlight
          style={button.container}
          onPress={() => {
            if (!recipient || !amount || !assetSelected) {
              alert("Devi compilare tutti i campi");
              return;
            }
            void createRawTx(createTxObject);
          }}
        >
          <Text style={button.text}>
            {I18n.t("ssi.balanceAndTransaction.sendButton")}
          </Text>
        </TouchableHighlight>
      </View>
      <Modal visible={modalVisible}>
        <View style={modal.bg}>
          <View style={modal.card}>
            <Text style={modal.loadingStateText}>{loadingMessage}</Text>
            {transactionResult === "error" && (
              <IconFont
                name="io-error"
                size={70}
                color={variables.brandDanger}
              />
            )}
            {transactionResult === "completed" && (
              <IconFont
                name="io-complete"
                size={70}
                color={variables.brandPrimary}
              />
            )}
            {isLoading && <RefreshIndicator />}
            {!isLoading && (
              <TouchableOpacity
                style={button.container}
                onPress={() => setModalVisible(false)}
              >
                <Text style={button.text}>Chiudi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </TopScreenComponent>
  );
};

const modal = StyleSheet.create({
  bg: {
    backgroundColor: variables.brandPrimary,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    backgroundColor: variables.colorWhite,
    width: "80%",
    height: "50%",
    borderRadius: 5,
    alignItems: "center",
    padding: 30,
    justifyContent: "space-evenly"
  },
  loadingStateText: {
    fontSize: variables.h4FontSize,
    color: variables.colorBlack,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal",
    textAlign: "center"
  },
  cardLoading: {
    justifyContent: "space-between"
  },
  cardNotLoading: {
    justifyContent: "space-evenly"
  }
});

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

const mapStateToProps = (state: GlobalState) => ({
  assetList: state.ssi.ssiAssetList,
  assetSelected: state.ssi.assetSelected
});
export default connect(mapStateToProps)(SsiWalletSendScreen);
