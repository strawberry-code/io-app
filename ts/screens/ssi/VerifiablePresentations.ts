import { JwtPresentationPayload, createVerifiablePresentationJwt } from 'did-jwt-vc'
import {DidSingleton} from "../../types/DID";
import {JWT} from "did-jwt-vc/lib/types";
import VCstore from "./VCstore";

async function encodeVerifiablePresentation(jwts: JWT[]): Promise<string> {

  let issuer = DidSingleton.getIssuer()

  const vpPayload: JwtPresentationPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: jwts
    }
  }

  const vpJwt: string = await createVerifiablePresentationJwt(vpPayload, issuer)
  console.log(`la Verifiable Presentation è stata costruita: ${JSON.stringify(vpJwt)}`)
  return vpJwt
}

function decodeVerifiablePresentation(jwt: JwtPresentationPayload): Promise<string> {

  //let issuer = DidSingleton.getIssuer()

  let verifiablePresentation = VCstore.decodeJwt(jwt)

  console.log(`la Verifiable Presentation è stata decodificata: ${JSON.stringify(verifiablePresentation)}`)
  return verifiablePresentation
}



export {encodeVerifiablePresentation, decodeVerifiablePresentation}
