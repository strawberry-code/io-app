/* eslint-disable no-console */
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
import { NavigationScreenPro, NavigationScreenPropsps } from "react-navigation";

import {
  sessionTokenSelector,
  grantTokenSelector
} from "../../store/reducers/authentication";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import { DID } from "../../types/DID";
import { apiTokenizationPrefix } from "../../config";
import AssetListPicker from "./components/AssetListPicker";
import { SsiCustomGoBack } from "./components/SsiCustomGoBack";
import { Asset } from "./types";

interface CreateTXObject {
  userObject: {
    address: string;
    privateKey: string;
  };
  assetObject: Asset;
  amountToSend: string;
  recipientAddress: string;
}

type Props = ReturnType<typeof mapStateToProps> & NavigationScreenProps;

const SsiWalletSendScreen: React.FC<Props> = ({
  navigation,
  assetList,
  assetSelected,
  sessionToken,
  grantToken
}) => {
  const [amount, setAmount] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");

  // TRANSACTION LOADING STATE MANAGEMENT
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
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
    const amount = parseFloat(amountToSend) * 100;
    console.log("assetSelected", assetObject.symbol);
    console.log("amount", amount);
    console.log("recipient", recipientAddress);

    setModalVisible(true);
    setIsLoading(true);
    setLoadingMessage(I18n.t("ssi.sendFromWallet.creatingTransaction"));

    try {
      const responseOne = await fetch(
        `${apiTokenizationPrefix}/api/user/app/createRawTx`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            AuthorizationGrant: `Bearer ${grantToken}`,
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
        throw new Error(
          `Something went wrong in creatingTx: ${JSON.stringify(
            await responseOne.json().message
          )}`
        );
      }
      setLoadingMessage(I18n.t("ssi.sendFromWallet.signingTransaction"));

      const unsignedTx = await responseOne.json();
      console.log("response data", unsignedTx);

      const { gas: gasLimit, ...restUnsignedTx } = unsignedTx;

      const ethersFormatTx = {
        ...restUnsignedTx,
        gasLimit
      };

      console.log("ethersTx", ethersFormatTx);

      const privateKey = Buffer.from(userObject.privateKey, "hex");
      console.log("privateKey", privateKey);

      const wallet = new ethers.Wallet(privateKey);
      console.log("wallet.address", wallet.address);

      const signedTx = await wallet.signTransaction(ethersFormatTx);
      console.log("signedTx", signedTx);

      setLoadingMessage(I18n.t("ssi.sendFromWallet.sendingTransaction"));
      const responseTwo = await fetch(
        `${apiTokenizationPrefix}/api/user/app/sendTx`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            AuthorizationGrant: `Bearer ${grantToken}`,
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
        throw new Error(
          `Something went wrong in SignigTx: ${JSON.stringify(
            await responseTwo.json().message
          )}`
        );
      }

      const dataTwo = await responseTwo.json();
      console.log("responseTwo", dataTwo);

      if (dataTwo.status) {
        setIsLoading(false);
        setLoadingMessage(I18n.t("ssi.sendFromWallet.completedTransaction"));
        setTransactionResult("completed");
      }
    } catch (e) {
      console.error("Error: ", e);

      setIsLoading(false);
      setLoadingMessage(I18n.t("ssi.sendFromWallet.errorTransaction"));
      setTransactionResult("error");
    }
  };

  const handleAmount = (text: string) => {
    const textValue = text.replace(",", ".");
    console.log("target", textValue);
    const number = parseFloat(textValue).toFixed(2);
    if (+number < 0) {
      alert("We accept only positive numbers");
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
          <Text style={title.text}>{I18n.t("ssi.sendFromWallet.title")}</Text>
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
                {I18n.t("ssi.sendFromWallet.sendToLabel")}
              </Label>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  onChangeText={handleRecipient}
                  style={{
                    fontSize: variables.fontSizeBase,
                    width: "80%"
                  }}
                  returnKeyType="done"
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
                {I18n.t("ssi.sendFromWallet.amount")}
              </Label>
              <TextInput
                onChangeText={handleAmount}
                keyboardType="number-pad"
                placeholder="0"
                returnKeyType="done"
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
            setTimeout(() => {
              setRecipient("");
              setAmount("");
            }, 500);
            navigation.navigate(ROUTES.SSI_WALLET_BALANCE_AND_TRANSACTION);
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
                style={{ height: 75 }}
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
  assetSelected: state.ssi.assetSelected,
  sessionToken: sessionTokenSelector(state),
  grantToken: grantTokenSelector(state)
});
export default connect(mapStateToProps)(SsiWalletSendScreen);
