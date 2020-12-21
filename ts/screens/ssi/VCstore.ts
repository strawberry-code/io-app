/* eslint-disable sonarjs/prefer-immediate-return */
import {
  JWT,
  VerifiedCredential,
} from "did-jwt-vc/lib/types";
import AsyncStorage from "@react-native-community/async-storage";

const AS_SSI_KEY = "AS_SSI_KEY";

// Typeguard helper function for checking for a string
const isString = (text: any): text is string =>
  typeof text === "string" || text instanceof String;

const storeVC = async (JWT: string) => {

  console.log(`storeVC`)
  console.log(`[storeVC] ho ricevuto un JWT da salvare nello store: ${JWT}`)
  console.log(`[storeVC] decodifico il JWT...`)
  const decodedJwt = decodeJwt(JWT);
  console.log(`[storeVC] JWT decodificato: ${JSON.stringify(decodedJwt)}`)

  let verifiableCredentials = []
  console.log(`[storeVC] analizzo il JWT...`)
  if(decodedJwt.vp) {
    console.log(`[storeVC] JWT è una VP`)
    console.log(`[storeVC] siccome una VP può contenere più VC, itero:`)
    let i = 0
    let potVCs = decodedJwt.vp.verifiableCredential
    potVCs.forEach((potVC: any) => {
      console.log(`[storeVC] iterazione dentro VP [${i}], aggiungo: ${potVC}`)
      verifiableCredentials.push(potVC)
    })
  } else if(decodedJwt.vc) {
    console.log(`[storeVC] JWT è una VC`)
    verifiableCredentials.push(JWT)
  } else {
    console.log(`[storeVC] JWT è un tipo di token non riconosciuto da SSI App`)
    throw new Error('token jwt non riconosciuto: non è nè una VP nè una VC')
  }

  console.log(`[storeVC] ho tutti i JWT di tipo VC che mi servono per salvarli nello store del device: ${JSON.stringify(verifiableCredentials)}`)

  for(let i = 0; i < verifiableCredentials.length; i++) {
    console.log(`[storeVC] iterazione di store [${i}]`)
    console.log(`[storeVC] picko la ${i}-esima VC: ${verifiableCredentials[i]}`)
    let verifiableCredential = verifiableCredentials[i]
    console.log(`[storeVC] JWT VC: ${JSON.stringify(verifiableCredential)}`)
    try {
      const newVC: string = verifiableCredential;

      console.log(`[storeVC] ottengo lo storage attuale delle VCs`)
      const VCFound = await AsyncStorage.getItem(AS_SSI_KEY);
      console.log(`[storeVC] lo storage attuale delle VCs adesso è : ${VCFound}`)

      if (!VCFound || !isString(VCFound)) {
        console.log(`[storeVC] siccome è vuoto, aggiungo direttamente la nuova VC`)
        await AsyncStorage.setItem(AS_SSI_KEY, JSON.stringify([newVC]));
        console.log(`[storeVC] ho salvato la VC dell'iterazione [${i}]`)
      } else {
        console.log(`[storeVC] siccome non è vuoto, devo capire se non sto aggiungedo duplicati, quindi aggiungo tutto e riduco lo store in un Set`)
        let newVCs: Array<string> = JSON.parse(VCFound).concat(newVC);
        console.log(`[storeVC] l'Array di JWT VC adesso è ${newVCs}`)
        let newVC2withoutDuplicates = [...new Set([...newVCs])];
        console.log(`[storeVC] il Set di JWT VC adesso è ${newVC2withoutDuplicates}`)
        await AsyncStorage.setItem(
          AS_SSI_KEY,
          JSON.stringify(newVC2withoutDuplicates)
        );
        console.log(`[storeVC] ho salvato la VC dell'iterazione [${i}]`)
      }
    } catch (e) {
      console.error("could not save VC on AsyncStorage: " + (e as string));
    }
  }

  console.log(`[storeVC] ho finito di salvare tutto, lo store adesso è: ` + await AsyncStorage.getItem(AS_SSI_KEY))

};

const getJwts = async (): Promise<Array<JWT>> => {
  return JSON.parse((await AsyncStorage.getItem(AS_SSI_KEY)) as string);
};

const getRawJwts = async (): Promise<string> => {
  return await AsyncStorage.getItem(AS_SSI_KEY) as string;
};

const getVCs = async (): Promise<Array<VerifiedCredential> | undefined> => {
  console.log('[getVCs] ottengo le VCs dallo store...')
  const Jwts: Array<JWT> = await getJwts();
  if (!Jwts) {
    console.log('[getVCs] lo store è vuoto, esco')
    return;
  }
  console.log('[getVCs] lo store contiene le seguenti VCs encodate in JWT: ' + Jwts)
  // eslint-disable-next-line functional/no-let
  let VCs: Array<VerifiedCredential> = [];
  Jwts.forEach(jwt => {
    console.log('jwt: ' + jwt)
    let item = decodeJwt(jwt)
    item.jwt = jwt
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
  await AsyncStorage.removeItem(AS_SSI_KEY);
};

export default { storeVC, getVCs, clearStore, getJwts, decodeJwt, getRawJwts };
