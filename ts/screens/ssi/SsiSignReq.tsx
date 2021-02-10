/* eslint-disable functional/no-let */
import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform, ActivityIndicator
} from "react-native";
import {NavigationComponent} from 'react-navigation';
import {createVerifiableCredentialJwt, Issuer} from "did-jwt-vc";

import {connect} from "react-redux";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import {RefreshIndicator} from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import {DidSingleton} from "../../types/DID";
import {setSsiAccessToken} from "../../utils/keychain";
import {GlobalState} from "../../store/reducers/types";
import {notificationsInstallationSelector} from "../../store/reducers/notifications/installation";
import IconFont from "../../components/ui/IconFont";
import {SsiCustomGoBack} from "./components/SsiCustomGoBack";
import SingleVC from "./SsiSingleVC";
import {encodeVerifiablePresentation} from "./VerifiablePresentations";
import NetCode from "./NetCode";

interface NavigationProps {
  navigation: NavigationComponent;
}

type Props = NavigationProps & ReturnType<typeof mapStateToProps>;

const SsiSignReq: React.FC<Props> = ({navigation, notificationToken}) => {
  const [VC, setVC] = useState(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('-------------------------');
  console.log('Inside SignReq Component', VC);

  useEffect(() => {
    onBoarding();
  }, []);

  const onBoarding = () => {
    const fetchedVC = navigation.state.params.data;
    console.log(`[SsiSignReq]: fetchedVC from navigation: ${JSON.stringify(VC)}`);
    setVC(fetchedVC);
  };

  const signRequest = async () => {
    console.log(`firma in corso... ${VC.payload.vc.type}`);
    const {type, callback, callbackMethod, payload} = VC;

    console.log('[SsiSignReq]: analizzo dati nel QR:');
    console.log(`type: ${type}\ncallbackMethod: ${callbackMethod}\ncallback: ${callback}\npayload: ${payload}\n`);

    console.log('[SsiSignReq]: ottengo issuer...');
    const issuer: Issuer = DidSingleton.getIssuer();
    console.log('[SsiSignReq]: issuer.did: ' + issuer.did);

    let vcJwt;
    try {
      console.log('payload: ' + JSON.stringify(payload));
      console.log('issuer: ' + JSON.stringify(issuer));
      console.log('address: ' + JSON.stringify(DidSingleton.getEthAddress()));
      console.log('private key: ' + JSON.stringify(DidSingleton.getPrivateKey()));
      console.log('public key: ' + JSON.stringify(DidSingleton.getPublicKey()));
      vcJwt = await createVerifiableCredentialJwt(payload, issuer);
      console.log('signed token: ' + vcJwt);
    } catch (e) {
      console.log(e);
      alert('codice type QR è sbagliato');
    }

    if (vcJwt === undefined) {
      throw new Error('VC JWT could not be undefined!');
    }

    const body = {"verifiablePresentation": await encodeVerifiablePresentation([vcJwt])};
    console.log(`making fetch:\nqr type: ${type}\nmethod: ${callbackMethod}\ncallback: ${callback}\nbody: ${body}`);

    try {
      setIsLoading(true);
      
      const result = await NetCode.doAuthenticatedCallbackUrlFromQr({body, url: callback, method: callbackMethod});
      
      if (result) {
        navigation.navigate(ROUTES.SSI_SUCCESS, {
          message: 'Credential signed successfully!'
        });
      } else {
        navigation.navigate(ROUTES.SSI_FAILURE, {
          message: 'Error occurred: Credential could not be signed'
        });      
      }
  
      setIsLoading(false);
    } catch (error) {
      console.log(error)
      navigation.navigate(ROUTES.SSI_FAILURE, {
          message: error.message
        });  
    }
    
    




    /*
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
        if(data.access_token) {
          setSsiAccessToken(data.access_token)
          console.log(`[SsiSignReq][signRequest] success: è stato salvato l'access token di ssi nel keychain del device`)
        } else {
          console.log(`[SsiSignReq][signRequest] errored: impossibile ottenere il token di accesso, i dati della risposta sono ${JSON.stringify(data)}`)
        }
        setIsLoading(false)
        navigation.navigate(ROUTES.SSI_SUCCESS, {
          message: 'Firma della Credenziale Verificata avvenuta con successo!'
        });
      })
      .catch((error) => {
        setIsLoading(false)
        console.error('Error:', error);
      });
     */
  };

  const VCtoPass = VC ? VC.payload : undefined;

  console.log('rendered VCToPass,', VCtoPass);

  return (
    <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      customGoBack={<SsiCustomGoBack cb={() => navigation.navigate('SSI_HOME')}/>}
    >
      <View style={{flex: 1, justifyContent: "space-between", padding: 20}}>
        {isLoading && (
          <View style={loading.overlay}>
            <View style={{alignItems: 'center'}}>
              <IconFont
                name="quill"
                size={35}
                color={variables.colorWhite}
              />
              <Text style={{
                fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
                fontSize: 20,
                paddingVertical: 20,
                color: variables.colorWhite
              }}>{I18n.t('ssi.signing')}</Text>
            </View>
            <View style={{
              paddingVertical: 50
            }}>
              <ActivityIndicator color={'light'} size={Platform.OS === 'android' ? 24 : "large"}/>
            </View>

          </View>
        )}
        <View style={{justifyContent: "space-between"}}>
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


const mapStateToProps = (state: GlobalState) => ({
  notificationToken: notificationsInstallationSelector(state).token,
});

export default connect(mapStateToProps)(SsiSignReq);
