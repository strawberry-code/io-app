/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
import {fromNullable} from "fp-ts/lib/Option";
import * as React from "react";
import {
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
  navigateToLanguagePreferenceScreen, navigateToSsiHome
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
import {showToast} from "../../utils/showToast";
import SingleVC from './SsiSingleVC'
import IconFont from "../../components/ui/IconFont";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import * as RNFS from "react-native-fs";
import {DidSingleton} from "../../types/DID";
import Share from "react-native-share";
import base64 from 'react-native-base64'
import {exportVCsIos, exportVCsAndroid} from "./SsiUtils";
import {Toast} from "native-base";

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
  data: [],
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

  constructor(props: Props) {
    super(props);
    this.state = {
      isFingerprintAvailable: false,
      isFirstLoad: Platform.OS === "ios",
      data: [],
      modalVisible: false,
      modalStates: {showPrompt: true, sharing: false, sharedSuccess: false, sharedFail: false}
    };
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

  private renderVC = (info: ListRenderItemInfo<JwtCredentialPayload>) => {
    const VC = info.item;
    // console.log(JSON.stringify(VC))
    console.log('devo renderizzare')
    //console.log('renderizzazione di una VC: ' + VC.vc.type.toString())

    return (
        <SingleVC vCredential={VC}/>
    )
  }


  ExportVCs = () => (
    <ButtonDefaultOpacity
      block={true}
      onPress={async () => {
        if (Platform.OS === 'ios') {
          let res = await exportVCsIos()
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
        <View style={{marginHorizontal: 20, marginBottom: 15}}>
          <this.ExportVCs/>
        </View>
        <NavigationEvents onWillFocus={this.checkParamsOnWillFocus}/>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>

              {this.state.modalStates.showPrompt && <>
                <Text style={styles.modalText}>Do you want to share this credential?</Text>

                <View style={{flexDirection: "row"}}>
                  <TouchableHighlight
                    style={{...styles.openButton, backgroundColor: variables.brandPrimary, marginHorizontal: 20}}
                    onPress={() => {
                      this.setState({
                        modalStates: {
                          showPrompt: false,
                          sharing: true,
                          sharedSuccess: false,
                          sharedFail: false
                        }
                      });
                      this.shareVCnow(this.state.VCtoBeShared, this.state.shareTo)
                    }}
                  >
                    <Text style={styles.textStyle}>Yes</Text>
                  </TouchableHighlight>

                  <TouchableHighlight
                    style={{...styles.openButton, backgroundColor: variables.brandDanger, marginHorizontal: 20}}
                    onPress={() => {
                      this.setState({modalVisible: false});
                    }}
                  >
                    <Text style={styles.textStyle}>No</Text>
                  </TouchableHighlight>
                </View>
              </>}

              {this.state.modalStates.sharing && <>
                <Text style={styles.modalText}>Sharing credential...</Text>
                <ActivityIndicator/>
              </>}

              {this.state.modalStates.sharedSuccess && <>
                <Text style={styles.modalText}>Credential shared!</Text>
                <Text style={styles.modalText}>✅</Text>

                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandPrimary}}
                  onPress={() => {
                    this.setState({modalVisible: false})
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
                  <Text style={styles.textStyle}>Ok, thanks</Text>
                </TouchableHighlight>
              </>}

              {this.state.modalStates.sharedFail && <>
                <Text style={styles.modalText}>Failed to share the credential</Text>
                <Text style={styles.modalText}>🚫</Text>
                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandPrimary}}
                  onPress={() => {
                    this.setState({modalVisible: false});
                  }}
                >
                  <Text style={styles.textStyle}>Ok, thanks</Text>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    height: 40
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
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
