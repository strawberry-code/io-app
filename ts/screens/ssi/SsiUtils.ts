import * as RNFS from "react-native-fs";
import {DidSingleton} from "../../types/DID";
import VCstore from "./VCstore";
import Share from "react-native-share";
// @ts-ignore
import base64 from "react-native-base64";

const exportCredentials = async () => {
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

    console.log(`[exportCredentials]: elimino ` + filePath + ` ...`)
    await RNFS.unlink(filePath)
    console.log(`[exportCredentials]: file eliminato`)

  } catch (e) {
    console.log(e)
  }
}

const exportCredentialsAndroid = async () => {

  try {
    const payload = encodeBase64(encodeBase64(await VCstore.getRawJwts()))
    console.log(`[exportCredentials]: condivido il file con le VCs tramite la share del'OS...`);
    const res = await Share.open({
      url: `data:text/plain;base64,${payload}`,
      filename: `${DidSingleton.getEthAddress()}-${formatDateYYYYMMDDhhmmss(new Date())}`
    });
    console.log(`[exportCredentials]: processo di condivisione terminato`);
    console.log(`[exportCredentials]: ` + JSON.stringify(res));
  } catch (e) {
    console.log(e);
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
const readFile = async (filePath: string) => {
  try {
    await RNFS.readFile(filePath,'utf8')
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
const writeFile = async (filePath: string, payload: string) => {
  try {
    await RNFS.writeFile(filePath, payload, `utf8`)
  } catch(e) {
    console.error(`impossibile leggere il file: ${e}`)
    throw new Error(`impossibile leggere il file: ${e}`)
  }
}

export {exportCredentials, exportCredentialsAndroid, isJwt, encodeBase64, decodeBase64, readFile, writeFile};
