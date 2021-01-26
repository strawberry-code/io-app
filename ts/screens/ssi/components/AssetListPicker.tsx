import React, { useEffect } from "react";
import { Text, View } from "react-native";
import {
  Picker,
  Form,
  Header,
  Content,
  Container,
  Left,
  Button,
  Icon,
  Title,
  Right,
  Body
} from "native-base";
import { connect } from "react-redux";

import { DID } from "../../../types/DID";
import IconFont from "../../../components/ui/IconFont";
import variables from "../../../theme/variables";
import { GlobalState } from "../../../store/reducers/types";
import { Dispatch } from "../../../store/actions/types";
import I18n from "../../../i18n";
import { Asset } from "../types";

interface AssetListProps {
  assetList: Array<Asset>;
  assetSelected: Asset["address"];
  dispatchAssetList: Dispatch;
  dispatchAssetSelected: Dispatch;
}

const AssetListPicker: React.FC<AssetListProps> = ({
  assetList,
  assetSelected,
  dispatchAssetList,
  dispatchAssetSelected
}) => {
  const userDID = new DID();
  const ethAddress = userDID.getEthAddress();
  console.log("userDID ethAddress=", userDID.getEthAddress());

  const fetchAssetList = async () => {
    try {
      const response = await fetch(
        "https://tokenization.pub.blockchaincc.ga/api/asset/app/listassets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userAddress: "0x38c8c05E9d7Dd379924E15a2AB25348A63fC3a5"
          })
        }
      );

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }
      // sconsole.log("data from assets from API", data);
      dispatchAssetList(data.docs);
      if (!assetSelected) {
        dispatchAssetSelected(data.docs[0].address);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void fetchAssetList();
  }, []);

  const handleChangeAssets = (value: string) => {
    dispatchAssetSelected(value);
  };

  return (
    <View>
      <Text
        style={{
          marginLeft: 20,
          color: variables.brandPrimary
        }}
      >
        {I18n.locale === "it" ? "Asset configurati" : "Assets configured"}
      </Text>
      <Form>
        <Picker
          renderHeader={backAction => (
            <Header style={{ backgroundColor: variables.brandPrimary }}>
              <Left>
                <Button transparent onPress={backAction}>
                  <Icon name="arrow-back" style={{ color: "#fff" }} />
                </Button>
              </Left>
              <Body style={{ flex: 3 }}>
                <Title style={{ color: "#fff" }}>
                  {I18n.locale === "it"
                    ? "Asset configurati"
                    : "Assets configured"}
                </Title>
              </Body>
              <Right />
            </Header>
          )}
          note
          mode="dialog"
          headerBackButtonText={I18n.t("global.buttons.back")}
          iosIcon={<IconFont name="io-plus" />}
          style={{
            marginHorizontal: 10,
            width: 200
          }}
          itemStyle={{
            color: variables.brandPrimary,
            textAlign: "left"
          }}
          selectedValue={assetSelected}
          onValueChange={handleChangeAssets}
        >
          {assetList &&
            assetList.map(asset => (
              <Picker.Item
                key={asset.assetName}
                label={asset.assetName}
                value={asset.address}
              />
            ))}
        </Picker>
      </Form>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  assetList: state.ssi.ssiAssetList,
  assetSelected: state.ssi.assetSelected
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchAssetList: assetList =>
    dispatch({ type: "ADD_NEW_ASSET_LIST", payload: assetList }),
  dispatchAssetSelected: assetAddress =>
    dispatch({ type: "SELECT_ASSET", payload: assetAddress })
});

export default connect(mapStateToProps, mapDispatchToProps)(AssetListPicker);
