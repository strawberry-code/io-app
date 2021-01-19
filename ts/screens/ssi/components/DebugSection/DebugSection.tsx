import React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { Alert } from "react-native";
import { NavigationInjectedProps, withNavigation } from "react-navigation";

import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";

// REDUX FUNCTIONS
import { preferencesPagoPaTestEnvironmentSetEnabled } from "../../../../store/actions/persistedPreferences";
import { setDebugModeEnabled } from "../../../../store/actions/debug";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";

import ListItemComponent from "../../../../components/screens/ListItemComponent";
import SectionHeaderComponent from "../../../../components/screens/SectionHeaderComponent";
import { withLightModalContext } from "../../../../components/helpers/withLightModalContext";
import { LightModalContextInterface } from "../../../../components/ui/LightModal";
import { AlertModal } from "../../../../components/ui/AlertModal";

import I18n from "../../../../i18n";
import { isDevEnv } from "../../../../utils/environment";
import { isPlaygroundsEnabled } from "../../../../config";
import ROUTES from "../../../../navigation/routes";

import DeveloperListItem from "./DeveloperListItem";
import DebugList from "./DebugList";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps &
  LightModalContextInterface;

const DebugSection = (props: Props) => {
  if (!isDevEnv) {
    return null;
  }

  const showModal = () => {
    props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  };

  const onPagoPAEnvironmentToggle = (enabled: boolean) => {
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
              props.setPagoPATestEnabled(enabled);
              showModal();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      props.setPagoPATestEnabled(enabled);
      showModal();
    }
  };

  return (
    <React.Fragment>
      <SectionHeaderComponent
        sectionHeader={I18n.t("profile.main.developersSectionHeader")}
      />
      <View spacer />

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
            onPress={() => props.navigation.navigate(ROUTES.WEB_PLAYGROUND)}
          />
          <ListItemComponent
            title={"Markdown Playground"}
            onPress={() =>
              props.navigation.navigate(ROUTES.MARKDOWN_PLAYGROUND)
            }
          />
        </>
      )}

      <DeveloperListItem
        title={I18n.t("profile.main.pagoPaEnvironment.pagoPaEnv")}
        switchValue={props.isPagoPATestEnabled}
        onSwitchValueChange={onPagoPAEnvironmentToggle}
        description={I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")}
      />

      <DeveloperListItem
        title={I18n.t("profile.main.debugMode")}
        switchValue={props.isDebugModeEnabled}
        onSwitchValueChange={props.setDebugModeEnabled}
        description={I18n.t("profile.main.pagoPaEnvironment.pagoPAEnvAlert")}
      />

      <DebugList isActive={props.isDebugModeEnabled} />
    </React.Fragment>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isDebugModeEnabled: isDebugModeEnabledSelector(state),
  isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  setPagoPATestEnabled: (isPagoPATestEnabled: boolean) =>
    dispatch(
      preferencesPagoPaTestEnvironmentSetEnabled({ isPagoPATestEnabled })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(withLightModalContext(DebugSection)));
