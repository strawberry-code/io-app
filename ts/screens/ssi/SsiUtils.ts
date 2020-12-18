import * as RNFS from "react-native-fs";
import {DidSingleton} from "../../types/DID";
import VCstore from "./VCstore";
import Share from "react-native-share";
import base64 from "react-native-base64";

const exportCredentials = async () => {
  let filePath = RNFS.DocumentDirectoryPath + `/${DidSingleton.getEthAddress()}-${formatDateYYYYMMDDhhmmss(new Date())}.txt`
  let payload = await VCstore.getRawJwts()
  console.log(`payload: ` + payload)

  try {
    console.log(`[exportCredentials]: scrivo le VCs in un file temporaneo...`)
    await RNFS.writeFile(filePath, base64.encode(payload), `utf8`)
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
    const payload = base64.encode(base64.encode(await VCstore.getRawJwts()))
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
  let date_ob = date;
  let day = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();

  return [year, month, day, hours, minutes, seconds].join('-');
}

export {exportCredentials, exportCredentialsAndroid};
