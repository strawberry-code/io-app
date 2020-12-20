import {
  JWT,
  VerifiedCredential,
  VerifiablePresentation
} from "did-jwt-vc/lib/types";
import AsyncStorage from "@react-native-community/async-storage";

const AS_NOTIFICATION = "AS_NOTIFICATION";

// Typeguard helper function for checking for a string
const isString = (text: any): text is string =>
  typeof text === "string" || text instanceof String;

const saveNotification = async (VPJwt: string) => {
  const verifiablePresentation: VerifiablePresentation = decodeJwt(VPJwt);
  console.log("verifiablePresentation", verifiablePresentation);

  const VC = verifiablePresentation.vp.verifiableCredential[0];
  try {
    const notificationsInStore = await AsyncStorage.getItem(AS_NOTIFICATION);

    if (!notificationsInStore || !isString(notificationsInStore)) {
      const notificationEntry = {
        id: 1,
        jwt: VC,
        date: new Date(),
        isRead: false
      };
      console.log("notification Store Empty");
      await AsyncStorage.setItem(
        AS_NOTIFICATION,
        JSON.stringify([notificationEntry])
      );
    } else {
      console.log("Data found", notificationsInStore);

      const notificationsParsed = JSON.parse(notificationsInStore);
      const alreadyInTheStore = notificationsParsed.find(n => n.jwt === VC);

      if (alreadyInTheStore) {
        throw new Error("This Credentials was already sent");
      }

      const notificationEntry = {
        id: notificationsParsed.length + 1,
        jwt: VC,
        date: new Date(),
        isRead: false
      };

      const updatedNotifications = notificationsParsed.concat(
        notificationEntry
      );

      await AsyncStorage.setItem(
        AS_NOTIFICATION,
        JSON.stringify(updatedNotifications)
      );
    }
  } catch (e) {
    console.error("COULDN'T SAVE NOTIFICATION: " + (e as string));
  }
};

const getNotifications = async (): Promise<Array<JWT>> => {
  return JSON.parse((await AsyncStorage.getItem(AS_NOTIFICATION)) as string);
};

const getNotificationJSON = async (): Promise<string> => {
  return (await AsyncStorage.getItem(AS_NOTIFICATION)) as string;
};

const getVCs = async (): Promise<Array<VerifiedCredential> | undefined> => {
  const Jwts: Array<JWT> = await getJwts();
  if (!Jwts) {
    return;
  }
  // eslint-disable-next-line functional/no-let
  let VCs: Array<VerifiedCredential> = [];
  Jwts.forEach(jwt => {
    console.log("jwt: " + jwt);
    let item = decodeJwt(jwt);
    item.jwt = jwt;
    VCs = VCs.concat(item);
  });
  console.log(VCs);
  return VCs;
};

const decodeJwt = (jwt: string) => {
  // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw'
  const parts = jwt
    .split(".")
    .map(part =>
      Buffer.from(
        part.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString()
    );
  const decodedJwt = JSON.parse(parts[1]);
  // console.log('decoded JWT', decodedJwt);
  return decodedJwt;
};

const clearStore = async () => {
  await AsyncStorage.removeItem(AS_NOTIFICATION);
};

export default {
  saveNotification,
  getNotificationJSON,
  clearStore,
  getNotifications,
  decodeJwt
};
