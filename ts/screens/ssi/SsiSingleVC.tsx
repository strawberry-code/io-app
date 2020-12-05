import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TouchableHighlight, GestureResponderEvent, StyleSheet, Platform, Modal, ScrollView, Alert } from "react-native"
import { NavigationComponent } from 'react-navigation'
import { ListRenderItemInfo } from 'react-native'
import I18n from "../../i18n";

import { JwtCredentialPayload } from "did-jwt-vc/src/types"
import variables from "../../theme/variables"
import IconFont from "../../components/ui/IconFont";



interface IdentityCard extends JwtCredentialPayload {
  vc : JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'IdentityCard']
    credentialSubject: {
        firstName: string
        lastName : string
    }
  }  
}

interface DimensioneImpresa extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'DimensioneImpresa']
    credentialSubject: {
      piva : string
      indirizzoSedeLegale : string
      dimensioneImpresa: string
      expirationDate: string
    }
  }  
}

interface BachelorDegree extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'BachelorDegree']
    credentialSubject: {
      type: string
      dateOfAchievement: string
    }
  }  
}

interface MasterDegree extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', 'MasterDegree']
    credentialSubject: {
      type: string
      dateOfAchievement: string
    }
  }  
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
}
interface VID extends JwtCredentialPayload {
  vc: JwtCredentialPayload['vc'] & {
    type: ['VerifiedCredential', '/VID']
    credentialSubject: {
      id: string;
      firtName: string;
      lastName: string;
      birthday: string;
      placeOfBirth: string;
    }
  }  
}


type VCType = IdentityCard | DimensioneImpresa | BachelorDegree | MasterDegree | DeMinimis | VID

interface Props {
  info: ListRenderItemInfo<VCType>
  onPress?:(event: GestureResponderEvent) => void
  backHome?: NavigationComponent;
  isSigning?: boolean;
  signRequest?: () => void;
}


const SingleVC: React.FC<Props> = ({ info, onPress, backHome, isSigning, signRequest }) => {
  
  if (!info) return null;

  const VCtype = info.type;
  
  console.log('inside single VC component with type', VCtype)
  // For testing schema
  // console.log('credenziale', info.item);

  if (VCtype.includes('IdentityCard')) {
    return (<VCIdentityCard info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('DimensioneImpresa')) {
    return (<VCDimensioneImpresa info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('BachelorDegree')) {
    return (<VCBachelorDegree info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('MasterDegree')) {
    return (<VCMasterDegree info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('DeMinimis')) {
    return (<VCDeMinimis info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else if (VCtype.includes('/VID')) {
    return (<VCVID info={info} onPress={onPress} isSigning={isSigning} backHome={backHome} signRequest={signRequest}/>)
  } else {
    // COSA FARE NEL CASO IN CUI NON CORRISPONDE A NESSUNA DI QUESTE VISTE?
    return (
    <TouchableOpacity onPress={() => alert(JSON.stringify(info))}>
      <Text>Credenziale Work in Progress. Clicca qui per vederla</Text>
    </TouchableOpacity>
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
  },
  modalHeader : {
    backgroundColor: variables.brandPrimary,
    padding: 20
  },
  modalCloseButton: {
    marginTop: 30
  },
  modalTitle: {
    marginTop: 50,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios'? 'Titillium Web' : 'TitilliumWeb-Bold',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontSize: variables.h1FontSize,
    color: variables.colorWhite
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  modalDescription: {
    fontSize: variables.h3FontSize,
    fontFamily: Platform.OS === 'ios'? 'Titillium Web' : 'TitilliumWeb-Bold',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
  },
  modalInfo : {
    fontFamily: Platform.OS === 'ios'? 'Titillium Web' : 'TitilliumWeb-Regular',
    fontSize: variables.h4FontSize,
    marginBottom: 10
  },
  signingTitle : {
    fontFamily: Platform.OS === 'ios'? 'Titillium Web' : 'TitilliumWeb-Bold',
    fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
    fontSize: variables.h4FontSize,
    color: variables.colorWhite
  },
  signButtonsRow : {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: "#E6E9F2",
    padding: 10
  }
})


const VCIdentityCard: React.FC<Props> = ({ info, onPress, isSigning, backHome, signRequest }) => {
  
  const { firstName, lastName, } = info.credentialSubject

  const [modalVisibile, setModalVisible] = useState<boolean | undefined>(isSigning);
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
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title="Carta d'identità" />
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
        <Modal visible={modalVisibile} animationType='slide'>
          <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity 
              onPress={isSigning ? closeAll : toggleCredentials}
            >
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                size={30}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Carta d'identità</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Nome: </Text>
              <Text style={vcItem.modalInfo}>{firstName}</Text>
            <Text style={vcItem.modalDescription}>Cognome: </Text>
            <Text style={vcItem.modalInfo}>{lastName}</Text>
          </View>
          </ScrollView>
          {
            isSigning &&
            <View style={vcItem.signButtonsRow}>
            <TouchableHighlight
              style={[button.container, button.marginRight]}
              onPress={() => signRequest()}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={[button.container, {backgroundColor: variables.brandDanger}]}
              onPress={backHome}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
            </TouchableHighlight>
            </View>
          }
        </Modal>
      </TouchableOpacity>
  )
}


const VCDimensioneImpresa: React.FC<Props> = ({ info, onPress, isSigning, backHome, signRequest }) => {
  const { piva, indirizzoSedeLegale, dimensioneImpresa, expirationDate  } = info.credentialSubject
  
  console.log('info.credential', info.credentialSubject);

  const [modalVisibile, setModalVisible] = useState(isSigning)
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


  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
          <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title="Dimensione Impresa" />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>

        <Modal visible={modalVisibile} animationType='slide'>
          <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={isSigning? closeAll : toggleCredentials}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Dimensione Impresa</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Partita IVA: </Text>
              <Text style={vcItem.modalInfo}>{piva}</Text>
            <Text style={vcItem.modalDescription}>Sede Legale: </Text>
            <Text style={vcItem.modalInfo}>{showIndirizzoSL}</Text>
            <Text style={vcItem.modalDescription}>Dimensione Impresa: </Text>
            <Text style={vcItem.modalInfo}>{dimensioneImpresa}</Text>
            <Text style={vcItem.modalDescription}>Scandenza: </Text>
            <Text style={vcItem.modalInfo}>{expirationDate}</Text>
          </View>
          </ScrollView>
          {
            isSigning &&
            <View style={vcItem.signButtonsRow}>
            <TouchableHighlight
              style={[button.container, button.marginRight]}
              onPress={() => signRequest()}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={[button.container, {backgroundColor: variables.brandDanger}]}
              onPress={backHome}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
            </TouchableHighlight>
            </View>
          }
        </Modal>
    </TouchableOpacity>
  );
}

const VCBachelorDegree: React.FC<Props> = ({ info, onPress, isSigning, signRequest, backHome }) => {
  const { type, dateOfAchievement  } = info.item.vc.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState(isSigning)
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
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
                style={vcItem.modalCloseButton}
              />
          </View>
          )
        }
            <Header title="Bachelor Degree" />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>
        <Modal visible={modalVisibile} animationType='slide'>
          <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={isSigning ? closeAll : toggleCredentials}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Bachelor Degree</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Tipologia: </Text>
              <Text style={vcItem.modalInfo}>{type}</Text>
            <Text style={vcItem.modalDescription}>Data di conseguimento: </Text>
            <Text style={vcItem.modalInfo}>{dateOfAchievement}</Text>
          </View>
        </ScrollView>
        {
          isSigning &&
          <View style={vcItem.signButtonsRow}>
          <TouchableHighlight
            style={[button.container, button.marginRight]}
            onPress={() => signRequest()}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={[button.container, {backgroundColor: variables.brandDanger}]}
            onPress={backHome}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
          </TouchableHighlight>
          </View>
        }
        </Modal>
    </TouchableOpacity>
  );
}

const VCMasterDegree: React.FC<Props> = ({ info, onPress, isSigning, signRequest, backHome }) => {
  const { type, dateOfAchievement  } = info.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState<boolean | undefined>(isSigning);
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
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title="Master Degree" />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
        </View>
        <Modal visible={modalVisibile} animationType='slide'>
          <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={isSigning ? closeAll : toggleCredentials}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Master Degree</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Tipologia: </Text>
              <Text style={vcItem.modalInfo}>{type}</Text>
            <Text style={vcItem.modalDescription}>Data di conseguimento: </Text>
            <Text style={vcItem.modalInfo}>{dateOfAchievement}</Text>
          </View>
        </ScrollView>
        {
          isSigning &&
          <View style={vcItem.signButtonsRow}>
          <TouchableHighlight
            style={[button.container, button.marginRight]}
            onPress={() => signRequest()}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={[button.container, {backgroundColor: variables.brandDanger}]}
            onPress={backHome}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
          </TouchableHighlight>
          </View>
        }
        </Modal>
    </TouchableOpacity>
  );
}

const VCDeMinimis: React.FC<Props> = ({ info, onPress, isSigning, signRequest, backHome }) => {
  const { ragioneFiscale, piva, indirizzoSedeLegale, eleggibilita, expirationDate  } = info.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState<boolean | undefined>(isSigning);
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

  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : toggleCredentials}>
      <View style={vcItem.container}>
        { 
          onPress && (
          <View style={{paddingRight: 10, justifyContent: 'center'}}>
              <IconFont
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title="De Minimis" />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>

        <Modal visible={modalVisibile} animationType='slide'>
          <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={isSigning ? closeAll : toggleCredentials}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>De Minimis</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Ragione Fiscale: </Text>
              <Text style={vcItem.modalInfo}>{ragioneFiscale}</Text>
            <Text style={vcItem.modalDescription}>Partita IVA: </Text>
              <Text style={vcItem.modalInfo}>{piva}</Text>
            <Text style={vcItem.modalDescription}>Sede Legale: </Text>
            <Text style={vcItem.modalInfo}>{showIndirizzoSL}</Text>
            <Text style={vcItem.modalDescription}>Eleggibilità: </Text>
            <Text style={vcItem.modalInfo}>{eleggibilita}</Text>
            <Text style={vcItem.modalDescription}>Scandenza: </Text>
            <Text style={vcItem.modalInfo}>{expirationDate}</Text>
          </View>
          </ScrollView>
          {
            isSigning &&
            <View style={vcItem.signButtonsRow}>
            <TouchableHighlight
              style={[button.container, button.marginRight]}
              onPress={() => signRequest()}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={[button.container, {backgroundColor: variables.brandDanger}]}
              onPress={backHome}
            >
              <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
            </TouchableHighlight>
            </View>
          }
        </Modal>
    </TouchableOpacity>
  );
}

const Header: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{
    color: variables.colorBlack,
    fontWeight: Platform.OS === 'ios'? 'bold' : 'normal',
    fontFamily: Platform.OS === 'ios'? 'Titillium Web': 'TitilliumWeb-Bold',
    textAlign: 'center',
    fontSize: variables.h3FontSize,
  }}>{title}</Text>
)

const VCVID: React.FC<Props> = ({ info, onPress, isSigning, backHome, signRequest }) => {
  
  const { firstName, lastName, placeOfBirth, birthday,  } = info.credentialSubject;
  const [modalVisibile, setModalVisible] = useState<boolean | undefined>(isSigning);
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
                name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                color={variables.brandPrimary}
                size={25}
              />
          </View>
          )
        }
            <Header title="Carta d'identità" />
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
        <Modal visible={modalVisibile} animationType='slide'>
        <ScrollView>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity 
              onPress={isSigning ? closeAll : toggleCredentials}
            >
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                size={30}
                style={vcItem.modalCloseButton}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>VID</Text>
            {
              isSigning && (<Text style={vcItem.signingTitle}>{I18n.t('ssi.signReqScreen.saveQuestion')}</Text>)
            }
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Nome: </Text>
              <Text style={vcItem.modalInfo}>{firstName}</Text>
            <Text style={vcItem.modalDescription}>Cognome: </Text>
            <Text style={vcItem.modalInfo}>{lastName}</Text>
            <Text style={vcItem.modalDescription}>Data di nascita: </Text>
            <Text style={vcItem.modalInfo}>{birthday}</Text>
            <Text style={vcItem.modalDescription}>Luogo di nascita: </Text>
            <Text style={vcItem.modalInfo}>{placeOfBirth}</Text>
          </View>
          </ScrollView>
        {
          isSigning &&
          <View style={vcItem.signButtonsRow}>
          <TouchableHighlight
            style={[button.container, button.marginRight]}
            onPress={() => signRequest()}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.acceptButton')}</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={[button.container, {backgroundColor: variables.brandDanger}]}
            onPress={backHome}
          >
            <Text style={button.text}>{I18n.t('ssi.signReqScreen.declineButton')}</Text>
          </TouchableHighlight>
          </View>
        }
        </Modal>
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
