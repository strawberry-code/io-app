/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
import {fromNullable} from "fp-ts/lib/Option";
import * as React from "react";
import {
  Animated,
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import {NavigationEvents, NavigationScreenProp, NavigationState} from "react-navigation";
import {connect} from "react-redux";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';

import {withLightModalContext} from "../../components/helpers/withLightModalContext";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import {LightModalContextInterface} from "../../components/ui/LightModal";
import I18n from "../../i18n";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailForwardingPreferenceScreen,
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen,
  navigateToFingerprintPreferenceScreen,
  navigateToLanguagePreferenceScreen, navigateToSsiBackupScreen, navigateToSsiHome
} from "../../store/actions/navigation";
import {Dispatch, ReduxProps} from "../../store/actions/types";
import {
  isCustomEmailChannelEnabledSelector,
  preferredLanguageSelector
} from "../../store/reducers/persistedPreferences";
import {
  hasProfileEmailSelector,
  isEmailEnabledSelector,
  isInboxEnabledSelector,
  isProfileEmailValidatedSelector,
  profileEmailSelector,
  profileMobilePhoneSelector,
  profileSpidEmailSelector
} from "../../store/reducers/profile";
import {GlobalState} from "../../store/reducers/types";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import {JwtCredentialPayload} from "did-jwt-vc";
import variables from "../../theme/variables";
import VCstore from "./VCstore";
import SingleVC from './SsiSingleVC'
import IconFont from "../../components/ui/IconFont";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import {exportVCsIos, exportVCsAndroid} from "./SsiUtils";
import {Toast} from "native-base";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton, TouchableOpacity} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-community/async-storage";
import { setApiToken, exportBackup, configureGoogleSignIn } from "./googleDriveApi";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  onRefresh: () => void;
}>;


type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  LightModalContextInterface;

type State = {
  isFingerprintAvailable: boolean;
  isFirstLoad: boolean;
  data: [];
  modalVisible: boolean;
  modalStates: any;
};


/**
 * Translates the primary languages of the provided locales.
 *
 * If a locale is not in the XX-YY format, it will be skipped.
 * If the primary language of a locale doesn't have a translation,
 * it gets returned verbatim.

 function translateLocale(locale: string): string {
  return getLocalePrimary(locale)
    .map(l => I18n.t(`locales.${l}`, {defaultValue: l}))
    .getOrElse(locale);
}
 */

class PreferencesScreen extends React.Component<Props, State> {
  private refsArray: any[];

  constructor(props: Props) {
    super(props);
    this.state = {
      isFingerprintAvailable: false,
      isFirstLoad: Platform.OS === "ios",
      data: [],
      modalVisible: false,
      modalStates: {showPrompt: true, sharing: false, sharedSuccess: false, sharedFail: false},
    };
    this.refsArray = []
  }

  public shareVCfromQrScan = async (qrData) => {
    console.log('🟢 eseguento logica per shareReq')
    console.log(`qrData: ${JSON.stringify(qrData)}`)
    let callback = qrData.callback

    console.log(`\ncallback: ${callback}\n`)

    //let VCs = HardcodedVCs

    //callback = "https://ssi-aria-backend.herokuapp.com/authVC?socketid=vThFWqdWQq6goSdgAAAD"
    console.log("making http fetch post")

    this.setState({
      modalVisible: true,
      modalStates: {showPrompt: true, sharing: false, sharedSuccess: false, sharedFail: false}
    })
    this.setState({
      shareTo: callback,
      VCtoBeShared: JSON.stringify({"verifiableCredential": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw"})
    })
  }

  private shareVCnow = (VC, shareTo) => {
    fetch(shareTo, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: VC
    })
      .then(response => response.json())
      .then(data => {
        console.info('Success:', JSON.stringify(data))
        this.setState({
          modalVisible: true,
          modalStates: {showPrompt: false, sharing: false, sharedSuccess: true, sharedFail: false}
        })
      })
      .catch((error) => {
        console.info('Error:', error);
        this.setState({
          modalVisible: true,
          modalStates: {showPrompt: false, sharing: false, sharedSuccess: false, sharedFail: true}
        })
      });
  }

  public componentDidMount() {
    //VCstore.clearStore()
    console.log('Inside Veriable Credential Screen');
    VCstore.getVCs().then((data) => {
      console.log('data X: ' + JSON.stringify(data))
      this.setState({data: data})
    })

    GoogleSignin.isSignedIn().then(value => this.setState({ isSignedIn: value }))
  }

  public dispatchNavigationAction(action, data) {
    if (action === "shareVCfromQR") {
      this.shareVCfromQrScan(data)
    } else if (action === "saveVCinTheStore") {
      this.saveVCinTheStore(data)
    } else {
      console.error("navigation action non riconosciuta")
    }
  }

  private saveVCinTheStore = (jwt) => {
    console.log('saving new jwt in the store: ' + jwt)
    VCstore.storeVC(jwt).then(() => {
      VCstore.getVCs().then((data) => {
        this.setState({data: data})
      })
    })
  }

  private checkParamsOnWillFocus = () => {
    console.log(JSON.stringify(this.props.navigation.state.params))
    if (this.props.navigation.state.params && this.props.navigation.state.params.action) {
      this.dispatchNavigationAction(this.props.navigation.state.params.action, this.props.navigation.state.params.data)
    }
    VCstore.getVCs().then((data) => {
      this.setState({data: data})
    })

  }

  private textHeader = (headerTitle: string) => {
    return (<Text style={{color: variables.colorWhite, fontWeight: 'bold', textAlign: 'center'}}>{headerTitle}</Text>)
  }

  deleteVCaction = (progress, dragX, listItem) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    console.log('aaa')
    return (
      <RectButton style={styles.leftAction} onPress={async () => await this.deleteVC(listItem.index)}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          {I18n.t('global.buttons.delete')}
        </Animated.Text>
      </RectButton>
    );
  };

  _swipeableRow = undefined
  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    if(this._swipeableRow !== undefined) this._swipeableRow.close();
  };

  deleteVC = async (index) => {
    console.log(`deleted! ${index}`)

    this.refsArray[index].close();
    setTimeout(async () => {
      let VCs = [...this.state.data]
      console.log(`this.refsArray: ${this.refsArray.length}`)
      //this.refsArray = this.refsArray.splice(index, 1);
      let newRefArray = []
      for(let i = 0; i < newRefArray.length; i++) {
        if(index !== i) {
          newRefArray.push(this.refsArray[i])
        }
      }
      this.refsArray = newRefArray
      console.log(`this.refsArray: ${this.refsArray.length}`)
      console.log(`VCs: ${JSON.stringify(VCs)}`)
      let newVCs = []
      for(let i = 0; i < VCs.length; i++) {
        if(index !== i) {
          newVCs.push(VCs[i])
        }
      }
      await VCstore.deleteSingVCByIndex(index)
      console.log(`VCs: ${JSON.stringify(newVCs)}`)
      this.setState({
        data: newVCs
      },() => {
        Toast.show({text: I18n.t('ssi.deleteVC.toastTitleSuccess'), duration: 3000, position: 'bottom'})
      })
    }, 500)
  }

  private renderVC = (flatListItem: ListRenderItemInfo<JwtCredentialPayload>) => {
    const VerifiedCredentialJson = flatListItem.item;
    // console.log(JSON.stringify(VC))
    console.log('devo renderizzare')
    //console.log('renderizzazione di una VC: ' + VC.vc.type.toString())

    return (
      <Swipeable
        ref={ref => {
          console.log(`ricostruisco l'array dei riferimenti ${flatListItem.index}`)
          this.refsArray[flatListItem.index] = ref; //or this.refsArray[item.id]
          console.log(`l'array è lungo: ${this.refsArray.length}`)
        }}
        friction={2}
        leftThreshold={40}
        renderLeftActions={(progress, dragX) => {
          console.log(`list item index: ${JSON.stringify(flatListItem.index)}`);
          console.log(`🎈🎈🎈reference debug:`)
          console.log(this.refsArray)
          return this.deleteVCaction(progress, dragX, flatListItem)
        }}
      >
        <View style={styles.itemContainer}><SingleVC vCredential={VerifiedCredentialJson}/></View>
      </Swipeable>
    )
  }


  ExportVCs = () => (
    <ButtonDefaultOpacity
      block={true}
      onPress={async () => {
        if (Platform.OS === 'ios') {
          let res = await exportVCsIos()
          if(typeof res === 'boolean') {
            res ? Toast.show({
              text: I18n.t('ssi.exportVCs.toastTitleSuccess'),
              duration: 4000,
              type: 'success',
              position: 'top'
            }) : Toast.show({
              text: I18n.t('ssi.exportVCs.toastTitleFailure'),
              duration: 4000,
              type: 'danger',
              position: 'top'
            })
          } else {
            Toast.show({
              text: I18n.t('ssi.exportVCs.toastTitleUserDidNotShare'),
              duration: 4000,
              position: 'top'})
          }

        } else {
          let res = await exportVCsAndroid()
          res ? Toast.show({
            text: I18n.t('ssi.exportVCs.toastTitleSuccess'),
            duration: 4000,
            type: 'success',
            position: 'top'
          }) : Toast.show({
            text: I18n.t('ssi.exportVCs.toastTitleFailure'),
            duration: 4000,
            type: 'danger',
            position: 'top'
          })
        }
      }}
      activeOpacity={1}
    >
      <IconFont name="io-carta" style={{color: 'white'}}/>
      <Text style={{color: 'white', fontWeight: '800'}}>{I18n.t("ssi.exportVcs")}</Text>
    </ButtonDefaultOpacity>
  );

  public render() {
    return (
      <TopScreenComponent
        faqCategories={["profile", "privacy", "authentication_SPID"]}
        headerTitle={I18n.t("ssi.title")}
        customGoBack={<TouchableHighlight onPress={() => {
          this.props.navigateToSsiHome()
        }}><IconFont name={"io-back"} style={{color: variables.colorBlack}}/></TouchableHighlight>}
      >
        <ScreenContent
          title={I18n.t("ssi.vcslist.title")}
          subtitle={I18n.t("ssi.vcslist.subtitle")}
          icon={require("../../../img/icons/gears.png")}
        >
          <FlatList
            ItemSeparatorComponent={ItemSeparator}
            data={this.state.data}
            renderItem={this.renderVC}
          />
        </ScreenContent>
        <View style={{ alignItems:"center", marginHorizontal: 20, marginBottom: 15}}>
        <ButtonDefaultOpacity activeOpacity={1} block onPress={() => this.props.navigateToSsiBackupScreen()}>
          <IconFont name="io-cloud-upload" style={{color: 'white'}}/>
          <Text style={{color: 'white', fontWeight: '800'}}>Backup Credenziali</Text>
        </ButtonDefaultOpacity>
        </View>
        <NavigationEvents onWillFocus={this.checkParamsOnWillFocus}/>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={styles.centeredView}>
            {/* BLACK OPACHE BACKGROUND */}
            <View style={styles.bgOpacity}></View>
            <View style={styles.modalView}>
              {this.state.modalStates.sharing && (
                <>
                  <Text style={styles.modalText}>
                    Facendo Backup delle Credenziali
                  </Text>
                  <ActivityIndicator size="large" color={variables.brandPrimary} />
                </>
              )}

              {this.state.modalStates.sharedSuccess && (
                <>
                  <Text style={styles.modalText}>
                    Backup Eseguito con Successo
                  </Text>
                  <IconFont size={60} color={variables.brandPrimary} name="io-complete" style={{height: 63}}/>

                  <TouchableHighlight
                    style={styles.openButton}
                    onPress={() => {
                      this.setState({modalVisible: false});
                      this.setState({
                        modalStates: {
                          showPrompt: true,
                          sharing: false,
                          sharedSuccess: false,
                          sharedFail: false
                        }
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>
                      {I18n.t("ssi.shareReqScreen.continueButton")}
                    </Text>
                  </TouchableHighlight>
                </>
              )}

              {this.state.modalStates.sharedFail && <>
                <Text style={styles.modalText}>
                  Problema Durante Backup su Drive
                </Text>
                <IconFont size={60} color={variables.brandDanger} name="io-notice"/>
                <TouchableHighlight
                  style={styles.openButton}
                  onPress={() => {
                    this.setState({modalVisible: false});
                  }}
                >
                  <Text style={styles.buttonText}>
                    {I18n.t("ssi.shareReqScreen.tryAgainButton")}
                  </Text>
                </TouchableHighlight>
              </>}
            </View>
          </View>
        </Modal>
      </TopScreenComponent>
    );
  }

}

/*
        <TouchableHighlight
          onPress={() => {childRef.current.changeText(true)}}
        >
          <Text>Show Modal</Text>
        </TouchableHighlight>
 */

const ItemSeparator = () => <ItemSeparatorComponent noPadded={true}/>;


const styles = StyleSheet.create({
  header: {
    fontSize: variables.h4FontSize,
    padding: 20,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
  },
  bgOpacity: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "black",
    width: "100%",
    height: "100%",
    opacity: 0.5
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "80%",
    height: "45%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 35,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonText: {
    color: variables.colorWhite,
    fontSize: variables.fontSize2,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    textAlign: "center"
  },
  openButton: {
    backgroundColor: variables.brandPrimary,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    textAlign: "center",
    fontSize: variables.fontSize3,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
  },
  leftAction: {
    flex: 1,
    backgroundColor: variables.brandDanger,
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  itemContainer: {
    backgroundColor: 'white'
  }
});


function mapStateToProps(state: GlobalState) {
  return {
    preferredLanguage: preferredLanguageSelector(state),
    languages: fromNullable(state.preferences.languages),
    optionEmail: profileEmailSelector(state),
    optionSpidEmail: profileSpidEmailSelector(state),
    isEmailValidated: isProfileEmailValidatedSelector(state),
    isEmailEnabled: isEmailEnabledSelector(state),
    isInboxEnabled: isInboxEnabledSelector(state),
    isCustomEmailChannelEnabled: isCustomEmailChannelEnabledSelector(state),
    isFingerprintEnabled: state.persistedPreferences.isFingerprintEnabled,
    preferredCalendar: state.persistedPreferences.preferredCalendar,
    hasProfileEmail: hasProfileEmailSelector(state),
    optionMobilePhone: profileMobilePhoneSelector(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToSsiBackupScreen: () => dispatch(navigateToSsiBackupScreen()),
  navigateToFingerprintPreferenceScreen: () =>
    dispatch(navigateToFingerprintPreferenceScreen()),
  navigateToEmailForwardingPreferenceScreen: () =>
    dispatch(navigateToEmailForwardingPreferenceScreen()),
  navigateToCalendarPreferenceScreen: () =>
    dispatch(navigateToCalendarPreferenceScreen()),
  navigateToSsiHome: () => dispatch(navigateToSsiHome()),
  navigateToLanguagePreferenceScreen: () =>
    dispatch(navigateToLanguagePreferenceScreen()),
  navigateToEmailReadScreen: () => dispatch(navigateToEmailReadScreen()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PreferencesScreen));
