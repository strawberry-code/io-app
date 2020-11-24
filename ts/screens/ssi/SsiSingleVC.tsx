import React from 'react'
import { View, Text, TouchableOpacity, GestureResponderEvent, StyleSheet } from "react-native"
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

const styles = StyleSheet.create({
  card: {
    margin: 10,
    overflow: 'hidden',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: {
      width: 10,
      height: 10
    },
    backgroundColor: "white",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  cardHeader: { backgroundColor: variables.brandPrimary, padding: 10, flex: 1 },
  cardBody: {flexDirection: 'row', justifyContent:"space-between" , padding: 10},
  cardBodyText: { color: 'black'}
})

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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Header title="Carta d'identità" />
          </View>
          <View style={styles.cardBody}>
            <View>
              <Text style={styles.cardBodyText}>Nome: {firstName}</Text>
              <Text style={styles.cardBodyText}>Cognome: {lastName}</Text>
            </View>
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Header title="Dimensione Impresa" />
        </View>
        <View style={styles.cardBody}>
              <View>
                <Text style={styles.cardBodyText}>Partita IVA: {piva}</Text>
                <Text style={styles.cardBodyText}>Sede Legale: {showIndirizzoSL}</Text>
                <Text style={styles.cardBodyText}>Dimensione Impresa: {dimensioneImpresa}</Text>
                <Text style={styles.cardBodyText}>Scadenza: {expirationDate}</Text>
              </View>
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Header title="Bachelor Degree" />
        </View>
        <View style={styles.cardBody}>
              <View>
                <Text style={styles.cardBodyText}>Tipologia: {type}</Text>
                <Text style={styles.cardBodyText}>Data di conseguimento: {dateOfAchievement}</Text>
              </View>
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
      <View style={styles.cardHeader}>
        <View style={styles.cardHeader}>
          <Header title="Master Degree" />
        </View>
        <View style={{flexDirection: 'row', justifyContent:"space-between"}}>
              <View>
                <Text style={styles.cardBodyText}>Tipologia: {type}</Text>
                <Text style={styles.cardBodyText}>Data di conseguimento: {dateOfAchievement}</Text>
              </View>
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Header title="De Minimis" />
        </View>
        <View style={styles.cardBody}>
              <View>
              <Text style={styles.cardBodyText}>Ragione Fiscale: {ragioneFiscale}</Text>
              <Text style={styles.cardBodyText}>Partita IVA: {piva}</Text>
                <Text style={styles.cardBodyText}>Sede Legale: {showIndirizzoSL}</Text>
                <Text style={styles.cardBodyText}>Eleggibilità: {eleggibilita}</Text>
                <Text style={styles.cardBodyText}>Scadenza: {expirationDate}</Text>
              </View>
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
        </View>
      </View>
    </TouchableOpacity>
  );
}

const Header: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{color: variables.colorWhite, fontWeight: 'bold', textAlign: 'center', fontSize: variables.fontSizeBase}}>{title}</Text>
)

export default SingleVC