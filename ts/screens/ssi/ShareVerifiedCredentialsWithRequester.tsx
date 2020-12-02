/**
 * Implementazione della vista che compare dopo la scansione di un QR di tipo Share Req. L'utente potrà selezionare quali VCs convidivdere.
 */
import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import {
  navigateToCalendarPreferenceScreen,
  navigateToEmailForwardingPreferenceScreen,
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen,
  navigateToFingerprintPreferenceScreen,
  navigateToLanguagePreferenceScreen,
  navigateToSsiHome
} from "../../store/actions/navigation";
import { Dispatch, ReduxProps } from "../../store/actions/types";
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
import { GlobalState } from "../../store/reducers/types";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import { JwtCredentialPayload, VerifiedCredential } from "did-jwt-vc";
import variables from "../../theme/variables";
import VCstore from "./VCstore";
import IconFont from "../../components/ui/IconFont";
import { showToast } from "../../utils/showToast";
import { strings } from "instabug-reactnative";
import SingleVC from './SsiSingleVC'

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
  data: Array<JwtCredentialPayload>;
  modalVisible: boolean;
  modalStates: any;
  shareable: boolean;
  shareTo?: string;
  method?: string;
  VCtoBeShared?: string | undefined;
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

class ShareVcsWithRequesterScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isFingerprintAvailable: false,
      isFirstLoad: Platform.OS === "ios",
      data: [],
      modalVisible: false,
      modalStates: {
        showPrompt: false,
        sharing: false,
        sharedSuccess: false,
        sharedFail: false
      },
      shareable: false
    };
  }
  
  public componentDidMount() {
    // Da usare per test e debug: tre JWT già decodificati da mettere in store
    //let _data = JSON.parse('[{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Identity card","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1603968221,"aud":"","jti":""},{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Tessera Museo","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1605018262,"aud":"","jti":""},{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Diploma Asilo","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1605018262,"aud":"","jti":""}]')
  }

  /**
   * Gestisce la logica dopo che la navigation ha portato la vista da QR Scan a qui
   * @param data Contiene i dati del QR scansionato
   */
  public handleQrDataAfterNavigation(qrData): void {
    console.log("🟢 eseguendo logica per shareReq");
    console.log(`qrData: ${JSON.stringify(qrData)}`);

    // Callback è l'API URL server COMPLETA da invocare quando l'utente decide di codnividere le VCs
    let callback = qrData.callback;
    let method = qrData.callbackMethod;


    // TODO: questi sarebbero i campi che vengono presi dal QR, quindi cambiare quando lato server hanno finito
    // L'app deve mostrare in questa vita SOLO le VC che hanno uno o più di questi campi
    let requestedTypes = ['VerifiableCredential']

    console.log(`\nAPI URL (di tipo ${qrData.callbackMethod}) che verrà chiamata è: ${callback}\n`);

    //let VCs = HardcodedVCs

    //callback = "https://ssi-aria-backend.herokuapp.com/authVC?socketid=vThFWqdWQq6goSdgAAAD"

    // Carica le VCs da store
    void VCstore.getVCs().then((data): void => {
      if (!data) {
        return;
      }
      // eslint-disable-next-line functional/no-let
      let i = data.length;
      while (i--) {
        console.log(
          "VC type in the list #" + i + ": " + JSON.stringify(data[i].vc.type)
        );
        let isVcValid = false;
        requestedTypes.forEach(requestedType => {
          data[i].vc.type.forEach(vcType => {
            if (vcType === requestedType) {
              isVcValid = true;
            }
          });
        });

        if (!isVcValid) {
          data.splice(i, 1);
        } else {
          data[i].selected = true;
        }
      }

      // Aggiorna stato della vista
      // shareable: aggiorna il flag del button blu "YES" (switcha se cliccabile o meno), siccome carico tutte come checkate, ora è su true
      this.setState({
        data: data,
        shareable: true,
        modalVisible: false,
        modalStates: {
          showPrompt: false,
          sharing: false,
          sharedSuccess: false,
          sharedFail: false
        },
        shareTo: callback,
        method: method,
        // TODO: che passare come JSON qui?
        VCtoBeShared: JSON.stringify({
          verifiableCredential:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw"
        })
      });
    });
  }

  private shareVCnow = () => {
    const shareTo = this.state.shareTo;
    const method = this.state.method;
    let VCsToBeShared = [];

    this.state.data.forEach(VCinState => {
      if (VCinState.selected === true) VCsToBeShared.push(VCinState.jwt);
    });


    console.log('sto per fare una fetch per la shareVC')
    console.log('metodo della richiesta (preso da QR): ' + method)
    console.log('callback url: ' + shareTo)
    console.log('body: ' + JSON.stringify({"verifiableCredential":VCsToBeShared[0]}))


    fetch(shareTo, {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"verifiableCredential":VCsToBeShared[0]})
    })
      .then(response => response.json())
      .then(data => {
        console.info("Success:", JSON.stringify(data));
        this.setState({
          modalVisible: true,
          modalStates: {
            showPrompt: false,
            sharing: false,
            sharedSuccess: true,
            sharedFail: false
          }
        });
      })
      .catch(error => {
        console.info("Error:", error);
        this.setState({
          modalVisible: true,
          modalStates: {
            showPrompt: false,
            sharing: false,
            sharedSuccess: false,
            sharedFail: true
          }
        });
      });
  };

  // FIXME: metodo non più usato, valutare se toglierlo
  private saveVCinTheStore = jwt => {
    console.log("saving new jwt in the store: " + jwt);
    VCstore.storeVC(jwt).then(() => {
      VCstore.getVCs().then(data => {
        this.setState({ data: data });
      });
    });
  };

  /**
   * Metodo che viene chiamato quando si apre questa vista.
   */
  private checkParamsOnWillFocus = () => {
    console.log(JSON.stringify(this.props.navigation.state.params));
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.action
    ) {
      this.handleQrDataAfterNavigation(this.props.navigation.state.params.data);
    }
  };

  private textHeader = (headerTitle: string) => {
    return (
      <Text
        style={{
          color: variables.colorWhite,
          fontWeight: "bold",
          textAlign: "center"
        }}
      >
        {headerTitle}
      </Text>
    );
  };

  // Funzione che verra passata alla SingleVC View per fare il toggle della checkbox
  private checkSelectedVC = (info : JwtCredentialPayload) => {
     //  Aggiorno i data dello stato 
     const updatedData = this.state.data.map((item, index) => {
      return (index === info.index) 
        ? {...item, selected: !item.selected}
        : item
    })
    
    // Cerca se ci sono VC selezionati, altrimenti ritorna undefined
    const isSharable = updatedData.find(item => item.selected === true)
    
    // Aggiorna la vista della componente
    this.setState({ data : updatedData, shareable: Boolean(isSharable) });
  }

  /**
   * Genera la vista di una singola VC (functional component passata alla FlatList)
   * @param info: contiene la VC i-esima
   */
  private renderItem = (info: ListRenderItemInfo<JwtCredentialPayload>) => {
    const VC = info.item;
    //console.log(JSON.stringify(VC))

    console.log('renderizzazione di una VC: ' + VC.vc.type.toString())

    return (
      <SingleVC key={info.item.sub} info={info} onPress={() => this.checkSelectedVC(info)} />
    )

  }

  public render() {
    return (
      <TopScreenComponent
        faqCategories={["profile", "privacy", "authentication_SPID"]}
        headerTitle={I18n.t("ssi.title")}
        goBack={true}
      >
        <ScreenContent
          title={I18n.t("ssi.vcslist.title")}
          subtitle={I18n.t("ssi.vcslist.subtitle")}
          icon={require("../../../img/icons/gears.png")}
        >
          <Text style={{padding: 20 }}>
            Do you want to share this credentials?
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableHighlight
              style={{
                ...styles.openButton,
                backgroundColor: this.state.shareable
                  ? variables.brandPrimary
                  : variables.brandMildGray,
                marginHorizontal: 20,
                width: "35%"
              }}
              disabled={!this.state.shareable}
              onPress={() => {
                console.log(this.state.shareable);
                if (!this.state.shareable) return;
                this.setState({
                  modalStates: {
                    showPrompt: false,
                    sharing: true,
                    sharedSuccess: false,
                    sharedFail: false
                  }
                });
                this.shareVCnow();
              }}
            >
              <Text style={styles.textStyle}>Yes</Text>
            </TouchableHighlight>

            <TouchableHighlight
              style={{
                ...styles.openButton,
                backgroundColor: variables.brandDanger,
                marginHorizontal: 20,
                width: "35%"
              }}
              onPress={() => {
                this.props.navigateToSsiHome();
              }}
            >
              <Text style={styles.textStyle}>No</Text>
            </TouchableHighlight>
          </View>

          <View
            style={{
              borderBottomColor: variables.brandGray,
              borderTopWidth: 0.5,
              margin: 15
            }}
          ></View>

          <FlatList
            ItemSeparatorComponent={ItemSeparator}
            data={this.state.data}
            renderItem={this.renderItem}
          />
        </ScreenContent>
        <NavigationEvents onWillFocus={this.checkParamsOnWillFocus} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {this.state.modalStates.sharing && (
                <>
                  <Text style={styles.modalText}>Sharing credential...</Text>
                  <ActivityIndicator />
                </>
              )}

              {this.state.modalStates.sharedSuccess && (
                <>
                  <Text style={styles.modalText}>Credential shared!</Text>
                  <Text style={styles.modalText}>✅</Text>

                  <TouchableHighlight
                    style={{
                      ...styles.openButton,
                      backgroundColor: variables.brandPrimary
                    }}
                    onPress={() => {
                      this.setState({ modalVisible: false });
                      this.setState({
                        modalStates: {
                          showPrompt: true,
                          sharing: false,
                          sharedSuccess: false,
                          sharedFail: false
                        }
                      });
                      this.props.navigateToSsiHome()
                    }}
                  >
                    <Text style={styles.textStyle}>Ok, thanks</Text>
                  </TouchableHighlight>
                </>
              )}

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
interface Style {
  centeredView: ViewStyle;
  modalView: ViewStyle;
  openButton: ViewStyle;
  textStyle: TextStyle;
  modalText: TextStyle;
}

const ItemSeparator = () => <ItemSeparatorComponent noPadded={true} />;

const styles = StyleSheet.create<Style>({
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
    textAlign: "center"
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
)(withLightModalContext(ShareVcsWithRequesterScreen));
