/* eslint-disable sonarjs/prefer-immediate-return */
import { JWT, VerifiedCredential } from "did-jwt-vc/lib/types";
import AsyncStorage from "@react-native-community/async-storage";

const AS_SSI_KEY = "AS_SSI_KEY";

// Typeguard helper function for checking for a string
const isString = (text: any): text is string =>
  typeof text === "string" || text instanceof String;

const storeVC = async (VC: string) => {
  try {
    const newVC: Array<string> = [VC];
    const VCFound = await AsyncStorage.getItem(AS_SSI_KEY);

    if (!VCFound || !isString(VCFound)) {
      console.log("Data Not Found");
      await AsyncStorage.setItem(AS_SSI_KEY, JSON.stringify(newVC));
    } else {
      console.log("Data found", VCFound);
      const newVCs: Array<string> = JSON.parse(VCFound).concat(newVC);
      const newVC2withoutDuplicates = [...new Set([...newVCs])];
      await AsyncStorage.setItem(
        AS_SSI_KEY,
        JSON.stringify(newVC2withoutDuplicates)
      );
    }
  } catch (e) {
    console.error("could not save VC on AsyncStorage: " + (e as string));
  }
};

const getJwts = async (): Promise<Array<JWT>> => {
  return JSON.parse((await AsyncStorage.getItem(AS_SSI_KEY)) as string);
};

const getVCs = async (): Promise<Array<VerifiedCredential> | undefined> => {
  const Jwts: Array<JWT> = await getJwts();
  if (!Jwts) {
    return;
  }
  // eslint-disable-next-line functional/no-let
  let VCs: Array<VerifiedCredential> = [];
  Jwts.forEach(jwt => {
    VCs = VCs.concat(decodeJwt(jwt));
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
  await AsyncStorage.removeItem(AS_SSI_KEY);
};

export default { storeVC, getVCs, clearStore, getJwts };
