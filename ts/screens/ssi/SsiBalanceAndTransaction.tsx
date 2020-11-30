import React, { useState, useEffect} from 'react'
import { View, Text, StyleSheet, FlatList, TouchableHighlight, Dimensions, Platform, TextStyle } from "react-native"
import { Picker, Form } from 'native-base';
import { NavigationComponent } from "react-navigation";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n"
import variables from "../../theme/variables";
import ROUTES from '../../navigation/routes'


// dati per testare la parte grafica
const dummyData = [
      {
        "id": 12,
        "txHash": "0xef61ef7f277e2e35d7d99fdf5dcfe2960959355642d918d96cd9c1df13780d0d",
        "assetAddress": "0x46b90b4ea1095fb20d685bae5e3f20863272a403",
        "from": "0xcda96362caeea9d1745a5fe5b2765f62e9585ad9",
        "to": "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54",
        "value": 20000,
        "timestamp": 1604329039,
        "addressFrom": {
          "orgId": 7,
          "userId": null,
          "fullname": "Regione Lombardia"
        },
        "addressTo": {
          "orgId": 4,
          "userId": null,
          "fullname": "Denarius Owner"
        }
      },
      {
        "id": 10,
        "txHash": "0xb66b72490ce3069e52a3b2f565f2398bea9caefefa0dd6cc63bbf43f400bccd0",
        "assetAddress": "0x46b90b4ea1095fb20d685bae5e3f20863272a403",
        "from": "0xcda96362caeea9d1745a5fe5b2765f62e9585ad9",
        "to": "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54",
        "value": 10000,
        "timestamp": 1604328979,
        "addressFrom": {
          "orgId": 7,
          "userId": null,
          "fullname": "Regione Lombardia"
        },
        "addressTo": {
          "orgId": 4,
          "userId": null,
          "fullname": "Denarius Owner"
        }
      },
      {
        "id": 5,
        "txHash": "0x5dc09450d7b79aea266828f89827de021144018f4cb2114e68aee99556f8cc80",
        "assetAddress": "0x46b90b4ea1095fb20d685bae5e3f20863272a403",
        "from": "0x0000000000000000000000000000000000000000",
        "to": "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54",
        "value": 100000,
        "timestamp": 1604319259,
        "addressFrom": {
          "orgId": null,
          "userId": null,
          "fullname": "0x0000000000000000000000000000000000000000"
        },
        "addressTo": {
          "orgId": 4,
          "userId": null,
          "fullname": "Denarius Owner"
        }
      },
      {
        "id": 4,
        "txHash": "0x2606f5ca2c421a12a9421b4196dcd3af17aa3119f9b21a204561d1edfeb6dc10",
        "assetAddress": "0x46b90b4ea1095fb20d685bae5e3f20863272a403",
        "from": "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54",
        "to": "0xb3ea39eeac4015c6e8e716052f6897a08d384321",
        "value": 10000,
        "timestamp": 1604319199,
        "addressFrom": {
          "orgId": 4,
          "userId": null,
          "fullname": "Denarius Owner"
        },
        "addressTo": {
          "orgId": null,
          "userId": null,
          "fullname": "0xb3ea39eeac4015c6e8e716052f6897a08d384321"
        }
      },
      {
        "id": 3,
        "txHash": "0x7fbd8370a90e0cec2c9d8a83c23ef305fe8c86f31b2f676cc5d5668e5fc39c91",
        "assetAddress": "0x46b90b4ea1095fb20d685bae5e3f20863272a403",
        "from": "0x0000000000000000000000000000000000000000",
        "to": "0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54",
        "value": 100000,
        "timestamp": 1604319049,
        "addressFrom": {
          "orgId": null,
          "userId": null,
          "fullname": "0x0000000000000000000000000000000000000000"
        },
        "addressTo": {
          "orgId": 4,
          "userId": null,
          "fullname": "Denarius Owner"
        }
      }
]

interface BalanceAndTransactionProps {
 navigation: NavigationComponent
  
}

/*
const fontRegular = Platform.OS === 'android'? 'TitilliumWeb-Regular': 'TitilliumWeb'


const fontBold: TextStyle = Platform.OS === 'android' 
  ? { fontFamily : 'TitilliumWeb-Bold', fontWeight: 'normal'}
  : { fontFamily: 'Titillium Web', fontWeight: 'bold'}
 */

const SsiBalanceAndTransctionScreen: React.FC<BalanceAndTransactionProps> = ({ navigation }) => {

  const [ assets, setAssets ] = useState([])
  const [ transactionList, setTransactionList ] = useState([])
  const [ selected, setSelected ] = useState(undefined)

  const fetchAssets = async () => {
    try {
      const response = await fetch('http://localhost:10000/api/asset/app/listassets', {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userAddress: '0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54'})
      });
      const data = await response.json();
      setSelected(data.docs[0]);
      setAssets(assets.concat(data.docs));
    } catch (e) {
      console.log(e);
    }
  }

  const fetchTransactionList = async(assetAddress: string) => {
    try {
      const response = await fetch(`http://localhost:10000/api/transaction/app/list/${assetAddress}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userAddress: '0x5b9839858b38c3bf19811bcdbec09fb95a4e6b54'})
      });
      const data = await response.json();
      setTransactionList(transactionList.concat(data.docs));
    } catch (e) {
      console.log(e);
    }
  } 

  const handleChangeAssets = (value: string) => {
    setSelected(value)
    void fetchTransactionList(value);
  }

  useEffect(() => {
    void fetchAssets()
  }, [])

  return (
      <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t('ssi.balanceAndTransaction.title')}
      goBack={true}
      >
        <View style={{ flex: 1 }}>
        <Text style={{ fontSize: variables.h3FontSize, marginLeft: 20}}>Asset Selection</Text>
        <Form>
            <Picker
              note
              mode="dropdown"
              style={{ marginHorizontal: 10 }}
              selectedValue={selected}
              onValueChange={handleChangeAssets}
            >
              {
                assets &&
                assets.map(asset => (
                  <Picker.Item key={asset.assetName} label={asset.assetName} value={asset.address} />
                ))
              }
            </Picker>
        </Form>

          <Balance balance={10000} symbol={'PwC'}/>
          <Text style={{ fontSize: variables.h5FontSize, color: variables.brandPrimary, marginHorizontal: 10, marginBottom: 10}}>
            {I18n.t('ssi.balanceAndTransaction.transactionTitle')}
          </Text>
          <FlatList
            nestedScrollEnabled={true}
            ListEmptyComponent={() => <Text>Non ci sono transazioni al momento</Text>}
            data={transactionList}
            renderItem={({item}) => <Transaction item={item} />}
            keyExtractor={(_item, index) => index.toString()}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: "#D3EAD8"}}>
          <TouchableHighlight style={[button.container, button.send]} onPress={() => navigation.navigate(ROUTES.SSI_WALLET_SEND_SCREEN)} >
            <Text style={button.sendText}>{I18n.t('ssi.balanceAndTransaction.sendButton')}</Text>
          </TouchableHighlight>
            <TouchableHighlight style={[button.container, button.receive]} onPress={() => navigation.navigate(ROUTES.SSI_WALLET_RECEIVE_SCREEN)}>
              <Text style={button.receiveText}>{I18n.t('ssi.balanceAndTransaction.receiveButton')}</Text>
            </TouchableHighlight>
          </View>
        </TopScreenComponent>
    )
  }

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
    fontFamily:variables.fontFamily
  },
  receiveText: {
    color: variables.brandPrimary,
    fontSize: variables.h5FontSize,
    fontFamily: variables.fontFamily
  }
})

const transactionStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
})

interface TransactionProps {
  item: {
    date: string
    amount: number
    action: 'received' | 'sent'
  }
}

const Transaction: React.FC<TransactionProps> = ({ item }) => {
  console.log('dummy', item)
  const color = item.action === 'sent' ? 'black' : 'green'
  return (
    <View style={transactionStyle.container}>
        <Text style={{ color, fontSize: variables.h5FontSize}}>
          {item['value']} 
        </Text>
        <Text style={{ fontFamily: variables.fontFamily }}>Data: {item.date}</Text>
    </View>
  )
}



interface BalanceProps {
  balance: number,
  symbol: string
}

const Balance: React.FC<BalanceProps> = ({ balance, symbol }) => {
  console.log(balanceStyle.title)
  return (
    <View style={balanceStyle.container}>
      <Text style={balanceStyle.title}>{I18n.t('ssi.balanceAndTransaction.balanceTitle')}</Text>
  <Text style={balanceStyle.total}>{balance} {symbol}</Text>
    </View>
  )
}


const balanceStyle = StyleSheet.create({
  container: {
    overflow: 'hidden',
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
    padding: 10,
  },
  total: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    fontSize: variables.h4FontSize,
  }
})

export default SsiBalanceAndTransctionScreen
