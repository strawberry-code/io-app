import {ethers, Wallet} from "ethers";
import {generateSecureRandom} from "react-native-securerandom";
import {getDidFromKeychain, setDidOnKeychain} from "../utils/keychain";
import {Issuer} from "did-jwt-vc";
import EthrDID from 'ethr-did'

/**
 * DID manager, built following singleton pattern
 */


export class DID {
  private didAddress: string | undefined
  private didRegex = new RegExp(`^did:ethr:0x[0-z]{40}$`)

  private ethAddress: string | undefined
  private publicKey: string | undefined
  private privateKey: string | undefined
  private recoverKey: string | undefined

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
    this.recoverKey = ''
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

  public setRecoverKey(recoverKey: string): void {
    // extendedKey dal HD Wallet per il recupero del Wallet
    this.recoverKey = recoverKey;
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

  public async getMnemonics() {
    let secureRandomSeed: Uint8Array = await generateSecureRandom(64) // FIXME: adesso stiamo usando un seed generato a random, ma per il recupero poi come si fa?
    console.log("secure random seed: " + secureRandomSeed)
    //let hardCodedSecureRandomSeedForDemoPurposes = [125,1,252,123,145,224,108,133,154,148,213,119,167,68,122,39,45,91,251,239,101,175,60,237,71,220,200,245,131,143,89,169,67,156,209,210,196,195,205,152,113,226,21,30,199,176,43,123,213,232,235,38,133,129,195,158,7,130,183,37,12,55,185,212]
    //console.log("hardcoded random seed: " + hardCodedSecureRandomSeedForDemoPurposes)
    console.log('generating...')
    let mnemo = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(32));
    console.log('generated mnemo: ')
    let hdnode = ethers.utils.HDNode.fromMnemonic(mnemo)
    console.log('_MENMONICS: ' + hdnode.mnemonic)
    return 'ciao'
  }

  public getPrivateKey(): string {
    // FIXME: attenzione, implementare qui la verifica biometrica oppure quella del PIN
    return <string>this.privateKey
  }

  public getRecoverKey(): string {
    // FIXME: attenzione, implementare qui la verifica biometrica oppure quella del PIN
    return <string>this.recoverKey
  }

  public async generateEthWallet(): Promise<void> {
    let secureRandomSeed: Uint8Array = await generateSecureRandom(64) // FIXME: adesso stiamo usando un seed generato a random, ma per il recupero poi come si fa?
    console.log("secure random seed: " + secureRandomSeed)
    let hardCodedSecureRandomSeedForDemoPurposes = [125,1,252,123,145,224,108,133,154,148,213,119,167,68,122,39,45,91,251,239,101,175,60,237,71,220,200,245,131,143,89,169,67,156,209,210,196,195,205,152,113,226,21,30,199,176,43,123,213,232,235,38,133,129,195,158,7,130,183,37,12,55,185,212]
    //console.log("hardcoded random seed: " + hardCodedSecureRandomSeedForDemoPurposes)
    let hdnode = ethers.utils.HDNode.fromSeed(hardCodedSecureRandomSeedForDemoPurposes)
    this.setDidAddress(`did:ethr:${hdnode.address}`)
    this.setEthAddress(hdnode.address)
    this.setPublicKey(hdnode.publicKey)
    this.setRecoverKey(hdnode.extendedKey);

    let potPrivateKey = hdnode.privateKey
    if(potPrivateKey.startsWith('0x')) {
      potPrivateKey = potPrivateKey.replace('0x', '')
    }
    this.setPrivateKey(potPrivateKey)
  }


  public async recoverEthWallet(recoverKey: string): Promise<boolean> {

    try {
      const hdnode = ethers.utils.HDNode.fromExtendedKey(recoverKey);
      if (!hdnode) {
        throw new Error(`Recupero Wallet non riuscito ${hdnode}`);
      }

      this.setDidAddress(`did:ethr:${hdnode.address}`);
      this.setEthAddress(hdnode.address);
      this.setPublicKey(hdnode.publicKey);
      this.setRecoverKey(hdnode.extendedKey);

      // eslint-disable-next-line functional/no-let
      let potPrivateKey = hdnode.privateKey
      if(potPrivateKey.startsWith('0x')) {
        potPrivateKey = potPrivateKey.replace('0x', '')
      }
      this.setPrivateKey(potPrivateKey);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }


  public marshal(): string {
    const DidData = {
      didAddress: this.getDidAddress(),
      ethAddress: this.getEthAddress(),
      publicKey: this.getPublicKey(),
      privateKey: this.getPrivateKey(),
      recoverKey: this.getRecoverKey()
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
    if(!unmarshalled.recoverKey) throw new Error('could not unmarshal recoverKey')

    this.setDidAddress(unmarshalled.didAddress)
    this.setEthAddress(unmarshalled.ethAddress)
    this.setPublicKey(unmarshalled.publicKey)
    this.setPrivateKey(unmarshalled.privateKey)
    this.setRecoverKey(unmarshalled.recoverKey)
  }

  public async loadDidFromKeychain(): Promise<boolean> {
    return await getDidFromKeychain();
  }

  public async saveDidOnKeychain(): Promise<boolean> {
    return await setDidOnKeychain();
  }

  public getIssuer(): Issuer {
    let address = DidSingleton.getEthAddress()
    let potPrivateKey = DidSingleton.getPrivateKey()
    if(potPrivateKey.startsWith('0x')) {
      potPrivateKey = potPrivateKey.replace('0x', '')
    }

    return new EthrDID({
      address: address,
      privateKey: potPrivateKey
    })
  }
}

let DidSingleton = new DID()

export {DidSingleton};

