import {createVerifiableCredentialJwt, Issuer, JwtCredentialPayload} from "did-jwt-vc";
import {DidSingleton} from "../../types/DID";

class SsiSignReqOld {

  private readonly _data: string;

  constructor(data: string) {
    if(data === undefined) {
      throw new Error('I dati del QR non possono essere undefined!')
    }
    this._data = data;
  }

  public async handleRequest() {

    let qrData = JSON.parse(this._data)
    console.log('[SsiSignReq]: eseguendo logica per signReq')

    let {type, callback, callbackMethod, payload} = qrData

    console.log('[SsiSignReq]: analizzo dati nel QR:')
    console.log(`type: ${type}\ncallbackMethod: ${callbackMethod}\ncallback: ${callback}\npayload: ${payload}\n`)

    console.log('[SsiSignReq]: ottengo issuer...')
    const issuer: Issuer = DidSingleton.getIssuer()
    console.log('[SsiSignReq]: issuer.did: ' + issuer.did)

    let vcJwt
    try {
      console.log('payload: ' + JSON.stringify(payload))
      console.log('issuer: ' + JSON.stringify(issuer))
      console.log('address: ' + JSON.stringify(DidSingleton.getEthAddress()))
      console.log('private key: ' + JSON.stringify(DidSingleton.getPrivateKey()))
      console.log('public key: ' + JSON.stringify(DidSingleton.getPublicKey()))
      vcJwt = await createVerifiableCredentialJwt(payload, issuer)
      console.log('signed token: ' + vcJwt)
    } catch (e) {
      console.log(e)
      alert('codice type QR è sbagliato')
    }

    let body = JSON.stringify({"verifiableCredential": vcJwt})
    console.log(`making fetch:\nqr type: ${type}\nmethod: ${callbackMethod}\ncallback: ${callback}\nbody: ${body}`)


    fetch(callback, {
      method: callbackMethod.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });



    this.props.navigateToScannedSsiQrCode();

  }

}

export {SsiSignReqOld}
