import React from 'react'
import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native"
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


const VCIdentityCard: React.FC<Props> = ({ info, onPress }) => {
  
  const { firstName, lastName, } = info.item.vc.credentialSubject

  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => alert(JSON.stringify(info.item))


  return (
    <TouchableOpacity
        onPress={(onPress) ? onPress : showCredentials} >
        <View style={{
          backgroundColor: variables.brandPrimary,
          borderColor: '#333333',
          borderWidth: 0.5,
          margin: 10,
          padding: 5,
          borderRadius: 8
        }}>
          <Header title="Carta d'identità" />
          <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
            <View>
              <Text style={{color: variables.colorWhite}}>Nome: {firstName}</Text>
              <Text style={{color: variables.colorWhite}}>Cognome: {lastName}</Text>
            </View>
            {
              onPress && (
              <View style={{paddingRight: 10, justifyContent: 'center'}}>
                  <IconFont
                    name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                    color='white'
                    size={25}
                  />
              </View>
              )
            }
          </View>
        </View>
      </TouchableOpacity>
  )
}


const VCDimensioneImpresa: React.FC<Props> = ({ info, onPress }) => {
  const { piva, indirizzoSedeLegale, dimensioneImpresa, expirationDate  } = info.item.vc.credentialSubject
  
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => alert(JSON.stringify(info.item))

  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
      <View style={{
        backgroundColor: variables.brandPrimary,
        borderColor: '#333333',
        borderWidth: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 8
      }}>
        <Header title="Dimensione Impresa" />
        <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
              <View>
                <Text style={{color: variables.colorWhite}}>Partita IVA: {piva}</Text>
                <Text style={{color: variables.colorWhite}}>Sede Legale: {showIndirizzoSL}</Text>
                <Text style={{color: variables.colorWhite, fontSize: 10}}>Dimensione Impresa: {dimensioneImpresa}</Text>
                <Text style={{color: variables.colorWhite, fontSize: 10}}>Scadenza: {expirationDate}</Text>
              </View>
              {
                onPress && (
                <View style={{paddingRight: 10, justifyContent: 'center'}}>
                    <IconFont
                      name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                      color='white'
                      size={25}
                    />
                </View>
                )
              }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const VCBachelorDegree: React.FC<Props> = ({ info, onPress }) => {
  const { type, dateOfAchievement  } = info.item.vc.credentialSubject
  
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => alert(JSON.stringify(info.item))

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
      <View style={{
        backgroundColor: variables.brandPrimary,
        borderColor: '#333333',
        borderWidth: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 8
      }}>
        <Header title="Bachelor Degree" />
        <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
              <View>
                <Text style={{color: variables.colorWhite}}>Tipologia: {type}</Text>
                <Text style={{color: variables.colorWhite}}>Data di conseguimento: {dateOfAchievement}</Text>
              </View>
              {
                onPress && (
                <View style={{paddingRight: 10, justifyContent: 'center'}}>
                    <IconFont
                      name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                      color='white'
                      size={25}
                    />
                </View>
                )
              }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const VCMasterDegree: React.FC<Props> = ({ info, onPress }) => {
  const { type, dateOfAchievement  } = info.item.vc.credentialSubject
  
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => alert(JSON.stringify(info.item))

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
      <View style={{
        backgroundColor: variables.brandPrimary,
        borderColor: '#333333',
        borderWidth: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 8
      }}>
        <Header title="Master Degree" />
        <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
              <View>
                <Text style={{color: variables.colorWhite}}>Tipologia: {type}</Text>
                <Text style={{color: variables.colorWhite}}>Data di conseguimento: {dateOfAchievement}</Text>
              </View>
              {
                onPress && (
                <View style={{paddingRight: 10, justifyContent: 'center'}}>
                    <IconFont
                      name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                      color='white'
                      size={25}
                    />
                </View>
                )
              }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const VCDeMinimis: React.FC<Props> = ({ info, onPress }) => {
  const { ragioneFiscale, piva, indirizzoSedeLegale, eleggibilita, expirationDate  } = info.item.vc.credentialSubject
  
  //  Se onPress è undefined verrà chiamata questa funzione nella vista
  // "statica" per mostrare la credential
  const showCredentials = ():void => alert(JSON.stringify(info.item))

  const showIndirizzoSL = onPress ? indirizzoSedeLegale.substr(0, 30) + '...' : indirizzoSedeLegale

  return (
    <TouchableOpacity
      onPress={(onPress) ? onPress : showCredentials}>
      <View style={{
        backgroundColor: variables.brandPrimary,
        borderColor: '#333333',
        borderWidth: 0.5,
        margin: 10,
        padding: 5,
        borderRadius: 8
      }}>
        <Header title="De Minimis" />
        <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
              <View>
              <Text style={{color: variables.colorWhite}}>Ragione Fiscale: {ragioneFiscale}</Text>
              <Text style={{color: variables.colorWhite}}>Partita IVA: {piva}</Text>
                <Text style={{color: variables.colorWhite}}>Sede Legale: {showIndirizzoSL}</Text>
                <Text style={{color: variables.colorWhite, fontSize: variables.fontSizeSmaller}}>Eleggibilità: {eleggibilita}</Text>
                <Text style={{color: variables.colorWhite, fontSize: variables.fontSizeSmaller}}>Scadenza: {expirationDate}</Text>
              </View>
              {
                onPress && (
                <View style={{paddingRight: 10, justifyContent: 'center'}}>
                    <IconFont
                      name={info.item.selected ? 'io-checkbox-on' : 'io-checkbox-off'}
                      color='white'
                      size={25}
                    />
                </View>
                )
              }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const Header: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{color: variables.colorWhite, fontWeight: 'bold', textAlign: 'center'}}>{title}</Text>
)

export default SingleVC