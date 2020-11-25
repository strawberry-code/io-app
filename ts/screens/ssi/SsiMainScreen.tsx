import { Millisecond } from "italia-ts-commons/lib/units";
import { List, ListItem, Text, Toast, View } from "native-base";
import * as React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TouchableHighlight,
  ViewStyle,
  TextStyle
} from "react-native";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { TranslationKeys } from "../../../locales/locales";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { ContextualHelp } from "../../components/ContextualHelp";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import Switch from "../../components/ui/Switch";
import { bpdEnabled, isPlaygroundsEnabled } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import { setDebugModeEnabled } from "../../store/actions/debug";
import {
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import { updatePin } from "../../store/actions/pinset";
import { clearCache } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { notificationsInstallationSelector } from "../../store/reducers/notifications/installation";
import { isPagoPATestEnabledSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { getAppVersion } from "../../utils/appVersion";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { isDevEnv } from "../../utils/environment";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";
import { bpdDeleteUserFromProgram } from "../../features/bonus/bpd/store/actions/onboarding";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import IconFont from "../../components/ui/IconFont";
import variables from "../../theme/variables";
import { navigateToPaymentScanQrCode } from "../../store/actions/navigation";
import { DidSingleton } from "../../types/DID";
import { VerifiedCredential } from "did-jwt-vc";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import VCstore from "./VCstore";
import SsiModal from "./SsiModal";
import { useRef } from "react";
import AnimatedScreenContent from "../../components/screens/AnimatedScreenContent";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps &
  LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  tapsOnAppVersion: number;
  isLoading: boolean;
  isModalVisible: boolean;
};

interface Style {
  itemLeft: ViewStyle;
  qrButton: ViewStyle;
  white: TextStyle;
  itemLeftText: TextStyle;
  developerSectionItem: ViewStyle;
  developerSectionItemLeft: ViewStyle;
  developerSectionItemRight: ViewStyle;
  modalHeader: TextStyle;
  whiteBg: ViewStyle;
  noRightPadding: ViewStyle;
}

const styles = StyleSheet.create<Style>({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  qrButton: {
    margin: 20
  },
  white: {
    color: variables.colorWhite
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  developerSectionItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  developerSectionItemLeft: {
    flex: 1
  },
  developerSectionItemRight: {
    flex: 0
  },
  modalHeader: {
    lineHeight: 40
  },
  whiteBg: {
    backgroundColor: customVariables.colorWhite
  },

  noRightPadding: {
    paddingRight: 0
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const AnimatedScreenContentHeader = Animated.createAnimatedComponent(
  ScreenContentHeader
);

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

/**
 * A screen to show all the options related to the user profile
 */
class SsiMainScreen extends React.PureComponent<Props, State> {
  private navListener?: NavigationEventSubscription;
  private verifiedCredentials: Array<VerifiedCredential> | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      tapsOnAppVersion: 0,
      isLoading: true,
      isModalVisible: false
    };
    this.handleClearCachePress = this.handleClearCachePress.bind(this);
  }

  public async componentDidMount() {
    //let hardcodedJwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw"
    //let hardcodedJwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJleHAiOjEsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiMCI6IkoiLCIxIjoidyIsIjIiOiJ0IiwiMyI6IkMiLCI0IjoiciIsIjUiOiJlIiwiNiI6ImQiLCI3IjoiZSIsIjgiOiJuIiwiOSI6InQiLCIxMCI6ImkiLCIxMSI6ImEiLCIxMiI6ImwiLCIxMyI6IlMiLCIxNCI6InUiLCIxNSI6ImIiLCIxNiI6ImoiLCIxNyI6ImUiLCIxOCI6ImMiLCIxOSI6InQifX0sImlzcyI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsInN1YiI6ImRpZDpldGhyOjB4NDUiLCJuYmYiOjE2MDM4ODg4OTMsImF1ZCI6IiIsImp0aSI6IiJ9.u_f-dxW2_mZU0YqlZ0EY6c2wTGJczMqs6Kkh8lD3RVCuD2VXMVVQ3ulWiC4GtxEJpp3hwjxyoUoUrGucUBajcQ"
    //let hardcodedJwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJleHAiOjEsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsibmFtZSI6IklkZW50aXR5IGNhcmQiLCJudW1iZXIiOiJBQjEyMzQ1NjciLCJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImlzcyI6ImRpZDpldGhyOjB4OWZlMTQ2Y2Q5NWI0ZmY2YWEwMzliZjA3NWM4ODllNmU0N2Y4YmQxOCJ9fSwiaXNzIjoiZGlkOmV0aHI6MHhFNkNFNDk4OTgxYjRiYTllODNlMjA5ZjhFMDI2Mjk0OTRGQzMxYmM5Iiwic3ViIjoiZGlkOmV0aHI6MHg0NSIsIm5iZiI6MTYwMzk2ODIyMSwiYXVkIjoiIiwianRpIjoiIn0.qF5QFn6o2opxdrpZ8Ue0-dKABK28fU58pqBgv-BGxoTfGhRZkg6EH2rrkcxwoqGWg1YmuOdtHz4gPcp6cpm4VA"
    //await VCstore.clearStore()
    //await VCstore.storeVC(hardcodedJwt)
    //await VCstore.storeVC(hardcodedJwt)
    this.verifiedCredentials = await VCstore.getVCs();
    this.setState({ isLoading: false });
    console.log(
      `Verified credentials loaded (${
        this.verifiedCredentials.length
      }): ' + ${JSON.stringify(this.verifiedCredentials)}`
    );
    // eslint-disable-next-line functional/immutable-data
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "light-content",
        customVariables.brandDarkGray
      );
    }); // eslint-disable-line
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
    // This ensures modals will be closed (if there are some opened)
    this.props.hideModal();
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
  }

  private handleClearCachePress() {
    Alert.alert(
      I18n.t("profile.main.cache.alert"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            this.props.clearCache();
            Toast.show({ text: I18n.t("profile.main.cache.cleared") });
          }
        }
      ],
      { cancelable: false }
    );
  }

  private developerListItem(
    title: string,
    switchValue: boolean,
    onSwitchValueChange: (value: boolean) => void,
    description?: string
  ) {
    return (
      <ListItem style={styles.noRightPadding}>
        <View style={styles.developerSectionItem}>
          <View style={styles.developerSectionItemLeft}>
            <Text style={styles.itemLeftText}>{title}</Text>

            <Text style={styles.itemLeftText}>{description}</Text>
          </View>
          <View style={styles.developerSectionItemRight}>
            <Switch value={switchValue} onValueChange={onSwitchValueChange} />
          </View>
        </View>
      </ListItem>
    );
  }

  private debugListItem(title: string, onPress: () => void, isDanger: boolean) {
    return (
      <ListItem style={styles.noRightPadding}>
        <ButtonDefaultOpacity
          primary={true}
          danger={isDanger}
          small={true}
          onPress={onPress}
        >
          <Text numberOfLines={1}>{title}</Text>
        </ButtonDefaultOpacity>
      </ListItem>
    );
  }

  private versionListItem(title: string, onPress: () => void) {
    return (
      <ListItem style={styles.noRightPadding}>
        <Text numberOfLines={1} semibold={true} onPress={onPress}>
          {title}
        </Text>
      </ListItem>
    );
  }

  private onLogoutPress = () => {
    Alert.alert(
      I18n.t("profile.logout.menulabel"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: this.props.logout
        }
      ],
      { cancelable: true }
    );
  };

  private showModal() {
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }

  private onPagoPAEnvironmentToggle = (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmTitle"),
        I18n.t("profile.main.pagoPaEnvironment.alertConfirmMessage"),
        [
          {
            text: I18n.t("global.buttons.cancel"),
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "destructive",
            onPress: () => {
              this.props.setPagoPATestEnabled(enabled);
              this.showModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.props.setPagoPATestEnabled(enabled);
      this.showModal();
    }
  };

  private idResetTap?: number;

  // When tapped 5 time activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  private onTapAppVersion = () => {
    if (this.idResetTap) {
      clearInterval(this.idResetTap);
    }
    // do nothing
    if (this.props.isDebugModeEnabled || isDevEnv) {
      return;
    }
    if (this.state.tapsOnAppVersion === consecutiveTapRequired) {
      this.props.setDebugModeEnabled(true);
      this.setState({ tapsOnAppVersion: 0 });
      Toast.show({ text: I18n.t("profile.main.developerModeOn") });
    } else {
      // eslint-disable-next-line
      this.idResetTap = setInterval(
        this.resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      const tapsOnAppVersion = this.state.tapsOnAppVersion + 1;
      this.setState({
        tapsOnAppVersion
      });
    }
  };

  private resetAppTapCounter = () => {
    this.setState({ tapsOnAppVersion: 0 });
    clearInterval(this.idResetTap);
  };

  private ServiceListRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.ServiceListRef.current) {
      this.ServiceListRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  };

  // eslint-disable-next-line
  public render() {
    const {
      navigation,
      backendInfo,
      sessionToken,
      walletToken,
      notificationToken,
      notificationId
    } = this.props;

    const showInformationModal = (
      title: TranslationKeys,
      body: TranslationKeys
    ) => {
      this.props.showModal(
        <ContextualHelp
          onClose={this.props.hideModal}
          title={I18n.t(title)}
          body={() => <Markdown>{I18n.t(body)}</Markdown>}
        />
      );
    };

    const windowWidth = Dimensions.get("window").width;
    const crossMenuSizeFactor = windowWidth * 0.4;
    const crossBorderWidth = 0.5;
    const inspectCss = false;

    // define a widely customisable functional component used to draw a touchable item in the cross menu
    const touchableMenuItem = (
      left: boolean,
      right: boolean,
      top: boolean,
      bottom: boolean,
      icon: string,
      text: string,
      callback: () => void
    ) => (
      <TouchableOpacity
        onPress={callback}
        style={{
          width: crossMenuSizeFactor,
          height: crossMenuSizeFactor,
          borderColor: inspectCss ? "red" : "#AAAAAA",
          borderLeftWidth: inspectCss && left ? crossBorderWidth : 0,
          borderRightWidth: inspectCss && right ? crossBorderWidth : 0,
          borderBottomWidth: inspectCss && bottom ? crossBorderWidth : 0,
          borderTopWidth: inspectCss && top ? crossBorderWidth : 0,
          backgroundColor: inspectCss ? "cyan" : undefined
        }}
      >
        <View
          style={{
            flex: 1,
            //backgroundColor: inspectCss ? "pink" : "#EEEEEE",
            justifyContent: "center",
            borderRadius: 100,
            borderWidth: 0.6,
            borderColor: customVariables.brandPrimary,
            backgroundColor: "white",
            shadowColor: "black",
            shadowOpacity: 0.2,
            shadowOffset: {
              width: 0,
              height: 2
            },
            elevation: 3,
            margin: 15
          }}
        >
          <IconFont
            style={{ textAlign: "center", justifyContent: "center" }}
            name={icon}
            size={50}
          />
          <Text
            style={{
              textAlign: "center",
              justifyContent: "center",
              backgroundColor: inspectCss ? "yellow" : undefined,
              fontSize: 13
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );

    // Define a cross menu functional component with four touchable items
    const crossMenu = () => (
      <View>
        <View
          style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
        >
          {touchableMenuItem(
            false,
            true,
            false,
            true,
            "io-service-list",
            "Verified\nCredentials",
            async () => {
              navigation.navigate(ROUTES.SSI_VERIFIED_CREDENTIALS_SCREEN); // devonly: navigator placeholder
              //alert('clicked A')
            }
          )}
          {touchableMenuItem(
            true,
            false,
            false,
            true,
            "io-portafoglio",
<<<<<<< HEAD
            "Bilancio e Transazioni",
            () => navigation.navigate(ROUTES.SSI_BALANCE_TRANSACTION_SCREEN)
          )}
=======
            "Balance & Transaction",
            async () => {
              // await DidSingleton.loadDidFromKeychain()
              // alert(DidSingleton.getDidAddress())
              console.log((await VCstore.getJwts()).forEach(item => {
                console.log(item)
              }))
              navigation.navigate(ROUTES.SSI_WALLET_BALANCE_AND_TRANSACTION);
            })}
>>>>>>> a1246cc430aa9bb3e882b55441c11b40131a2ad8
        </View>
        <View style={{flex: 1, flexDirection: "row", justifyContent: "center"}}>
          {touchableMenuItem(false, true, true, false, "io-share","Invia dal Wallet", async () => {
            // await DidSingleton.loadDidFromKeychain()
            // alert(DidSingleton.getDidAddress())
            console.log((await VCstore.getJwts()).forEach(item => {
              console.log(item)
            }))
            navigation.navigate(ROUTES.SSI_WALLET_SEND_SCREEN);
          })}
          {touchableMenuItem(true, false, true, false, "io-save","Ricevi nel Wallet", async () => {
            // VCstore.clearStore()
            // console.log(await VCstore.getVCs())
            // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw'
             navigation.navigate(ROUTES.SSI_WALLET_RECEIVE_SCREEN);
            })}
        </View>
      </View>
    );

    const footerButton = () => (
      <ButtonDefaultOpacity
        block={true}
        onPress={this.props.navigateToPaymentScanQrCode}
        activeOpacity={1}
      >
        <IconFont name="io-qr" style={styles.white} />
        <Text>{I18n.t("ssi.scanQr")}</Text>
      </ButtonDefaultOpacity>
    );

    // eslint-disable
    const screenContent = () => {
      const childRef = useRef();
      return (
        <ScrollView ref={this.ServiceListRef} style={styles.whiteBg}>
          <NavigationEvents onWillFocus={this.scrollToTop} />
          <View spacer={true} />

          {crossMenu()}
          <View style={styles.qrButton}>{footerButton()}</View>
          <SsiModal ref={childRef} />

          <TouchableHighlight
            onPress={() => {
              childRef.current.changeText(true);
            }}
          >
            <Text>Show Modal</Text>
          </TouchableHighlight>

          <List withContentLateralPadding={true}>
            {/* Preferences */}
            <ListItemComponent
              title={I18n.t("profile.main.preferences.title")}
              subTitle={I18n.t("profile.main.preferences.description")}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_PREFERENCES_HOME)
              }
              isFirstItem={true}
            />

            {/* Privacy */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.title")}
              subTitle={I18n.t("profile.main.privacy.description")}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
            />

            {/* Privacy */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.title")}
              subTitle={I18n.t("profile.main.privacy.description")}
              onPress={() => navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)}
            />

            {/* APP IO */}
            <ListItemComponent
              title={I18n.t("profile.main.appInfo.title")}
              subTitle={I18n.t("profile.main.appInfo.description")}
              onPress={() =>
                showInformationModal(
                  "profile.main.appInfo.title",
                  "profile.main.appInfo.contextualHelpContent"
                )
              }
              isLastItem={true}
            />

            <SectionHeaderComponent
              sectionHeader={I18n.t("profile.main.accountSectionHeader")}
            />

            {/* Reset unlock code */}
            <ListItemComponent
              title={I18n.t("identification.unlockCode.reset.button_short")}
              subTitle={I18n.t("identification.unlockCode.reset.subtitle")}
              onPress={this.props.resetPin}
              hideIcon={true}
            />

            {/* Logout/Exit */}
            <ListItemComponent
              title={I18n.t("profile.main.logout")}
              subTitle={I18n.t("profile.logout.menulabel")}
              onPress={this.onLogoutPress}
              hideIcon={true}
              isLastItem={true}
            />

            {this.versionListItem(
              `${I18n.t("profile.main.appVersion")} ${getAppVersion()}`,
              this.onTapAppVersion
            )}

            {/* Developers Section */}
            {(this.props.isDebugModeEnabled || isDevEnv) && (
              <React.Fragment>
                <SectionHeaderComponent
                  sectionHeader={I18n.t("profile.main.developersSectionHeader")}
                />
                <View
                  style={{ backgroundColor: "pink", height: 100, width: 300 }}
                ></View>

                {
                  // since no experimental features are available we avoid to render this item (see https://www.pivotaltracker.com/story/show/168263994).
                  // It could be useful when new experimental features will be available
                  /*
                  this.developerListItem(
                  I18n.t("profile.main.experimentalFeatures.confirmTitle"),
                  this.props.isExperimentalFeaturesEnabled,
                  this.onExperimentalFeaturesToggle
                ) */
                }
                {isPlaygroundsEnabled && (
                  <>
                    <ListItemComponent
                      title={"MyPortal Web Playground"}
                      onPress={() => navigation.navigate(ROUTES.WEB_PLAYGROUND)}
                    />
                    <ListItemComponent
                      title={"Markdown Playground"}
                      onPress={() =>
                        navigation.navigate(ROUTES.MARKDOWN_PLAYGROUND)
                      }
                    />
                  </>
                )}
                {this.developerListItem(
                  I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv"),
                  this.props.isPagoPATestEnabled,
                  this.onPagoPAEnvironmentToggle,
                  I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")
                )}
                {this.developerListItem(
                  I18n.t("profile.main.debugMode"),
                  this.props.isDebugModeEnabled,
                  this.props.setDebugModeEnabled
                )}
                {this.props.isDebugModeEnabled && (
                  <React.Fragment>
                    {backendInfo &&
                      this.debugListItem(
                        `${I18n.t("profile.main.backendVersion")} ${
                          backendInfo.version
                        }`,
                        () =>
                          clipboardSetStringWithFeedback(backendInfo.version),
                        false
                      )}

                    {isDevEnv &&
                      sessionToken &&
                      this.debugListItem(
                        `Session Token ${sessionToken}`,
                        () => clipboardSetStringWithFeedback(sessionToken),
                        false
                      )}

                    {isDevEnv &&
                      walletToken &&
                      this.debugListItem(
                        `Wallet token ${walletToken}`,
                        () => clipboardSetStringWithFeedback(walletToken),
                        false
                      )}

                    {isDevEnv &&
                      this.debugListItem(
                        `Notification ID ${notificationId.slice(0, 6)}`,
                        () => clipboardSetStringWithFeedback(notificationId),
                        false
                      )}

                    {isDevEnv &&
                      notificationToken &&
                      this.debugListItem(
                        `Notification token ${notificationToken.slice(0, 6)}`,
                        () => clipboardSetStringWithFeedback(notificationToken),
                        false
                      )}

                    {this.debugListItem(
                      I18n.t("profile.main.cache.clear"),
                      this.handleClearCachePress,
                      true
                    )}

                    {isDevEnv &&
                      this.debugListItem(
                        I18n.t("profile.main.forgetCurrentSession"),
                        this.props.dispatchSessionExpired,
                        true
                      )}

                    {bpdEnabled &&
                      this.debugListItem(
                        "Leave BPD",
                        this.props.dispatchLeaveBpd,
                        true
                      )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

            {/* end list */}
            <EdgeBorderComponent />
          </List>
        </ScrollView>
      );
    };

    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent
        headerTitle={I18n.t("messages.contentTitle")}
        isSearchAvailable={true}
        searchType={"Messages"}
        accessibilityLabel={I18n.t("profile.main.title")}
        appLogo={true}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["profile"]}
      >
        <React.Fragment>
          <AnimatedScreenContentHeader
            title={I18n.t("ssi.title")}
            iconFont={{ name: "io-cie-card" }} // FIXME: cambiare icona
            dynamicHeight={100}
          />
        </React.Fragment>
        {screenContent()}
      </TopScreenComponent>
    ));

    return <ContainerComponent isLoading={this.state.isLoading} />;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  backendInfo: state.backendInfo.serverInfo,
  sessionToken: isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined,
  walletToken: isLoggedInWithSessionInfo(state.authentication)
    ? state.authentication.sessionInfo.walletToken
    : undefined,
  notificationId: notificationsInstallationSelector(state).id,
  notificationToken: notificationsInstallationSelector(state).token,
  isDebugModeEnabled: isDebugModeEnabledSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest({ keepUserData: false })),
  resetPin: () => dispatch(updatePin()),
  clearCache: () => dispatch(clearCache()),
  navigateToPaymentScanQrCode: () => dispatch(navigateToPaymentScanQrCode()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    ),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  dispatchLeaveBpd: () => dispatch(bpdDeleteUserFromProgram.request()),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(SsiMainScreen));
