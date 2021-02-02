import React, { useState } from 'react'
import { View, Text, TouchableOpacity, GestureResponderEvent, StyleSheet, Platform } from "react-native"
import { NavigationComponent } from 'react-navigation'

import { JwtCredentialPayload } from "did-jwt-vc/src/types"
import I18n from "../../i18n";
import variables from "../../theme/variables"
import IconFont from "../../components/ui/IconFont";
import SingleVCModal from './components/SingleVCInfoModal';



interface IdentityCard extends JwtCredentialPayload {
  vc : JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'IdentityCard']
    credentialSubject: {
        firstName: string
        lastName : string
    }
  }
  select?: boolean;   
}

interface DimensioneImpresa extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'DimensioneImpresa']
    credentialSubject: {
      piva : string
      indirizzoSedeLegale : string
      eleggibilita: string
      ragioneFiscale: string
      expirationDate: string
    }
  }
  select?: boolean;   
}

interface BachelorDegree extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'BachelorDegree']
    credentialSubject: {
      type: string
      dateOfAchievement: string
    }
  }
  select?: boolean;   
}

interface MasterDegree extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'MasterDegree']
    credentialSubject: {
      type: string
      dateOfAchievement: string
    }
  }
  select?: boolean;   
}

interface DeMinimis extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'DeMinimis']
    credentialSubject: {
      ragioneFiscale: string
      piva: string
      indirizzoSedeLegale: string
      eleggibilita: string
      expirationDate: string
    }
  }
  select?: boolean;  
}
interface CartaIdentita extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'CartaIdentita'];
    credentialSubject: {
      id: string;
      firtName: string;
      lastName: string;
      birthday: string;
      placeOfBirth: string;
    }
  }
  select?: boolean;  
}


export type VCType = IdentityCard | DimensioneImpresa | BachelorDegree | MasterDegree | DeMinimis | CartaIdentita;

interface Props {
  vCredential: VCType;
  onPress?:(event: GestureResponderEvent) => void
  backHome?: NavigationComponent;
  isSigning?: boolean;
  signRequest?: () => void;
}


const SingleVC: React.FC<Props> = ({ vCredential, onPress, backHome, isSigning, signRequest }) => {
  
  if (!vCredential) return null;

  const VCtype = vCredential.vc.type;
  
  console.log('inside single VC component with type', VCtype)
  // For testing schema
  // console.log('credenziale', info.item);

  if (VCtype.includes('IdentityCard')) {
    return (<VCIdentityCard vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('DimensioneImpresa')) {
    return (<VCDimensioneImpresa vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('BachelorDegree')) {
    return (<VCBachelorDegree vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('MasterDegree')) {
    return (<VCMasterDegree vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('DeMinimis')) {
    return (<VCDeMinimis vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('CartaIdentita')) {
    return (<VCCartaIdentita vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else {
    // COSA FARE NEL CASO IN CUI NON CORRISPONDE A NESSUNA DI QUESTE VISTE?
    return (
    <VCCartaIdentita vCredential={vCredential} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest} />
    )
  }

}

const vcItem = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 20
  }
})


const VCIdentityCard: React.FC<Props> = ({ vCredential, onPress, isSigning, backHome, signRequest }) => {
  const { iss, iat, exp } = vCredential;
  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));

  const dateInfo = { iat, exp };
  
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
    // alert(JSON.stringify(info.item))
   setModalVisible(!modalVisibile)
 }

 const closeAll = () => {
   setModalVisible(false);
   backHome();
 }


  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials} >
        <View style={vcItem.container}>
        { 
          onPress && (
          <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity 
              onPress={() => setModalVisible(!modalVisibile)}
            >
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>
        <SingleVCModal
          credentialInfo={vCredential.vc}
          dateInfo={dateInfo}
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
      </TouchableOpacity>
  )
}


const VCDimensioneImpresa: React.FC<Props> = ({ vCredential, onPress, isSigning, backHome, signRequest }) => {
  const { iss, iat, exp } = vCredential;
  
  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));

  const dateInfo = { iat, exp };
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
    // alert(JSON.stringify(info.item))
   setModalVisible(!modalVisibile)
 }

 const closeAll = () => {
   setModalVisible(false);
   backHome();
 }


  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
          <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>

        <SingleVCModal
          credentialInfo={vCredential.vc}
          dateInfo={dateInfo} 
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
    </TouchableOpacity>
  );
}

const VCBachelorDegree: React.FC<Props> = ({ vCredential, onPress, isSigning, signRequest, backHome }) => {
  const { iss, iat, exp } = vCredential;

  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));
  
  const dateInfo = { iat, exp };
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
    // alert(JSON.stringify(info.item))
   setModalVisible(!modalVisibile)
 }

 const closeAll = () => {
   setModalVisible(false);
   backHome();
 }
  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
        <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>
        <SingleVCModal
          credentialInfo={vCredential.vc} 
          dateInfo={dateInfo}
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
    </TouchableOpacity>
  );
}

const VCMasterDegree: React.FC<Props> = ({ vCredential, onPress, isSigning, signRequest, backHome }) => {
  const { iss, iat, exp } = vCredential;

  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));
  
  const dateInfo = { iat, exp };
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
    // alert(JSON.stringify(info.item))
   setModalVisible(!modalVisibile)
 }

 const closeAll = () => {
   setModalVisible(false);
   backHome();
 }

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
        <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
        </View>
        <SingleVCModal
          credentialInfo={vCredential.vc}
          dateInfo={dateInfo} 
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
    </TouchableOpacity>
  );
}

const VCDeMinimis: React.FC<Props> = ({ vCredential, onPress, isSigning, signRequest, backHome }) => {
  const { iss, iat, exp } = vCredential;

  const dateInfo = { iat, exp };

  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
    // alert(JSON.stringify(info.item))
   setModalVisible(!modalVisibile)
 }

 const closeAll = () => {
   setModalVisible(false);
   backHome();
 }

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
          <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>

        <SingleVCModal
          credentialInfo={vCredential.vc}
          dateInfo={dateInfo} 
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
    </TouchableOpacity>
  );
}

const Header = ({ title }) => (
  <Text style={{
    color: variables.colorBlack,
    fontWeight: Platform.OS === 'ios'? 'bold' : 'normal',
    fontFamily: Platform.OS === 'ios'? 'Titillium Web': 'TitilliumWeb-Bold',
    textAlign: 'center',
    fontSize: variables.h3FontSize,
  }}>{title[1]}</Text>
)

const HeaderOld: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{
    color: variables.colorBlack,
    fontWeight: Platform.OS === 'ios'? 'bold' : 'normal',
    fontFamily: Platform.OS === 'ios'? 'Titillium Web': 'TitilliumWeb-Bold',
    textAlign: 'center',
    fontSize: variables.h3FontSize,
  }}>{title}</Text>
)

const VCCartaIdentita: React.FC<Props> = ({ vCredential, onPress, isSigning, backHome, signRequest }) => {
  const { iss, exp, iat } = vCredential;

  // const issuerTest = {
  //   id: "issuerId",
  //   tradeName: "Banca d'Italia",
  //   postalAddress: "via nazionale 91 00184 - IT",
  //   electronicAddress: "pki@bancaditalia.it",
  //   informationUri: "https://www.bancaditalia.it/footer/firmadigitale/index.html?com.dotmarketing.htmlpage.language=1"
  // }

  const [modalVisibile, setModalVisible] = useState<boolean>(Boolean(isSigning));
    if (onPress){
      console.log('onPress active', isSigning);
      console.log('onPress modalVisible', modalVisibile);
    }

  const dateInfo = { iat, exp };
  
      //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const toggleCredentials = ():void => {
     // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }

  const closeAll = () => {
    setModalVisible(false);
    backHome();
  }

  console.log("credentiale ===", vCredential);

  return (
    <TouchableOpacity
    onPress={(onPress) ? onPress : toggleCredentials} >
        <View style={vcItem.container}>
        { 
          onPress && (
        <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={vCredential.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title={vCredential.vc.type} />
            <TouchableOpacity 
              onPress={() => setModalVisible(!modalVisibile)}
            >
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>
        <SingleVCModal
          credentialInfo={vCredential.vc}
          dateInfo={dateInfo} 
          visible={modalVisibile}
          isSigning={Boolean(isSigning)}
          signRequest={signRequest}
          toggleCredentials={toggleCredentials}
          closeAll={closeAll}
          issuer={iss}
          changeVisibility={setModalVisible}
          backHome={backHome}
        />
      </TouchableOpacity>
  )
}

const button = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '50%',
    backgroundColor: variables.brandPrimary,
    justifyContent: 'center',
    borderRadius: 5
  },
  text: {
    fontSize: variables.h5FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  },
  marginRight : {
    marginRight: 5
  }
});

export default SingleVC
