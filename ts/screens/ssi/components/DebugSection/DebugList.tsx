/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/array-type */
import React from "react";
import { Toast } from "native-base";
import { connect } from "react-redux";
import { Alert } from "react-native";
import { NavigationContainerProps } from "react-navigation";
import { GoogleSignin } from "@react-native-community/google-signin";
import { JWT } from "did-jwt-vc/lib/types";
// STORE ACTIONS
import {
  isLoggedIn,
  isLoggedInWithSessionInfo
} from "../../../../store/reducers/authentication";
import { notificationsInstallationSelector } from "../../../../store/reducers/notifications/installation";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import { isPagoPATestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { sessionExpired } from "../../../../store/actions/authentication";
import { setDebugModeEnabled } from "../../../../store/actions/debug";
import { navigateToSsiBackupScreen } from "../../../../store/actions/navigation";
import { clearCache } from "../../../../store/actions/profile";
import { preferencesExperimentalFeaturesSetEnabled } from "../../../../store/actions/persistedPreferences";
import { bpdDeleteUserFromProgram } from "../../../../features/bonus/bpd/store/actions/onboarding";
import { Dispatch } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";

import { bpdEnabled } from "../../../../config";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isDevEnv } from "../../../../utils/environment";
import { DidSingleton } from "../../../../types/DID";
import I18n from "../../../../i18n";

import {
  configureGoogleSignIn,
  importBackupData,
  setApiToken
} from "../../googleDriveApi";
import {
  decodeBase64,
  exportVCsIos,
  pickSingleFileAndReadItsContent
} from "../../SsiUtils";
import {
  createVCWithChallengeMessage,
  saveVCFromSignChallenge
} from "../../services/verifiableCredentialService";
import NetCode from "../../NetCode";
import VCstore from "../../VCstore";

import DebugListItem from "./DebugListItem";

interface ComponentProps {
  isActive: boolean;
}

type ReduxProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type Props = ComponentProps & ReduxProps & NavigationContainerProps;

const DebugList: React.FC<Props> = ({ isActive, ...props }) => {
  if (!isActive || !isDevEnv) {
    return null;
  }

  const {
    backendInfo,
    sessionToken,
    walletToken,
    notificationToken,
    notificationId,
    dispatchLeaveBpd,
    dispatchSessionExpired,
    clearCache
  } = props;

  const handleClearCachePress = () => {
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
            clearCache();
            Toast.show({ text: I18n.t("profile.main.cache.cleared") });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const debugList = [
    {
      title: `${I18n.t("profile.main.backendVersion")} ${backendInfo?.version}`,
      onPress: () =>
        clipboardSetStringWithFeedback(backendInfo ? backendInfo?.version : ""),
      isDanger: false,
      hide: !backendInfo
    },
    {
      title: `Session Token ${sessionToken}`,
      onPress: () => clipboardSetStringWithFeedback(sessionToken as string),
      isDanger: false,
      hide: !sessionToken
    },
    {
      title: `Push token ${notificationToken}`,
      onPress: () =>
        clipboardSetStringWithFeedback(notificationToken as string),
      isDanger: false,
      hide: !notificationToken
    },
    {
      title: `Wallet token ${walletToken}`,
      onPress: () => clipboardSetStringWithFeedback(walletToken as string),
      isDanger: false,
      hide: !walletToken
    },
    {
      title: `Document picker`,
      isDanger: false,
      onPress: async () => {
        const rawFileContent = await pickSingleFileAndReadItsContent();

        if (rawFileContent != null) {
          const AsyncStorageBackupString = decodeBase64(rawFileContent);
          const JWTs: JWT[] = JSON.parse(AsyncStorageBackupString);
          console.log(`rawFileContent: ${rawFileContent}`);
          console.log(`AsyncStorageBackupString: ${AsyncStorageBackupString}`);
          console.log(`JWTs: ${JWTs}`);
        } else {
          console.log("errore nel picking del file");
        }
      }
    },
    {
      title: `Importa da Google Drive`,
      onPress: async () => {
        const tokens = await GoogleSignin.getTokens();
        console.log("TOKENS HERE", tokens);
        setApiToken(tokens.accessToken);
        await importBackupData();
        Toast.show({
          text: "Verified Credentials importate da Google Drive",
          duration: 4000
        });
      },
      isDanger: false
    },
    {
      title: `Google Signout`,
      onPress: async () => {
        try {
          await configureGoogleSignIn();
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
          Toast.show({ text: "Disconnesso da Google", duration: 4000 });
        } catch (error) {
          console.error(error);
        }
      },
      isDanger: true
    },
    {
      title: `Share masterkey`,
      onPress: async () => {
        await exportVCsIos();
        Toast.show({
          text: "Verified Credentials esportate",
          duration: 4000
        });
      },
      isDanger: false
    },
    {
      title: `DID Recovery KEY ${DidSingleton.getMnemonicToBeExported().slice(
        0,
        6
      )}***`,
      onPress: () => {
        clipboardSetStringWithFeedback(DidSingleton.getMnemonicToBeExported());
        console.log(DidSingleton.getMnemonicToBeExported());
      },
      isDanger: false
    },
    {
      title: `Notification ID ${notificationId.slice(0, 6)}`,
      onPress: () => clipboardSetStringWithFeedback(notificationId),
      isDanger: false,
      hide: !notificationId
    },
    {
      title: `Notification token ${notificationToken?.slice(0, 6)}`,
      onPress: () =>
        clipboardSetStringWithFeedback(notificationToken as string),
      isDanger: false,
      hide: !notificationToken
    },
    {
      title: "Debug SignUp Credential flow",
      onPress: async () => {
        try {
          const didAddress = DidSingleton.getDidAddress();

          const signUpResponse = await NetCode.signUpDid(didAddress);

          const signedJWT = await createVCWithChallengeMessage(signUpResponse);

          const response = await NetCode.signChallengeForVID(signedJWT);

          await saveVCFromSignChallenge(response);

          Toast.show({
            text: "Saved Successfully Credential on the Device",
            position: "bottom",
            type: "success"
          });

          console.log("response [Debug Signup Credential]:", response);
        } catch (e) {
          console.log("[Error Debug SignUp Credential]", e);
        }
      }
    },
    {
      title: "Pulisci VCStore",
      onPress: () => VCstore.clearStore(),
      isDanger: true
    },
    {
      title: "Private Key",
      onPress: () => {
        const privateKey = DidSingleton.getPrivateKey();
        console.log("privateKey =", privateKey);
        clipboardSetStringWithFeedback(privateKey);
      }
    },
    {
      title: I18n.t("profile.main.cache.clear"),
      onPress: handleClearCachePress,
      isDanger: true
    },
    {
      title: I18n.t("profile.main.forgetCurrentSession"),
      onPress: dispatchSessionExpired,
      isDanger: true
    },
    {
      title: "Cancella push token dell'utente dal DB",
      onPress: async () => {
        await NetCode.deleteUser(DidSingleton.getDidAddress());
      },
      isDanger: true
    },
    {
      title: "Leave BPD",
      onPress: dispatchLeaveBpd,
      isDanger: true,
      hide: !bpdEnabled
    }
  ];

  return (
    <React.Fragment>
      {debugList.map((item, index) => (
        <DebugListItem key={index} {...item} />
      ))}
    </React.Fragment>
  );
};

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
  clearCache: () => dispatch(clearCache()),
  setDebugModeEnabled: (enabled: boolean) =>
    dispatch(setDebugModeEnabled(enabled)),
  dispatchSessionExpired: () => dispatch(sessionExpired()),
  dispatchLeaveBpd: () => dispatch(bpdDeleteUserFromProgram.request()),
  dispatchPreferencesExperimentalFeaturesSetEnabled: (enabled: boolean) =>
    dispatch(preferencesExperimentalFeaturesSetEnabled(enabled)),
  navigateToSsiBackupScreen: () => dispatch(navigateToSsiBackupScreen())
});

export default connect(mapStateToProps, mapDispatchToProps)(DebugList);
