import { JwtPresentationPayload, createVerifiablePresentationJwt } from 'did-jwt-vc'
import {DidSingleton} from "../../types/DID";
import {JWT} from "did-jwt-vc/lib/types";

async function buildVerifiablePresentation(jwts: JWT[]): Promise<string> {

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

export {buildVerifiablePresentation}
