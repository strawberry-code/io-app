/* eslint-disable functional/no-let */
import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform
} from "react-native";
import { NavigationComponent } from 'react-navigation';
import {createVerifiableCredentialJwt, Issuer} from "did-jwt-vc";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import {DidSingleton} from "../../types/DID";
import {SsiCustomGoBack} from "./components/SsiCustomGoBack";
import SingleVC from "./SsiSingleVC";
import {encodeVerifiablePresentation} from "./VerifiablePresentations";

interface Props {
  navigation: NavigationComponent;
}

const SsiSignReq: React.FC<Props> = ({ navigation }) => {
  const [VC, setVC] = useState(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('-------------------------')
  console.log('Inside SignReq Component', VC);

  useEffect(() => {
    onBoarding()
  }, []);

  const onBoarding = () => {
    const fetchedVC = navigation.state.params.data
    console.log(`[SsiSignReq]: fetchedVC from navigation: ${JSON.stringify(VC)}`)
    setVC(fetchedVC)
  }

  const signRequest = async () => {
    console.log(`firma in corso... ${VC.payload.vc.type}`)
    let {type, callback, callbackMethod, payload} = VC

    console.log('[SsiSignReq]: analizzo dati nel QR:')
    console.log(`type: ${type}\ncallbackMethod: ${callbackMethod}\ncallback: ${callback}\npayload: ${payload}\n`)

    console.log('[SsiSignReq]: ottengo issuer...')
    const issuer: Issuer = DidSingleton.getIssuer()
    console.log('[SsiSignReq]: issuer.did: ' + issuer.did)

    let vcJwt;
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

    if(vcJwt === undefined) {
      throw new Error('VC JWT could not be undefined!')
    }

    let body = JSON.stringify({"verifiablePresentation": await encodeVerifiablePresentation([vcJwt])})
    console.log(`making fetch:\nqr type: ${type}\nmethod: ${callbackMethod}\ncallback: ${callback}\nbody: ${body}`)

    setIsLoading(true);

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
        navigation.navigate(ROUTES.SSI_SUCCESS, {
          message: 'Firma della Credenziale Verificata avvenuta con successo!'
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const VCtoPass = VC ? VC.payload : undefined;

  console.log('rendered VCToPass,', VCtoPass);

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      customGoBack={<SsiCustomGoBack cb={() => navigation.navigate('SSI_HOME')} />}
    >
      <View style={{ flex: 1, justifyContent: "space-between", padding: 20 }}>
      {isLoading && (
        <View style={loading.overlay}>
          <RefreshIndicator />
        </View>
      )}
        <View style={{ justifyContent: "space-between" }}>
          <Text style={title.text}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>
        </View>

        <View>
          <SingleVC
            vCredential={VCtoPass}
            backHome={() => navigation.navigate('SSI_HOME')}
            isSigning
            signRequest={() => signRequest()}/>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableHighlight
            style={[button.container, {backgroundColor: variables.brandDanger}]}
            onPress={() => navigation.navigate(ROUTES.SSI_HOME)}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={button.container}
            onPress={() => signRequest()}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
          </TouchableHighlight>

        </View>

      </View>
    </TopScreenComponent>
  );
};

const loading = StyleSheet.create({
  overlay: {
    padding: 50,
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: variables.brandPrimary,
    zIndex: 1,
    opacity: 1,
    justifyContent: "center",
    height: "115%",
    width: "115%"
  }
});

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
