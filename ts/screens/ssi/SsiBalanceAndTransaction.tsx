import React from 'react'
import { View, Text, StyleSheet, FlatList, TouchableHighlight, Dimensions, Platform } from "react-native"
import { NavigationComponent } from "react-navigation";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n"
import variables from "../../theme/variables";
import ROUTES from '../../navigation/routes'


// dati per testare la parte grafica
const dummyData = [ 
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'sent'
  },
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'received'
  },
  {
    date: '20-12-1995',
    amount: 5000,
    action: 'sent'
  },
  {
    date: '20-12-1999',
    amount: 5000,
    action: 'received'
  },
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'sent'
  },
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'sent'
  },
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'sent'
  },
  {
    date: '20-12-1991',
    amount: 5000,
    action: 'sent'
  }
]

interface BalanceAndTransactionProps {
 navigation: NavigationComponent
  
}

const fontRegular = Platform.OS === 'android'? 'TitilliumWeb-Regular': 'TitilliumWeb'


const fontBold: BoldFont = Platform.OS === 'android' 
  ? { fontFamily : 'TitilliumWeb-Bold', fontWeight: 'normal'}
  : { fontFamily: 'Titillium Web', fontWeight: 'bold'} 

const SsiBalanceAndTransctionScreen: React.FC<BalanceAndTransactionProps> = ({ navigation }) => {

  return (
      <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t('ssi.balanceAndTransaction.title')}
      goBack={true}
      >
        <View style={{ flex: 1 }}>
          <Balance balance={10000} />
          <Text style={{ fontSize: variables.h5FontSize, color: variables.brandPrimary, marginHorizontal: 10, marginBottom: 10, ...fontBold}}>
            {I18n.t('ssi.balanceAndTransaction.transactionTitle')}
          </Text>
          <FlatList
            nestedScrollEnabled={true}
            data={dummyData}
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
    fontFamily:fontRegular
  },
  receiveText: {
    color: variables.brandPrimary,
    fontSize: variables.h5FontSize,
    fontFamily: fontRegular
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

  const color = item.action === 'sent' ? 'black' : 'green'
  return (
    <View style={transactionStyle.container}>
        <Text style={{ color, fontSize: variables.h5FontSize, ...fontBold}}>
          {item.action === 'sent'? '-': '+'}
          {item.amount} ETH
        </Text>
        <Text style={{ fontFamily: fontRegular }}>Data: {item.date}</Text>
    </View>
  )
}



interface BalanceProps {
  balance: number
}

const Balance: React.FC<BalanceProps> = ({ balance }) => {
  console.log(balanceStyle.title)
  return (
    <View style={balanceStyle.container}>
      <Text style={balanceStyle.title}>{I18n.t('ssi.balanceAndTransaction.balanceTitle')}</Text>
      <Text style={balanceStyle.total}>{balance} ETH</Text>
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
    fontFamily: fontRegular,
  },
  total: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    fontSize: variables.h4FontSize,
    ...fontBold
  }
})

export default SsiBalanceAndTransctionScreen
