import {JWT, VerifiedCredential} from "did-jwt-vc/lib/types";
import AsyncStorage from "@react-native-community/async-storage";


const AS_SSI_KEY = "AS_SSI_KEY"


let storeVC = async (VC: string) => {
  try {
    await AsyncStorage.getItem(AS_SSI_KEY, (_err, result) => {
      const newVC = [VC];
      if (result !== null) {
        console.log('Data Found', result);
        let newVCs = JSON.parse(<string>result).concat(newVC);
        let newVC2withoutDuplicates = [...new Set([...newVCs])]
        AsyncStorage.setItem(AS_SSI_KEY, JSON.stringify(newVC2withoutDuplicates));
      } else {
        console.log('Data Not Found');
        AsyncStorage.setItem(AS_SSI_KEY, JSON.stringify(newVC));
      }
    });
  } catch(e) {
    console.error('could not save VC on AsyncStorage: ' + e)
  }
}

let getJwts = async (): Promise<string[]> => {
  return JSON.parse(<string>(await AsyncStorage.getItem(AS_SSI_KEY)))
}

let getVCs = async (): Promise<VerifiedCredential[]> => {
  let Jwts: string[] = await getJwts()
  if(!Jwts) return
  let VCs: VerifiedCredential[] = []
  Jwts.forEach((jwt) => {
    VCs.push(decodeJwt(jwt))
  })
  console.log(VCs)
  return VCs
}

let decodeJwt = (jwt: string) => {
  //const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkZW50aXR5Q2FyZCI6eyJmaXJzdE5hbWUiOiJBbmRyZWEiLCJsYXN0TmFtZSI6IlRhZ2xpYSIsImJpcnRoRGF0ZSI6IjExLzA5LzE5OTUiLCJjaXR5IjoiQ2F0YW5pYSJ9fX0sInN1YiI6ImRpZDpldGhyOjB4RTZDRTQ5ODk4MWI0YmE5ZTgzZTIwOWY4RTAyNjI5NDk0RkMzMWJjOSIsIm5iZiI6MTU2Mjk1MDI4MiwiaXNzIjoiZGlkOmV0aHI6MHhmMTIzMmY4NDBmM2FkN2QyM2ZjZGFhODRkNmM2NmRhYzI0ZWZiMTk4In0.bdOO9TsL3sw4xPR1nJYP_oVcgV-eu5jBf2QrN47AMe-BMZeuQG0kNMDidbgw32CJ58HCm-OyamjsU9246w8xPw'
  const parts = jwt.split('.').map(part => Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
  const decodedJwt = JSON.parse(parts[1]);
  console.log('decoded JWT', decodedJwt);
  return decodedJwt
}


let clearStore = async () => {
  let VCs: VerifiedCredential[]
  VCs = await AsyncStorage.removeItem(AS_SSI_KEY)
  console.log(VCs)
}

export default {storeVC, getVCs, clearStore, getJwts};
