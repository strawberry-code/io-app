import {
  GoogleSignin,
  statusCodes,
  User
} from "@react-native-community/google-signin";
import { Toast } from "native-base";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TouchableHighlight,
  Alert
} from "react-native";
import { format } from "date-fns";

import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import StyledIconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";
import I18n from "../../i18n";
import {
  setApiToken,
  existBackup,
  configureGoogleSignIn
} from "./googleDriveApi";
import useBackupModal from "./hooks/useBackupModal";
import CustomGoogleButton from "./components/CustomGoogleButton";

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    paddingTop: 20
  },
  icon: {
    paddingHorizontal: 20,
    fontSize: 30,
    color: customVariables.brandPrimary
  },
  title: {
    textAlign: "left",
    color: customVariables.brandPrimary,
    fontSize: customVariables.fontSize2,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-SemiBold"
    }),
    fontWeight: Platform.select({
      ios: "500"
    }),
    marginBottom: 10
  },
  textContent: {
    fontSize: 15,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-Regular"
    })
  },
  content: {
    flexShrink: 1,
    paddingRight: 10
  },
  activityIndicator: { alignSelf: "flex-start", padding: 10 },
  backupInfo: {
    marginTop: 10
  },
  backupInfoText: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-SemiBold"
    }),
    fontWeight: Platform.select({
      ios: "500"
    })
  },
  googleInfo: {
    marginTop: 10
  },
  googleInfoTitle: {
    color: customVariables.brandPrimary,
    fontSize: customVariables.fontSize1,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-SemiBold"
    }),
    fontWeight: Platform.select({
      ios: "500"
    })
  },
  header: {
    fontSize: customVariables.h4FontSize,
    padding: 20,
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal"
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
    alignItems: "center"
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
    color: customVariables.colorWhite,
    fontSize: customVariables.fontSize2,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    textAlign: "center"
  },
  buttonTextBase: {
    fontSize: customVariables.fontSizeBase
  },
  openButton: {
    backgroundColor: customVariables.brandPrimary,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",
    fontSize: customVariables.fontSize3,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal"
  }
});

interface BackupFile {
  exist: boolean;
  data: {
    name: string;
    modifiedTime: string;
    size: string;
    id: string;
  };
}

const SsiBackupScreen = () => {
  const [backupInfo, setBackupInfo] = useState<BackupFile | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // siGnInStates
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isSigninInProgress, setIsSigningInProgress] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const [
    { modalVisible, modalStates },
    message,
    { exportBackupOnDrive, importBackupFromDrive },
    changeModalVisibility
  ] = useBackupModal();

  const updateBackupInfo = async () => {
    setIsLoading(true);
    try {
      setApiToken((await GoogleSignin.getTokens()).accessToken);
      const fetchedBackupInfo = await existBackup();

      if (!fetchedBackupInfo.exist) {
        throw new Error("Coudln't find Backup Data");
      }
      console.log("fetchedBackupInfo", fetchedBackupInfo);
      setBackupInfo(fetchedBackupInfo);
    } catch (e) {
      console.log("Other Error occurred:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isSignedIn) {
      void updateBackupInfo();
    }
  }, [modalStates.sharedSuccess, isSignedIn]);

  useEffect(() => {
    void GoogleSignin.isSignedIn().then(value => setIsSignedIn(value));
    void GoogleSignin.getCurrentUser().then(user => setUserInfo(user));
  }, []);

  const signIn = async () => {
    try {
      await configureGoogleSignIn();
      await GoogleSignin.hasPlayServices();

      setIsSigningInProgress(true);
      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo:\t", userInfo);
      setUserInfo(userInfo);
      setIsSignedIn(true);
      setIsSigningInProgress(false);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("[Google SignIn] User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("[Google SignIn] Login In Progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("[Google SignIn] Play Services not available or outdated");
      } else {
        console.log("[Google SignIn] other error occurred:", error);
      }
      setIsSigningInProgress(false);
    }
  };

  const logoutFromGoogle = () => {
    Alert.alert(
      "Sicuro di voler disconnersi da Google?",
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await configureGoogleSignIn();
              await GoogleSignin.revokeAccess();
              await GoogleSignin.signOut();
              setIsSignedIn(false);
              setUserInfo(null);
              Toast.show({
                text: "Disconnesso da Google",
                duration: 4000
              });
            } catch (error) {
              console.error(error);
            }
            return true;
          }
        }
      ],
      { cancelable: false }
    );
  };

  const date =
    backupInfo && backupInfo.exist
      ? format(new Date(backupInfo.data.modifiedTime), "DD/MM/YYYY HH:MM:SS")
      : "";

  const size = backupInfo
    ? (parseInt(backupInfo.data.size, 10) / 1000).toFixed(2) + "kB"
    : "";

  const canShowInfo = backupInfo && isSignedIn;

  const noneBackupString = I18n.locale === "it" ? "Nessuno" : "None";

  return (
    <TopScreenComponent
      accessibilityLabel={I18n.t("ssi.recoverVCs.google.title")}
      headerTitle="Wallet"
      goBack={true}
    >
      <View style={styles.section}>
        <StyledIconFont name="io-cloud-upload" style={styles.icon} />
        <View style={styles.content}>
          <Text style={styles.title}>
            {I18n.t("ssi.recoverVCs.google.lastBackup")}
          </Text>
          <Text style={styles.textContent}>
            {I18n.t("ssi.recoverVCs.google.description-1")}
          </Text>
          {isLoading && isSignedIn && (
            <ActivityIndicator
              size="small"
              color={customVariables.brandPrimary}
              style={styles.activityIndicator}
            />
          )}
          {!isLoading && canShowInfo && (
            <View style={styles.backupInfo}>
              <Text style={styles.backupInfoText}>
                {I18n.t("ssi.recoverVCs.google.date")}{" "}
                {!backupInfo?.exist ? noneBackupString : date}
              </Text>
              <Text style={styles.backupInfoText}>
                {I18n.t("ssi.recoverVCs.google.size")}:{" "}
                {!backupInfo?.exist ? noneBackupString : size}
              </Text>
            </View>
          )}
          {isSignedIn && (
            <>
              <ButtonDefaultOpacity
                style={{ marginTop: 20 }}
                onPress={exportBackupOnDrive}
              >
                <Text style={[styles.buttonText, styles.buttonTextBase]}>
                  {I18n.t("ssi.recoverVCs.google.backupButton")}
                </Text>
              </ButtonDefaultOpacity>
              <ButtonDefaultOpacity
                style={{ marginTop: 10 }}
                disabled={!backupInfo}
                onPress={importBackupFromDrive}
              >
                <Text style={[styles.buttonText, styles.buttonTextBase]}>
                  {I18n.t("ssi.recoverVCs.google.restoreButton")}
                </Text>
              </ButtonDefaultOpacity>
            </>
          )}
        </View>
      </View>
      <View style={styles.section}>
        <StyledIconFont name="io-google-drive" style={styles.icon} />
        <View style={styles.content}>
          <Text style={styles.title}>Google Drive</Text>
          <Text style={styles.textContent}>
            {I18n.t("ssi.recoverVCs.google.description-2")}
          </Text>
          {isSignedIn && (
            <>
              <View style={styles.googleInfo}>
                <Text style={styles.googleInfoTitle}>Account Google</Text>
                <Text>{userInfo?.user.email}</Text>
              </View>
              <ButtonDefaultOpacity
                style={{ marginTop: 20 }}
                danger
                onPress={logoutFromGoogle}
              >
                <Text style={[styles.buttonText, styles.buttonTextBase]}>
                  {I18n.t("ssi.recoverVCs.google.logout")}
                </Text>
              </ButtonDefaultOpacity>
            </>
          )}
          {!isSignedIn && (
            <CustomGoogleButton
              onPress={signIn}
              disabled={isSigninInProgress}
            />
          )}
        </View>
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          {/* BLACK OPACHE BACKGROUND */}
          <View style={styles.bgOpacity}></View>
          <View style={styles.modalView}>
            {modalStates.sharing && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <ActivityIndicator
                  size="large"
                  color={customVariables.brandPrimary}
                />
              </>
            )}

            {modalStates.sharedSuccess && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <StyledIconFont
                  size={60}
                  color={customVariables.brandPrimary}
                  name="io-complete"
                  style={{ height: 63 }}
                />

                <TouchableHighlight
                  style={styles.openButton}
                  onPress={() => changeModalVisibility(false)}
                >
                  <Text style={styles.buttonText}>
                    {I18n.t("ssi.shareReqScreen.continueButton")}
                  </Text>
                </TouchableHighlight>
              </>
            )}

            {modalStates.sharedFail && (
              <>
                <Text style={styles.modalText}>{message}</Text>
                <StyledIconFont
                  size={60}
                  color={customVariables.brandDanger}
                  name="io-notice"
                />
                <TouchableHighlight
                  style={styles.openButton}
                  onPress={() => changeModalVisibility(false)}
                >
                  <Text style={styles.buttonText}>
                    {I18n.t("ssi.shareReqScreen.tryAgainButton")}
                  </Text>
                </TouchableHighlight>
              </>
            )}
          </View>
        </View>
      </Modal>
    </TopScreenComponent>
  );
};

export default SsiBackupScreen;
