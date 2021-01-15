/* eslint-disable functional/no-let */
/* eslint-disable sonarjs/prefer-immediate-return */
import { GoogleSignin } from "@react-native-community/google-signin";
import GDrive from "react-native-google-drive-api-wrapper";
import VCstore from "./VCstore";

const BACKUP_FILE_NAME = "ssi-backup.json";
const BACKUP_MIMETYPE = "application/json";

const uploadUrl = "https://www.googleapis.com/upload/drive/v3";

const boundaryString = "foo_bar_baz"; // can be anything unique, needed for multipart upload https://developers.google.com/drive/v3/web/multipart-upload

export const configureGoogleSignIn = async () =>
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.appdata"], // what API you want to access on behalf of the user, default is email and profile
    webClientId:
      "471528807854-ra1nquarosn6n5uso6ih7nc17sk2jrtn.apps.googleusercontent.com", // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true
  });

// eslint-disable-next-line functional/no-let
let googleAccessToken: string;

export function setApiToken(apiToken: string) {
  GDrive.setAccessToken(apiToken);
  GDrive.init();
  googleAccessToken = apiToken;
}

function parseAndHandleErrors(response) {
  if (response.ok) {
    return response.json();
  }
  return response.json().then(error => {
    throw new Error(JSON.stringify(error));
  });
}

function configureUpdateBackup(bodyLength: string) {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${googleAccessToken}`);
  headers.append(
    "Content-Type",
    `multipart/related; boundary=${boundaryString}`
  );
  headers.append("Content-Length", bodyLength);
  return {
    method: "PATCH",
    headers
  };
}

async function createBackupContent() {
  const data = await VCstore.getJwts();

  if (!data || data.length === 0) {
    throw new Error("Don't have VCs saved in your Devices");
  }

  return JSON.stringify({
    data,
    date: new Date()
  });
}

function createMultipartBody(body: string): string {
  const metaData = {
    name: BACKUP_FILE_NAME,
    mimeType: BACKUP_MIMETYPE
  };

  // request body
  const ddb = `--${boundaryString}`;
  const ending = `\n${ddb}--`;

  let multipartBody =
    `\n${ddb}\n` +
    `Content-Type: ${BACKUP_MIMETYPE}\n\n` +
    `${JSON.stringify(metaData)}\n\n${ddb}\n` +
    `Content-Type: ${BACKUP_MIMETYPE}\n\n`;

  multipartBody += `${body}${ending}`;

  return multipartBody;
}

// uploads a file with its contents and its meta data
async function updateBackup(fileId: string) {
  try {
    const body = createMultipartBody(await createBackupContent());
    const options = configureUpdateBackup(body.length.toString());
    return fetch(`${uploadUrl}/files/${fileId}?uploadType=multipart`, {
      ...options,
      body
    })
      .then(parseAndHandleErrors)
      .then(data => console.log("response data from update Backup", data));
  } catch (error) {
    console.log("something went wrong while updating Backup:", error);
    throw new Error("Coudln't doing Backup on Drive");
  }
}

// uploads a file with its contents and its meta data
async function uploadNewBackup() {
  const body = await createBackupContent();
  try {
    const response = await GDrive.files.createFileMultipart(
      body,
      "application/json",
      {
        parents: ["appDataFolder"],
        name: "ssi-backup.json"
      }
    );

    if (!response.ok) {
      throw new Error();
    }
    console.log("response is", response);
    const responseData = await response.json();
    console.log("UPLOADED SUCCESSFULLY Backup on Google Drive", responseData);
  } catch (error) {
    console.log(
      "Error occurred while doing Backup on Google Drive",
      JSON.stringify(error)
    );
  }
}

// returns the file backup data if exists, else return false and an undefined parameter
export async function existBackup() {
  try {
    const response = await GDrive.files.list({
      q: `name='${BACKUP_FILE_NAME}'`,
      spaces: "appDataFolder",
      fields: "files(id,name,size,modifiedTime)"
    });
    const responseData = await response.json();
    console.log("BACKUP FILE ALREADY EXISTS:", responseData);

    return { exist: true, data: responseData.files[0] };
  } catch (error) {
    console.log(
      "Error occured when getting backup file from Google Drive",
      error
    );
    return { exist: false, data: undefined };
  }
}

export async function exportBackup() {
  try {
    const backupFile = await existBackup();

    if (backupFile.exist) {
      console.log("updateBackup triggered");
      await updateBackup(backupFile.data.id);
    } else {
      console.log("uploadNewBack triggered");
      await uploadNewBackup();
    }
  } catch (e) {
    throw new Error("Coudln't doing Backup on Drive");
  }
}

export async function importBackupData() {
  const backupFile = await existBackup();

  if (!backupFile.exist) {
    return false;
  }

  try {
    const response = await GDrive.files.get(backupFile.data.id, {
      alt: "media"
    });
    const responseData = await response.json();
    for (const VC of responseData.data) {
      await VCstore.storeVC(VC);
    }
    console.log("Imported VCs from Google Drive");

    return true;
  } catch (error) {
    console.log(
      "Error occured while importing backup Data from Google Drive:",
      error
    );
    return false;
  }
}
