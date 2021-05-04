/**
 * Implementazione della vista che compare dopo la scansione di un QR di tipo Share Req. L'utente potrà selezionare quali VCs convidivdere.
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
  ViewStyle,
  TextStyle,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import {connect} from "react-redux";
import {CredentialPayload, JwtCredentialPayload} from "did-jwt-vc";
import {JWT} from "did-jwt-vc/lib/types";
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
  navigateToLanguagePreferenceScreen,
  navigateToSsiHome
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
import variables from "../../theme/variables";
import {DidSingleton} from "../../types/DID";
import {getSsiAccessToken, setSsiAccessToken} from "../../utils/keychain";
import { grantTokenSelector, sessionTokenSelector, tokenExpirationSelector } from "../../store/reducers/authentication";
import {notificationsInstallationSelector} from "../../store/reducers/notifications/installation";
import IconFont from "../../components/ui/IconFont";
import VCstore from "./VCstore";
import SingleVC from './SsiSingleVC';
import {encodeVerifiablePresentation} from "./VerifiablePresentations";
import NetCode from "./NetCode";
import { fetchWithTimeout } from "./SsiUtils";

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
  data: Array<CredentialPayload>;
  modalVisible: boolean;
  modalStates: any;
  shareable: boolean;
  callbackUrl?: RequestInfo;
  method?: string;
  notificationToken: string;
  errorMessage: string;
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
      shareable: false,
      errorMessage: ""
    };
  }

  public componentDidMount() {
    // Da usare per test e debug: tre JWT già decodificati da mettere in store
    // let _data = JSON.parse('[{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Identity card","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1603968221,"aud":"","jti":""},{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Tessera Museo","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1605018262,"aud":"","jti":""},{"exp":1,"vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"name":"Diploma Asilo","number":"AB1234567","firstName":"Andrea","lastName":"Taglia","iss":"did:ethr:0x9fe146cd95b4ff6aa039bf075c889e6e47f8bd18"}},"iss":"did:ethr:0xE6CE498981b4ba9e83e209f8E02629494FC31bc9","sub":"did:ethr:0x45","nbf":1605018262,"aud":"","jti":""}]')
  }

  /**
   * Gestisce la logica dopo che la navigation ha portato la vista da QR Scan a qui
   * @param qrData
   */
  public handleQrDataAfterNavigation(qrData: any): void {
    console.log("🟢 eseguendo logica per shareReq");
    console.log(`qrData: ${JSON.stringify(qrData)}`);

    // Callback è l'API URL server COMPLETA da invocare quando l'utente decide di codnividere le VCs
    const callback = qrData.callback;
    const method = qrData.callbackMethod;


    // TODO: questi sarebbero i campi che vengono presi dal QR, quindi cambiare quando lato server hanno finito
    // L'app deve mostrare in questa vita SOLO le VC che hanno uno o più di questi campi
    const requestedTypes = ['VerifiableCredential'];

    console.log(`\nAPI URL (di tipo ${qrData.callbackMethod}) che verrà chiamata è: ${callback}\n`);

    // let VCs = HardcodedVCs

    // callback = "https://ssi-aria-backend.herokuapp.com/authVC?socketid=vThFWqdWQq6goSdgAAAD"

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
        data,
        shareable: true,
        modalVisible: false,
        modalStates: {
          showPrompt: false,
          sharing: false,
          sharedSuccess: false,
          sharedFail: false
        },
        callbackUrl: callback,
        method,
      });
    });
  }

  private salvaAccessTokeNelKeychain = async (response: any) => {
    if (typeof response === 'boolean' && !response) {
      // HTTP Failure
      console.log('la chiamata http per la sign request è fallita...');
    } else {
      // HTTP Success
      if (response.hasOwnProperty('access_token')) {
        // Nella risposta c'è l'access_token
        await setSsiAccessToken(response.access_token);
      } else {
        // Forma della risposta non corretta
        this.setState({ errorMessage: I18n.locale === "it" ? "Autenticazione fallita" : "Authentication failed" });
        console.log(`[signRequest] errored: mi aspettavo un <access_token> nella risposta, ma non l'ho trovato...`);
        throw new TypeError(I18n.locale === "it" ? "Autenticazione fallita" : "Authentication failed");
      }
    }
  };

  private shareVCnow = async () => {

    this.setState(prevState => ({
      modalVisible: true,
      modalStates: {...prevState.modalStates, sharing: true}
    }));

    if (this.state.callbackUrl === undefined) {
      throw new TypeError("La callbackUrl da QR Code non può essere undefined!");
    }

    if (this.state.method === undefined) {
      throw new TypeError("Il method della callback ottenuto QR Code non può essere undefined!");
    }

    const callbackUrl: RequestInfo = this.state.callbackUrl;
    const method: string = this.state.method;
    const VCsToBeShared: Array<JWT> = [];

    this.state.data.forEach(VCinState => {
      if (VCinState.selected === true) {VCsToBeShared.push(VCinState.jwt);}
    });

    let VerifiablePresentationDaCondividere: string;
    try {
      console.log(`costruisco la Verifiable Presentation da condividere`);
      VerifiablePresentationDaCondividere = await encodeVerifiablePresentation(VCsToBeShared);
      console.log(`la Verifiable Presentation è stata costruita`);
    } catch (errVP) {
      console.error(`impossibile costruire la Verifiable Presentation: ${JSON.stringify(errVP)}`);
      return;
    }

    console.log('sto per fare una fetch per condividere la Verifiable Presentation appena costruita');

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    // headers.append("authorization", "Bearer " + await getSsiAccessToken());
    const body = JSON.stringify({ 
      verifiablePresentation: VerifiablePresentationDaCondividere,
      apimanagerTokens: {
        session_token: this.props.sessionToken,
        grant_token: this.props.grantToken,
        expires_in: this.props.tokenExpiration,
      } });
    console.log('metodo della richiesta (preso da QR): ' + method);
    console.log('callback url: ' + callbackUrl);
    console.log('headers: ' + JSON.stringify(headers));
    console.log('body: ' + body);

    try {
        
        
        const response  = await fetchWithTimeout(callbackUrl, {
                  method: method.toUpperCase(),
                  headers,
                  body,
              });
        
        const data = await response.json();


        console.info("Response received:", JSON.stringify(data));
        this.setState({
          modalVisible: true,
          modalStates: {
            showPrompt: false,
            sharing: false,
            sharedSuccess: true,
            sharedFail: false
          }
        });

        if(callbackUrl.toString().includes('/auth/VID')) {
          await this.salvaAccessTokeNelKeychain(data);
        }

        console.log('PROPS: ' + JSON.stringify(this.props));

        const userCreationResponse = await NetCode.createNewUser(DidSingleton.getDidAddress(), this.props.notificationToken);

        if (!userCreationResponse) {
          // Fail
          console.log('unable to create user in the backned service');
        } else {
          // Success
          console.log(`l'utente è stato correttamente creato nel servizio backend`);
        }

      } catch (error) {
        console.info("Error:", error);

        if (error.name === 'AbortError') {
          this.setState({ errorMessage : "Network Error" });
        } else {
          this.setState({ errorMessage : error.message });
        }

        this.setState({
          modalVisible: true,
          modalStates: {
            showPrompt: false,
            sharing: false,
            sharedSuccess: false,
            sharedFail: true
           }
         });
      }

      
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


  // Funzione che verra passata alla SingleVC View per fare il toggle della checkbox
  private checkSelectedVC = (info: JwtCredentialPayload) => {
    //  Aggiorno i data dello stato
    const updatedData = this.state.data.map((item, index) => (index === info.index)
        ? {...item, selected: !item.selected}
        : item);

    // Cerca se ci sono VC selezionati, altrimenti ritorna undefined
    const isSharable = updatedData.find(item => item.selected === true);

    // Aggiorna la vista della componente
    this.setState({data: updatedData, shareable: Boolean(isSharable)});
  };

  /**
   * Genera la vista di una singola VC (functional component passata alla FlatList)
   * @param info: contiene la VC i-esima
   */
  private renderItem = (info: ListRenderItemInfo<JwtCredentialPayload>) => {
    const VC = info.item;
    // console.log(JSON.stringify(VC))

    console.log('renderizzazione di una VC: ' + VC.vc.type.toString());
    console.log('info.item=', info.item);
    // return <Text>Prova</Text>;
    return (
      <SingleVC key={info.item.sub} vCredential={info.item} onPress={() => this.checkSelectedVC(info)}/>
    );

  };

  public render() {

    const { errorMessage } = this.state;

    const errorMessageToShow = errorMessage ? errorMessage : I18n.t('ssi.shareReqScreen.failedShare');

    return (
      <TopScreenComponent
        faqCategories={["profile", "privacy", "authentication_SPID"]}
        headerTitle={I18n.t("ssi.title")}
        goBack={true}
      >
        <ScreenContent
          title={I18n.t("ssi.shareReqScreen.title")}
          subtitle={I18n.t("ssi.vcslist.subtitle")}
          icon={require("../../../img/icons/gears.png")}
        >
          <Text style={styles.header}>
            {I18n.t("ssi.shareReqScreen.question")}
          </Text>

          <View style={{flexDirection: "row", justifyContent: "center"}}>
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
                if (!this.state.shareable) {return;}
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
              <Text style={styles.textStyle}>
                {I18n.t("ssi.shareReqScreen.buttonYes")}
              </Text>
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
              <Text style={styles.textStyle}>
              {I18n.t("ssi.shareReqScreen.buttonNo")}
              </Text>
            </TouchableHighlight>
          </View>

          <View style={{
              borderBottomColor: variables.brandGray,
              borderTopWidth: 0.5,
              margin: 15
            }}/>

          <FlatList
            ItemSeparatorComponent={ItemSeparator}
            data={this.state.data}
            renderItem={this.renderItem}
          />
        </ScreenContent>
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
                    {I18n.t("ssi.shareReqScreen.loadingText")}
                  </Text>
                  <ActivityIndicator size="large" color={variables.brandPrimary} />
                </>
              )}

              {this.state.modalStates.sharedSuccess && (
                <>
                  <Text style={styles.modalText}>
                  {I18n.t("ssi.shareReqScreen.successShare")}
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
                      this.props.navigateToSsiHome();
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
                  {errorMessageToShow}
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
interface Style {
  header: TextStyle;
  centeredView: ViewStyle;
  bgOpacity: ViewStyle;
  modalView: ViewStyle;
  openButton: ViewStyle;
  buttonText: TextStyle;
  textStyle: TextStyle;
  modalText: TextStyle;
}

const ItemSeparator = () => <ItemSeparatorComponent noPadded={true}/>;

const styles = StyleSheet.create<Style>({
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
  openButton: {
    backgroundColor: variables.brandPrimary,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    elevation: 2,
  },
  buttonText: {
    color: variables.colorWhite,
    fontSize: variables.fontSize2,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    textAlign: "center"
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",
    fontSize: variables.fontSize3,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
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
    optionMobilePhone: profileMobilePhoneSelector(state),
    notificationToken: notificationsInstallationSelector(state).token,
    sessionToken: sessionTokenSelector(state),
    grantToken: grantTokenSelector(state),
    tokenExpiration: tokenExpirationSelector(state)
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
