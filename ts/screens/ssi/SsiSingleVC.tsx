import React, { useState } from 'react'
import { View, Text, TouchableOpacity, GestureResponderEvent, StyleSheet, Platform, Modal } from "react-native"
import { ListRenderItemInfo } from 'react-native'
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


type VCType = IdentityCard | DimensioneImpresa | BachelorDegree | MasterDegree | DeMinimis

interface Props {
  info: ListRenderItemInfo<VCType>
  onPress?:(event: GestureResponderEvent) => void
}


const SingleVC: React.FC<Props> = ({ info, onPress }) => {
  const VC = info.item
  const VCtype = VC.vc.type

  console.log('inside single VC component with type', VCtype)

  if (VCtype.includes('IdentityCard')) {
    return (<VCIdentityCard info={info} onPress={onPress}/>)
  } else if (VCtype.includes('DimensioneImpresa')) {
    return (<VCDimensioneImpresa info={info} onPress={onPress}/>)
  } else if (VCtype.includes('BachelorDegree')) {
    return (<VCBachelorDegree info={info} onPress={onPress}/>)
  } else if (VCtype.includes('MasterDegree')) {
    return (<VCMasterDegree info={info} onPress={onPress}/>)
  } else if (VCtype.includes('DeMinimis')) {
    return (<VCDeMinimis info={info} onPress={onPress}/>)
  } else {
    // COSA FARE NEL CASO IN CUI NON CORRISPONDE A NESSUNA DI QUESTE VISTE?
    return null
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
  }
})


const VCIdentityCard: React.FC<Props> = ({ info, onPress }) => {
  
  const { firstName, lastName, } = info.item.vc.credentialSubject

  const [modalVisibile, setModalVisible] = useState(false)
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => {
     // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }


  return (
    <TouchableOpacity
    onPress={(onPress) ? onPress : showCredentials} >
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
        <Modal visible={modalVisibile}>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(!modalVisibile)}
            >
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
                size={30}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Carta d'identità</Text>
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Nome: </Text>
              <Text style={vcItem.modalInfo}>{firstName}</Text>
            <Text style={vcItem.modalDescription}>Cognome: </Text>
            <Text style={vcItem.modalInfo}>{lastName}</Text>
          </View>
        </Modal>
      </TouchableOpacity>
  )
}


const VCDimensioneImpresa: React.FC<Props> = ({ info, onPress }) => {
  const { piva, indirizzoSedeLegale, dimensioneImpresa, expirationDate  } = info.item.vc.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState(false)
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => {
    // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }

  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
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

        <Modal visible={modalVisibile}>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Dimensione Impresa</Text>
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>PartitaI IVA: </Text>
              <Text style={vcItem.modalInfo}>{piva}</Text>
            <Text style={vcItem.modalDescription}>Sede Legale: </Text>
            <Text style={vcItem.modalInfo}>{showIndirizzoSL}</Text>
            <Text style={vcItem.modalDescription}>Dimensione Impresa: </Text>
            <Text style={vcItem.modalInfo}>{dimensioneImpresa}</Text>
            <Text style={vcItem.modalDescription}>Scandenza: </Text>
            <Text style={vcItem.modalInfo}>{expirationDate}</Text>
          </View>
        </Modal>
    </TouchableOpacity>
  );
}

const VCBachelorDegree: React.FC<Props> = ({ info, onPress }) => {
  const { type, dateOfAchievement  } = info.item.vc.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState(false)
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => {
     // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
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
            <Header title="Bachelor Degree" />
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
            <IconFont
                name="io-right"
                color={variables.brandPrimary}
                size={30}
              />
            </TouchableOpacity>
        </View>
        <Modal visible={modalVisibile}>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Bachelor Degree</Text>
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Tipologia: </Text>
              <Text style={vcItem.modalInfo}>{type}</Text>
            <Text style={vcItem.modalDescription}>Data di conseguimento: </Text>
            <Text style={vcItem.modalInfo}>{dateOfAchievement}</Text>
          </View>
        </Modal>
    </TouchableOpacity>
  );
}

const VCMasterDegree: React.FC<Props> = ({ info, onPress }) => {
  const { type, dateOfAchievement  } = info.item.vc.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState(false)
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => {
    // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
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
              />
            </TouchableOpacity>
        </View>
        <Modal visible={modalVisibile}>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>Master Degree</Text>
          </View>
          <View style={vcItem.modalBody}>
            <Text style={vcItem.modalDescription}>Tipologia: </Text>
              <Text style={vcItem.modalInfo}>{type}</Text>
            <Text style={vcItem.modalDescription}>Data di conseguimento: </Text>
            <Text style={vcItem.modalInfo}>{dateOfAchievement}</Text>
          </View>
        </Modal>
    </TouchableOpacity>
  );
}

const VCDeMinimis: React.FC<Props> = ({ info, onPress }) => {
  const { ragioneFiscale, piva, indirizzoSedeLegale, eleggibilita, expirationDate  } = info.item.vc.credentialSubject
  
  const [modalVisibile, setModalVisible] = useState(false)
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => {
    // alert(JSON.stringify(info.item))
    setModalVisible(!modalVisibile)
  }

  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
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

        <Modal visible={modalVisibile}>
          <View style={vcItem.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisibile)}>
              <IconFont 
                name='io-close'
                color={variables.colorWhite}
              />
            </TouchableOpacity>
            <Text style={vcItem.modalTitle}>De Minimis</Text>
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

export default SingleVC