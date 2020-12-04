import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";
import { Form, Item, Input, Label } from "native-base";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import AssetListPicker from "./components/AssetListPicker";
import {SsiCustomGoBack} from "./components/SsiCustomGoBack";
import SingleVC from "./SsiSingleVC";
import {createVerifiableCredentialJwt, Issuer} from "did-jwt-vc";
import {DidSingleton} from "../../types/DID";

const SsiSignReq: React.FC = ({ navigation }) => {
  const [selected, setSelected] = useState(undefined);
  const [VC, setVC] = useState(undefined)

  useEffect(() => {
    onBoarding()
  });

  let onBoarding = () => {
    let VC = navigation.state.params.data
    console.log(`[SsiSignReq]: VC from navigation: ${JSON.stringify(VC)}`)
    setVC(VC)
  }

  let signRequest = async () => {
    console.log(`firma in corso... ${VC.payload.vc.type}`)
    let {type, callback, callbackMethod, payload} = VC

    console.log('[SsiSignReq]: analizzo dati nel QR:')
    console.log(`type: ${type}\ncallbackMethod: ${callbackMethod}\ncallback: ${callback}\npayload: ${payload}\n`)

    console.log('[SsiSignReq]: ottengo issuer...')
    const issuer: Issuer = DidSingleton.getIssuer()
    console.log('[SsiSignReq]: issuer.did: ' + issuer.did)

    let vcJwt
    try {
      console.log('payload: ' + JSON.stringify(payload))
      console.log('issuer: ' + JSON.stringify(issuer))
      console.log('address: ' + JSON.stringify(DidSingleton.getEthAddress()))
      console.log('private key: ' + JSON.stringify(DidSingleton.getPrivateKey()))
      console.log('public key: ' + JSON.stringify(DidSingleton.getPublicKey()))
      vcJwt = await createVerifiableCredentialJwt(payload, issuer)
      console.log('signed token: ' + vcJwt)
    } catch (e) {
      console.log(e)
      alert('codice type QR è sbagliato')
    }

    let body = JSON.stringify({"verifiableCredential": vcJwt})
    console.log(`making fetch:\nqr type: ${type}\nmethod: ${callbackMethod}\ncallback: ${callback}\nbody: ${body}`)


    fetch(callback, {
      method: callbackMethod.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      customGoBack={<SsiCustomGoBack cb={() => navigation.navigate('SSI_HOME')} />}
    >
      <View style={{ flex: 1, justifyContent: "space-between", padding: 20 }}>
        <View style={{ justifyContent: "space-between" }}>
          <Text style={title.text}>Vuoi firmare questa VC? (da tradurre)</Text>
        </View>

        <View>
          <Text>{VC ? JSON.stringify(VC.payload.vc) : undefined}</Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableHighlight
            style={[button.container, {backgroundColor: variables.brandDanger}]}
            onPress={() => navigation.navigate('SSI_HOME')}
          >
            <Text style={button.text}>Non firmare</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={button.container}
            onPress={() => signRequest()}
          >
            <Text style={button.text}>Firma</Text>
          </TouchableHighlight>

        </View>

      </View>
    </TopScreenComponent>
  );
};

const button = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: '10%',
    margin: 10,
    width: 'auto',
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

export default SsiSignReq;
