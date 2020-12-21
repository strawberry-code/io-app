import * as RNFS from "react-native-fs";
import {DidSingleton} from "../../types/DID";
import VCstore from "./VCstore";
import Share from "react-native-share";
// @ts-ignore
import base64 from "react-native-base64";
import DocumentPicker from "react-native-document-picker";
import {JWT} from "did-jwt-vc/lib/types";
import {Alert} from "react-native";
import {useState} from "react";

const exportVCsIos = async () => {
  let filePath = RNFS.DocumentDirectoryPath + `/${DidSingleton.getEthAddress()}-${formatDateYYYYMMDDhhmmss(new Date())}.txt`
  let payload = await VCstore.getRawJwts()
  console.log(`payload: ` + payload)

  try {
    console.log(`[exportCredentials]: scrivo le VCs in un file temporaneo...`)
    await writeFile(filePath, encodeBase64(payload))
    console.log(`[exportCredentials]: le VCs sono state scritte in: ` + filePath)
  } catch (e) {
    console.log(e)
  }

  try {
    console.log(`[exportCredentials]: condivido il file con le VCs tramite la share dell'OS...`)
    let res = await Share.open({
      title: `AAA`,
      //url: `data:text/txt;base64,${base64.encode(`pincopallo`)}`,
      url: filePath,
      filename: `${DidSingleton.getEthAddress()}-${formatDateYYYYMMDDhhmmss(new Date())}.txt`,
      type: `/` + DidSingleton.getEthAddress() + `.txt`
    })
    console.log(`[exportCredentials]: processo di condivisione terminato`)
    console.log(`[exportCredentials]: ` + JSON.stringify(res));


    return true

  } catch (e) {
    console.log(e)
    return false
  } finally {
    console.log(`[exportCredentials]: elimino ` + filePath + ` ...`)
    await RNFS.unlink(filePath)
    console.log(`[exportCredentials]: file eliminato`)
  }
}

const exportVCsAndroid = async () => {

  try {
    const payload = encodeBase64(encodeBase64(await VCstore.getRawJwts()))
    console.log(`[exportCredentials]: condivido il file con le VCs tramite la share del'OS...`);
    const res = await Share.open({
      url: `data:text/plain;base64,${payload}`,
      filename: `${DidSingleton.getEthAddress()}-${formatDateYYYYMMDDhhmmss(new Date())}`
    });
    console.log(`[exportCredentials]: processo di condivisione terminato`);
    console.log(`[exportCredentials]: ` + JSON.stringify(res));
    return true
  } catch (e) {
    console.log(e);
    return false
  }
};

const formatDateYYYYMMDDhhmmss = (date: Date) => {
  let day = ("0" + date.getDate()).slice(-2);
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return [year, month, day, hours, minutes, seconds].join('-');
}

const isJwt = (potJwt: string) => {
  const regex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/gm;
  return regex.exec(potJwt)
}

const encodeBase64 = (payload: string) => {
  return base64.encode(payload)
}

const decodeBase64 = (payload: string) => {
  return base64.decode(payload)
}

/**
 * Legge file da filePath (utf8 required)
 * @param filePath
 */
const readFile = async (filePath: string): Promise<string> => {
  try {
    return await RNFS.readFile(filePath,'utf8')
  } catch(e) {
    console.error(`impossibile leggere il file: ${e}`)
    throw new Error(`impossibile leggere il file: ${e}`)
  }
}

/**
 * Scrive payload in filePath
 * @param filePath
 * @param payload (utf8 required)
 */
const writeFile = async (filePath: string, payload: string): Promise<boolean> => {
  try {
    await RNFS.writeFile(filePath, payload, `utf8`)
    return true
  } catch(e) {
    console.error(`impossibile leggere il file: ${e}`)
    throw new Error(`impossibile leggere il file: ${e}`)
  }
}

interface DocumentPickerResponse {
  uri: string,
  type: string,
  name: string,
  size: number
}

/**
 * Ottiene un file da OS FS. Restituisce un oggetto (impossibile da tipizzare in DocumentPickerResponse a causa del plugin, per cui è object) in caso di successo. Restituisce undefined se utente cambia idea e chiude il picker. Lancia eccezione in caso di errori.
 */
const pickSingleFile = async (): Promise<DocumentPickerResponse | undefined> => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    console.log(
      res.uri,
      res.type, // mime type
      res.name,
      res.size
    );
    return res
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
      return undefined
    } else {
      throw err;
    }
  }
}

const pickSingleFileAndReadItsContent = async (): Promise<string | undefined> => {
  try {
    let file = await pickSingleFile()
    if(file && file.uri) {
      return await readFile(file.uri)
    } else {
      return undefined
    }
  } catch (err) {
    throw new Error('impossibile leggere il file preso dal picker: ' + err)
  }
}

const importVCs = async (): Promise<boolean> => {
  let rawFileContent = await pickSingleFileAndReadItsContent()

  if (rawFileContent != null) {
    let AsyncStorageBackupString = decodeBase64(rawFileContent)
    let JWTs: JWT[] = JSON.parse(AsyncStorageBackupString)
    console.log(`[restoreVcsBackup] rawFileContent: ${rawFileContent}`)
    console.log(`[restoreVcsBackup] AsyncStorageBackupString: ${AsyncStorageBackupString}`)
    console.log(`[restoreVcsBackup] JWTs: ${JWTs}`)

    let userChoice = await asyncPrompt('Importazione VCs',`Nel file che hai selezionato sono state trovate ${JWTs.length} Verifiable Credentials, vuoi procedere con l'importazione?`, undefined, undefined)

    if(userChoice) {
      for(let i = 0; i < JWTs.length; i++) {
        await VCstore.storeVC(JWTs[i])
      }
      return true
    } else {
      console.log(`[restoreVcsBackup] importazione VCs interrotta: l'utente ha deciso di non importare le VCs`)
      return false
    }

  } else {
    console.log('[restoreVcsBackup] errore nel picking del file')
    return false
  }
}

const asyncPrompt = (title, message, resolveCallback, rejectCallback) => new Promise((resolve, reject) => {
  Alert.alert(title, message, [
    {
      text: `Sì`,
      onPress: () => {
        if(resolveCallback) resolveCallback()
        resolve(true)
      }
    },
    {
      text: `No`,
      onPress: () => {
        if(rejectCallback) rejectCallback()
        reject(false)
      }
    }
  ])
})

export {
  decodeBase64,
  encodeBase64,
  exportVCsAndroid,
  exportVCsIos,
  importVCs,
  isJwt,
  pickSingleFile,
  pickSingleFileAndReadItsContent,
  readFile,
  writeFile,
};
