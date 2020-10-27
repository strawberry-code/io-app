// https://ropsten.infura.io/v3/9b3e31b76db04cf2a6ff7ed0f1592ab9


import { Resolver } from 'did-resolver'
import {VerifiedCredential, verifyCredential} from 'did-jwt-vc'
import {DidSingleton} from "../../types/DID";
import {HardcodedVCs} from "./VCsJson";


let getVCfromJwt = async (vcJwt: string, resolver: Resolver): Promise<VerifiedCredential[]> => {
  console.log('jwt is: ' + vcJwt)
  console.log('verifying credential')
  //return [await verifyCredential(vcJwt, resolver)] // FIXME: da sistemare, capire forse perchè jwt è sbagliato
  // Bypass della funzionalità con load da JSON
  //return HardcodedVCs
}

let customWait = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve()
  }, 4000)
})

export {getVCfromJwt}

