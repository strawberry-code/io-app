/* eslint-disable no-console */
import { GoogleSignin } from "@react-native-community/google-signin";
import { useState } from "react";
import { exportBackup, setApiToken, importBackupData } from "../googleDriveApi";
import I18n from "../../../i18n";

interface LoadingModalState {
  modalVisible: boolean;
  modalStates: {
    showPrompt: boolean;
    sharing: boolean;
    sharedSuccess: boolean;
    sharedFail: boolean;
  };
}

type ExportBackupModalHook = [
  LoadingModalState,
  string,
  {
    exportBackupOnDrive: () => Promise<void>;
    importBackupFromDrive: () => Promise<void>;
  },
  (value: boolean) => void
];

const useBackupModal = (): ExportBackupModalHook => {
  const [modal, setModal] = useState<LoadingModalState>({
    modalVisible: false,
    modalStates: {
      showPrompt: false,
      sharing: false,
      sharedSuccess: false,
      sharedFail: false
    }
  });
  const [message, setMessage] = useState<string>("");

  const exportBackupOnDrive = async () => {
    setModal({
      modalVisible: true,
      modalStates: {
        showPrompt: true,
        sharing: true,
        sharedSuccess: false,
        sharedFail: false
      }
    });
    setMessage(I18n.t("ssi.recoverVCs.google.backupLoading"));
    try {
      const tokens = await GoogleSignin.getTokens();
      setApiToken(tokens.accessToken);
      await exportBackup();
      setTimeout(() => {
        setModal({
          modalVisible: true,
          modalStates: {
            showPrompt: true,
            sharing: false,
            sharedSuccess: true,
            sharedFail: false
          }
        });
        setMessage(I18n.t("ssi.recoverVCs.google.backupSuccess"));
      }, 2000);
    } catch (e) {
      console.log("Couldn't export your Backup on Google Drive:", e);
      setModal({
        modalVisible: true,
        modalStates: {
          showPrompt: true,
          sharing: false,
          sharedSuccess: false,
          sharedFail: true
        }
      });
      setMessage(I18n.t("ssi.recoverVCs.google.backupError"));
    }
  };

  const importBackupFromDrive = async () => {
    setModal({
      modalVisible: true,
      modalStates: {
        showPrompt: true,
        sharing: true,
        sharedSuccess: false,
        sharedFail: false
      }
    });
    setMessage(I18n.t("ssi.recoverVCs.google.importLoading"));
    try {
      const tokens = await GoogleSignin.getTokens();
      setApiToken(tokens.accessToken);
      await importBackupData();
      setTimeout(() => {
        setModal({
          modalVisible: true,
          modalStates: {
            showPrompt: true,
            sharing: false,
            sharedSuccess: true,
            sharedFail: false
          }
        });
        setMessage(I18n.t("ssi.recoverVCs.google.importSuccess"));
      }, 2000);
    } catch (e) {
      console.log("Couldn't export your Backup on Google Drive:", e);
      setModal({
        modalVisible: true,
        modalStates: {
          showPrompt: true,
          sharing: false,
          sharedSuccess: false,
          sharedFail: true
        }
      });
      setMessage(I18n.t("ssi.recoverVCs.google.importError"));
    }
  };

  const changeModalVisibility = (value: boolean) =>
    setModal({ ...modal, modalVisible: value });

  return [
    modal,
    message,
    { exportBackupOnDrive, importBackupFromDrive },
    changeModalVisibility
  ];
};

export default useBackupModal;
