import {ethers} from "ethers";
import {generateSecureRandom} from "react-native-securerandom";

/**
 * DID manager, built following singleton pattern
 */


export class DID {
  private didAddress: string | undefined
  private didRegex = new RegExp(`^did:ethr:0x[0-z]{40}$`)

  private ethAddress: string | undefined
  private publicKey: string | undefined
  private privateKey: string | undefined

  constructor() {
    if(DidSingleton) {
      return DidSingleton
    } else {
      return this
    }
  }

  public destroy() {
    this.ethAddress = ''
    this.didAddress = ''
    this.publicKey = ''
    this.privateKey = ''
  }

  private setDidAddress(potDidAddress: string): void {
    console.log('setting did address: ' + potDidAddress)
    if(this.didRegex.test(potDidAddress)) {
      console.log('address set: ' + potDidAddress)
      this.didAddress = potDidAddress
    } else {
      throw new Error('the given address does not match for did:ethr:xxx address: ')
    }
  }

  public setEthAddress(ethAddress: string): void {
    this.ethAddress = ethAddress
  }

  public setPublicKey(publicKey: string): void {
    this.publicKey = publicKey
  }

  public setPrivateKey(privateKey: string): void {
    // FIXME: attenzione, implementare qui il salvataggio su keychain
    this.privateKey = privateKey
  }

  public getDidAddress(): string {
    return <string>this.didAddress
  }

  public getEthAddress(): string {
    return <string>this.ethAddress
  }

  public getPublicKey(): string {
    return <string>this.publicKey
  }

  public getPrivateKey(): string {
    // FIXME: attenzione, implementare qui la verifica biometrica oppure quella del PIN
    return <string>this.privateKey
  }

  public async generateEthWallet(): Promise<void> {
    let secureRandomSeed: Uint8Array = await generateSecureRandom(64) // FIXME: adesso stiamo usando un seed generato a random, ma per il recupero poi come si fa?
    let hdnode = ethers.utils.HDNode.fromSeed(secureRandomSeed)
    this.setDidAddress(`did:ethr:${hdnode.address}`)
    this.setEthAddress(hdnode.address)
    this.setPublicKey(hdnode.publicKey)
    this.setPrivateKey(hdnode.privateKey)
  }

  public marshal(): string {
    let DidData = {
      didAddress: this.getDidAddress(),
      ethAddress: this.getDidAddress(),
      publicKey: this.getPublicKey(),
      privateKey: this.getPrivateKey()
    }
    return JSON.stringify(DidData)
  }

  public unmarshal(keychainData: string): void {
    console.log('unmarshalling')
    let unmarshalled
    try{
      unmarshalled = JSON.parse(keychainData)
    } catch(err) {
      throw new Error('unable to unmarshal the given string')
    }

    if(!unmarshalled.didAddress) throw new Error('could not unmarshal didAddress')
    if(!unmarshalled.ethAddress) throw new Error('could not unmarshal ethAddress')
    if(!unmarshalled.publicKey) throw new Error('could not unmarshal publicKey')
    if(!unmarshalled.privateKey) throw new Error('could not unmarshal privateKey')

    this.setDidAddress(unmarshalled.didAddress)
    this.setEthAddress(unmarshalled.ethAddress)
    this.setPublicKey(unmarshalled.publicKey)
    this.setPrivateKey(unmarshalled.privateKey)
  }
}

let DidSingleton = new DID()

export {DidSingleton};

