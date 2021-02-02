import {Millisecond} from "italia-ts-commons/lib/units";
import {List, ListItem, Text, Toast, View} from "native-base";
import * as React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ViewStyle,
  TextStyle,
  Platform
} from "react-native";
import {
  NavigationEvents,
  NavigationEventSubscription,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import {connect} from "react-redux";
import {VerifiedCredential} from "did-jwt-vc";
import {JWT} from "did-jwt-vc/lib/types";
import AsyncStorage from "@react-native-community/async-storage";
import * as Animatable from 'react-native-animatable';
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import {withLightModalContext} from "../../components/helpers/withLightModalContext";
import {ContextualHelpPropsMarkdown} from "../../components/screens/BaseScreenComponent";
import {EdgeBorderComponent} from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import SectionHeaderComponent from "../../components/screens/SectionHeaderComponent";
import {AlertModal} from "../../components/ui/AlertModal";
import {LightModalContextInterface} from "../../components/ui/LightModal";
import Switch from "../../components/ui/Switch";
import {bpdEnabled, isPlaygroundsEnabled} from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import {
  logoutRequest,
  sessionExpired
} from "../../store/actions/authentication";
import {setDebugModeEnabled} from "../../store/actions/debug";
import {
  preferencesExperimentalFeaturesSetEnabled,
  preferencesPagoPaTestEnvironmentSetEnabled
} from "../../store/actions/persistedPreferences";
import {updatePin} from "../../store/actions/pinset";
import {clearCache} from "../../store/actions/profile";
import {Dispatch} from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../store/reducers/authentication";
import {isDebugModeEnabledSelector} from "../../store/reducers/debug";
import {notificationsInstallationSelector} from "../../store/reducers/notifications/installation";
import {isPagoPATestEnabledSelector} from "../../store/reducers/persistedPreferences";
import {GlobalState} from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import {getAppVersion} from "../../utils/appVersion";
import {clipboardSetStringWithFeedback} from "../../utils/clipboard";
import {isDevEnv} from "../../utils/environment";
import {setStatusBarColorAndBackground} from "../../utils/statusBar";
import {bpdDeleteUserFromProgram} from "../../features/bonus/bpd/store/actions/onboarding";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import {ScreenContentHeader} from "../../components/screens/ScreenContentHeader";
import IconFont from "../../components/ui/IconFont";
import variables from "../../theme/variables";
import {navigateToPaymentScanQrCode, navigateToSsiBackupScreen} from "../../store/actions/navigation";
import {DidSingleton} from "../../types/DID";
import {withLoadingSpinner} from "../../components/helpers/withLoadingSpinner";
import VCstore from "./VCstore";
import NetCode from './NetCode';
import {
  decodeBase64,
  exportVCsIos,
  exportVCsAndroid,
  pickSingleFileAndReadItsContent,
  importVCs, copyDidAddress
} from "./SsiUtils";

import DebugSection from "./components/DebugSection";
import CrossMenu from "./components/CrossMenu";

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
    //await VCstore.storeVC("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcFlYUWlPakUxTkRFME9UTTNNalFzSW1WNGNDSTZNVGc1TURNeU1UTTBOU3dpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaUxDSm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OWxlR0Z0Y0d4bGN5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lpd2lRMkZ5ZEdGSlpHVnVkR2wwWVNKZExDSmpjbVZrWlc1MGFXRnNVM1ZpYW1WamRDSTZleUpwWkNJNklrbEVNU0lzSW1acGNuTjBUbUZ0WlNJNkltNWhiV1V4SWl3aWJHRnpkRTVoYldVaU9pSnNZWE15SWl3aVltbHlkR2hrWVhraU9pSXlNREl3TFRBNExUQXpJaXdpY0d4aFkyVlBaa0pwY25Sb0lqb2laSE5oWm1SblptUm9aeUo5ZlN3aWMzVmlJam9pWkdsa09tVjBhSEk2TUhnMlJUSTNPR0V4WlRBMk1USm1Na1EzTlVFelF6QkdOV0kzWkRrd01EVXpNVEk0TldNeU5UWTNJaXdpYW5ScElqb2lhSFIwY0RvdkwyVjRZVzF3YkdVdVpXUjFMMk55WldSbGJuUnBZV3h6THpNM016SWlMQ0pwYzNOMVpYSWlPbnNpYVdRaU9pSWlmU3dpYVhOeklqb2laR2xrT21WMGFISTZNSGcyUlRJM09HRXhaVEEyTVRKbU1rUTNOVUV6UXpCR05XSTNaRGt3TURVek1USTROV015TlRZM0lpd2libUptSWpveE5UUXhORGt6TnpJMExDSnViMjVqWlNJNklqWTJNQ0UyTXpRMVJsTmxjaUlzSW1OeVpXUmxiblJwWVd4VGRHRjBkWE1pT25zaWFXUWlPaUlpTENKMGVYQmxJam9pSW4wc0ltTnlaV1JsYm5ScFlXeFRZMmhsYldFaU9uc2lhV1FpT2lKRFlYSjBZVWxrWlc1MGFYUmhJaXdpZEhsd1pTSTZJbEpsWjJsdmJtVk1iMjFpWVhKa2FXRWlmU3dpYVdRaU9pSTVZVGRoWWpZMk1DMDBZMlJpTFRRNU4yWXRPRGRpWlMwM09UTm1NakV4TldFMllUa2lmUS42WVB0OHNrYWtQZjdIZ0NqSUszaUxBMmxMRWZmZU1QQ2NDdldDbFBPdGRvOThkTEhHLUdKS3cxVmcwNzdiemZRYUVRV0E2SjFvdmpzUFZQZkdXSEw0ZyJdfSwiaXNzIjoiZGlkOmV0aHI6MHg2RTI3OGExZTA2MTJmMkQ3NUEzQzBGNWI3ZDkwMDUzMTI4NWMyNTY3In0.eN5LkPTZgfvbBN052Ews0JW7xlOxOXAernPV0VfUlz5AA6VFztTty4mkEto-iBLFsnC2kI9QsAfAaninLGO7wg")
    //await VCstore.storeVC("eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcFlYUWlPakUyTURnek1EYzROemdzSW1WNGNDSTZNVFl3T0RJME9UWXdNQ3dpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaUxDSm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OWxlR0Z0Y0d4bGN5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lpd2lSR2x0Wlc1emFXOXVaVWx0Y0hKbGMyRWlYU3dpWTNKbFpHVnVkR2xoYkZOMVltcGxZM1FpT25zaWNtRm5hVzl1WlVacGMyTmhiR1VpT2lKU1lXZHBiMjVsSUVacGMyTmhiR1VnTVNJc0luQnBkbUVpT2lKUVlYSjBhWFJoSUVsV1FTQXhJaXdpYVc1a2FYSnBlbnB2VTJWa1pVeGxaMkZzWlNJNklreGhJRlpoYkd4bElHUmxhU0JFYVc1dmMyRjFjbWtpTENKbGJHVm5aMmxpYVd4cGRHRWlPaUpUWlcxd2NtVWlmWDBzSW5OMVlpSTZJbVJwWkRwbGRHaHlPakI0UlRaRFJUUTVPRGs0TVdJMFltRTVaVGd6WlRJd09XWTRSVEF5TmpJNU5EazBSa016TVdKak9TSXNJbXAwYVNJNkltaDBkSEE2THk5bGVHRnRjR3hsTG1Wa2RTOWpjbVZrWlc1MGFXRnNjeTh6TnpNeUlpd2lhWE56ZFdWeUlqcDdJbWxrSWpvaVpHbGtPbVYwYUhJNk1IaEZOa05GTkRrNE9UZ3hZalJpWVRsbE9ETmxNakE1WmpoRk1ESTJNamswT1RSR1F6TXhZbU01SW4wc0ltbHpjeUk2SW1ScFpEcGxkR2h5T2pCNFJUWkRSVFE1T0RrNE1XSTBZbUU1WlRnelpUSXdPV1k0UlRBeU5qSTVORGswUmtNek1XSmpPU0lzSW01aVppSTZNVFl3T0RNd056ZzNPQ3dpYm05dVkyVWlPaUkyTmpBaE5qTTBOVVpUWlhJaUxDSmpjbVZrWlc1MGFXRnNVM1JoZEhWeklqcDdJbWxrSWpvaUlpd2lkSGx3WlNJNklpSjlMQ0pqY21Wa1pXNTBhV0ZzVTJOb1pXMWhJanA3SW1sa0lqb2lSR2x0Wlc1emFXOXVaVWx0Y0hKbGMyRWlMQ0owZVhCbElqb2lVbVZuYVc5dVpVeHZiV0poY21ScFlTSjlMQ0pwWkNJNkltTmpOREUyTXpRNExUZG1Oamd0TkRjMVlTMDVORE5tTFRSa1lqZzNOemt3T0dReVpDSjkuRkNSdGdxRlUwZVozUlFMbzJHT1VNbG1UbGdnQ3Y5SXdpRlFJZ1BXTkFCN29zWGQ2aFZGTWhWSS1LbDhqeDVIQjVteUhFeHI3NzJwd21MS1lmRWR1dmciXX0sImlzcyI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSJ9.3H2WTwhu064ROOtfGVTUxpug2A_qThUG5ICSRvU909AC6qhoNDzivpM_CQjYBzapBLgWVIqQVJfMO6NWNo3utQ")
    this.verifiedCredentials = await VCstore.getVCs();
    console.log('PUSH TOKEN: ' + await AsyncStorage.getItem('PUSH_TOKEN'))
    this.setState({isLoading: false});
    console.log(
      `Verified credentials loaded (${this.verifiedCredentials ? this.verifiedCredentials.length : 'undefined'}): ' + ${JSON.stringify(this.verifiedCredentials)}`
    );
    // eslint-disable-next-line functional/immutable-data
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
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
            Toast.show({text: I18n.t("profile.main.cache.cleared")});
          }
        }
      ],
      {cancelable: false}
    );
  }

  private static developerListItem(
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
            <Switch value={switchValue} onValueChange={onSwitchValueChange}/>
          </View>
        </View>
      </ListItem>
    );
  }

  private static debugListItem(title: string, onPress: () => void, isDanger: boolean) {
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

  private static versionListItem(title: string, onPress: () => void) {
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
          onPress: () => {
            Alert.alert(
              I18n.t("ssi.logout.title"),
              I18n.t("ssi.logout.question"),
              [
                {
                  text: I18n.t("global.yes"),
                  onPress: async () => {
                    if (Platform.OS === 'ios') {
                      await exportVCsIos();
                    } else {
                      await exportVCsAndroid();
                    }
                    await VCstore.clearStore()
                    this.props.logout()
                  }
                },
                {
                  text: I18n.t("global.not"),
                  style: 'destructive',
                  onPress: this.props.logout
                }
              ],
              {cancelable: true}
            );
          }
        }
      ],
      {cancelable: true}
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
        {cancelable: false}
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
      this.setState({tapsOnAppVersion: 0});
      Toast.show({text: I18n.t("profile.main.developerModeOn")});
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
    this.setState({tapsOnAppVersion: 0});
    clearInterval(this.idResetTap);
  };

  private ServiceListRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.ServiceListRef.current) {
      this.ServiceListRef.current.scrollTo({x: 0, y: 0, animated: false});
    }
  };

  // eslint-disable-next-line
  public render() {
    const { navigation } = this.props;

    /*
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
    */

    const qrButtonFooter = () => (
      <ButtonDefaultOpacity
        block={true}
        onPress={this.props.navigateToPaymentScanQrCode}
        activeOpacity={1}
      >
        <IconFont name="io-qr" style={styles.white}/>
        <Text>{I18n.t("ssi.scanQr")}</Text>
      </ButtonDefaultOpacity>
    );

    const messagesButtonFooter = () => (
      <ButtonDefaultOpacity
        block={true}
        onPress={this.props.navigateToPaymentScanQrCode}
        activeOpacity={1}
      >
        <IconFont name="io-messages" style={styles.white}/>
        <Text>{I18n.t("ssi.messages")}</Text>
      </ButtonDefaultOpacity>
    );

    // eslint-disable
    const screenContent = () => {

      return (
        <ScrollView ref={this.ServiceListRef} style={styles.whiteBg}>
          <NavigationEvents onWillFocus={this.scrollToTop}/>
          <View spacer={true}/>
     
          <CrossMenu />
          <View style={styles.qrButton}>{qrButtonFooter()}</View>
          {false && <View style={styles.qrButton}>{messagesButtonFooter()}</View>}

          <List withContentLateralPadding={true}>

            <SectionHeaderComponent
              sectionHeader={I18n.t("profile.main.accountSectionHeader")}
            />

            {/* Preferences */}
            <ListItemComponent
              title={I18n.t("profile.main.preferences.title")}
              subTitle={I18n.t("profile.main.preferences.description")}
              onPress={() =>
                navigation.navigate(ROUTES.PROFILE_PREFERENCES_HOME)
              }
              isFirstItem={true}
              hideIcon
            />

            {/* SSI NOTIFICATIONS */}
            <ListItemComponent
              title={I18n.t("ssi.notifications.title")}
              subTitle={I18n.t("ssi.notifications.subtitle")}
              onPress={() => this.props.navigation.navigate(ROUTES.SSI_NOTIFICATIONS)}
              hideIcon={true}
            />

            {/* SSI BACKUP ON GOOGLE DRIVE */}
            <ListItemComponent
              title={I18n.t("ssi.recoverVCs.google.title")}
              subTitle={I18n.t("ssi.notifications.subtitle")}
              onPress={() => this.props.navigateToSsiBackupScreen()}
              hideIcon={true}
            />

            {/* Codpy DID to clipboard */}
            <ListItemComponent
              title={I18n.t("ssi.copyDID.title")}
              subTitle={I18n.t("ssi.copyDID.subtitle")}
              onPress={() => {

                copyDidAddress()

                /*
                Alert.alert(I18n.t("ssi.copyDID.title"), I18n.t("ssi.copyDID.prompt") + '\n\n' + DidSingleton.getDidAddress(), [
                  {
                    text: I18n.t("rooted.continueAlert.confirmText"),
                    onPress: () => {
                      clipboardSetStringWithFeedback(DidSingleton.getDidAddress())
                    }
                  },
                  {
                    text: I18n.t("rooted.continueAlert.cancelText"), style: 'destructive', onPress: () => {
                    }
                  }
                ])
                 */

              }}
              hideIcon={true}
            />

            {/* Recupera VCs */}
            <ListItemComponent
              title={I18n.t("ssi.recoverVCs.title")}
              subTitle={I18n.t("ssi.recoverVCs.subtitle")}
              onPress={() => {
                Alert.alert(I18n.t("ssi.recoverVCs.title"), I18n.t("ssi.recoverVCs.subtitle"), [
                  {
                    text: I18n.t("rooted.continueAlert.confirmText"),
                    onPress: async () => {
                      let backupSuccess: boolean = await importVCs()
                      if (backupSuccess) {
                        console.log('[main screen] VCs importate da file con successo')
                        navigation.navigate(ROUTES.SSI_VERIFIED_CREDENTIALS_SCREEN);
                        setTimeout(() => {
                          Toast.show({
                            text: I18n.t('ssi.importVCs.toastTitleSuccess'),
                            duration: 4000,
                            type: 'success',
                            position: 'top'
                          })
                        }, 500)
                      } else {
                        Toast.show({
                          text: I18n.t('ssi.importVCs.toastTitleFailure'),
                          duration: 4000,
                          type: 'danger',
                          position: 'top'
                        })
                        console.log('[main screen] non è stato possibile importare le VCs da file')
                      }
                    }
                  },
                  {
                    text: I18n.t("rooted.continueAlert.cancelText"), style: 'destructive', onPress: () => {
                    }
                  }
                ])

              }}
              hideIcon={true}
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

            {SsiMainScreen.versionListItem(
              `${I18n.t("profile.main.appVersion")} ${getAppVersion()}`,
              this.onTapAppVersion
            )}

            <DebugSection />

            {/* end list */}
            <EdgeBorderComponent/>
          </List>
        </ScrollView>
      );
    };

    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent
        headerTitle={I18n.t("messages.contentTitle")}
        isSearchAvailable={false}
        searchType={"Messages"}
        notificationBell={true}
        accessibilityLabel={I18n.t("profile.main.title")}
        appLogo={true}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["profile"]}
      >
        <React.Fragment>
          <AnimatedScreenContentHeader
            title={I18n.t("ssi.title")}
            iconFont={{name: "io-cie-card"}} // FIXME: cambiare icona
            dynamicHeight={100}
            cb={() => {
              copyDidAddress()
            }}
          />
        </React.Fragment>
        {screenContent()}
      </TopScreenComponent>
    ));

    return <ContainerComponent isLoading={this.state.isLoading}/>;
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
  logout: () => dispatch(logoutRequest({keepUserData: false})),
  resetPin: () => dispatch(updatePin()),
  clearCache: () => dispatch(clearCache()),
  navigateToPaymentScanQrCode: () => dispatch(navigateToPaymentScanQrCode()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({isPagoPATestEnabled})
    ),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  dispatchLeaveBpd: () => dispatch(bpdDeleteUserFromProgram.request()),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled)),
  navigateToSsiBackupScreen: () => dispatch(navigateToSsiBackupScreen()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(SsiMainScreen));
