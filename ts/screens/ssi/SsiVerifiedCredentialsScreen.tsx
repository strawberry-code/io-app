/**
 * Implements the preferences screen where the user can see and update his
 * email, mobile number, preferred language, biometric recognition usage and digital address.
 */
import {fromNullable} from "fp-ts/lib/Option";
import * as React from "react";
import {Text, FlatList, Platform, View, TouchableOpacity, ListRenderItemInfo} from "react-native";
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
  navigateToLanguagePreferenceScreen
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
import {VCitem} from "../../types/SSI";
import {VerifiedCredential} from "did-jwt-vc";
import variables from "../../theme/variables";
import {getVCfromJwt} from "./VCs";
import {HardcodedVCs} from "./VCsJson";

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
      isFirstLoad: Platform.OS === "ios"
    };
  }

  public componentDidMount() {
  }

  private checkParamsOnWillFocus = () => {
    if(this.props.navigation.state.params.sharedVC) {
      alert("hai condiviso una VC:" + JSON.stringify(this.props.navigation.state.params.sharedVC))
    }
  }

  private textHeader = (headerTitle: string) => {
    return (<Text style={{color: variables.colorWhite, fontWeight: 'bold', textAlign: 'center'}}>{headerTitle}</Text>)
  }

  private renderItem = (info: ListRenderItemInfo<VerifiedCredential>) => {
    const VC = info.item;
    console.log(JSON.stringify(VC))
    return (
      <TouchableOpacity
        onPress={() => {
          alert(JSON.stringify(VC.issuer))
        }}>
        <View style={{backgroundColor: variables.brandPrimary, borderColor: '#333333', borderWidth: 0.5, margin: 10, padding: 5, borderRadius: 8}}>
          {this.textHeader("Identity Card")}
          <Text style={{color: variables.colorWhite}}>First Name: {VC.vc.credentialSubject.identityCard.firstName}</Text>
          <Text style={{color: variables.colorWhite}}>Last Name: {VC.vc.credentialSubject.identityCard.lastName}</Text>
          <Text style={{color: variables.colorWhite, fontSize: 10}}>sub: {VC.sub}</Text>
          <Text style={{color: variables.colorWhite, fontSize: 10}}>iss: {VC.iss}</Text>
        </View>
      </TouchableOpacity>
    );
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
          <FlatList
            ItemSeparatorComponent={ItemSeparator}
            data={this.props.navigation.getParam("verifiedCredentials") ? this.props.navigation.getParam("verifiedCredentials")  : HardcodedVCs}
            renderItem={this.renderItem}
          />
        </ScreenContent>
        <NavigationEvents onWillFocus={this.checkParamsOnWillFocus} />
      </TopScreenComponent>
    );
  }

}

const ItemSeparator = () => <ItemSeparatorComponent noPadded={true}/>;

/*
const styles = StyleSheet.create({
  itemLoadingContainer: {
    height: 114,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
  },
  itemLoadingHeaderWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },
  itemLoadingHeaderCenter: {
    flex: 1,
    paddingRight: 55 // Includes right header space
  },
  itemLoadingContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },
  itemLoadingContentCenter: {
    flex: 1,
    paddingRight: 32
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  activityIndicator: {
    padding: 12
  }
});
 */

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
  navigateToLanguagePreferenceScreen: () =>
    dispatch(navigateToLanguagePreferenceScreen()),
  navigateToEmailReadScreen: () => dispatch(navigateToEmailReadScreen()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(PreferencesScreen));
