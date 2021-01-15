import { GoogleSignin } from "@react-native-community/google-signin";
import { useState } from "react";
import { exportBackup, setApiToken, importBackupData } from "../googleDriveApi";

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
    setMessage("Facendo Backup delle Credenziali");
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
        setMessage("Backup su Drive avvenuto con Successo");
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
      setMessage("Errore durante il Backup delle Credenziali");
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
    setMessage("Importando Backup delle Credenziali");
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
        setMessage("Importazione Backup avvenuta con Successo");
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
      setMessage("Errore durante l'importazione del Backup");
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
