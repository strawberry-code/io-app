import {ethers, Wallet} from "ethers";
import {generateSecureRandom} from "react-native-securerandom";
import {getDidFromKeychain, setDidOnKeychain} from "../utils/keychain";
import {Issuer} from "did-jwt-vc";
import EthrDID from 'ethr-did'
import I18n from "../i18n";

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

  public getMnemonic() {
    return <string>this.mnemonic.phrase
  }

  public setMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic
  }

  public getPrivateKey(): string {
    // FIXME: attenzione, implementare qui la verifica biometrica oppure quella del PIN
    return <string>this.privateKey
  }

  public getMnemonicToBeExported(): string {
    // FIXME: attenzione, implementare qui la verifica biometrica oppure quella del PIN
    return <string>this.getMnemonic()
  }

  public async generateEthWallet(): Promise<void> {

    /*
    let secureRandomSeed: Uint8Array = await generateSecureRandom(64) // FIXME: adesso stiamo usando un seed generato a random, ma per il recupero poi come si fa?
    console.log("secure random seed: " + secureRandomSeed)
    let hardCodedSecureRandomSeedForDemoPurposes = [125,1,252,123,145,224,108,133,154,148,213,119,167,68,122,39,45,91,251,239,101,175,60,237,71,220,200,245,131,143,89,169,67,156,209,210,196,195,205,152,113,226,21,30,199,176,43,123,213,232,235,38,133,129,195,158,7,130,183,37,12,55,185,212]
    //console.log("hardcoded random seed: " + hardCodedSecureRandomSeedForDemoPurposes)
    let hdnode = ethers.utils.HDNode.fromSeed(hardCodedSecureRandomSeedForDemoPurposes)
    */

    let hdnode
    try {
      const seed = await generateSecureRandom(SeedLength.l32);
      const language = ethers.wordlists[I18n.locale];
      const randomMnemonic = ethers.utils.entropyToMnemonic(seed, language);
      console.log('[random mnemonic generato]: ' + randomMnemonic)
      hdnode = ethers.utils.HDNode.fromMnemonic(
        randomMnemonic,
        undefined,
        language
      );
      console.log("[getMnemonics]: wallet adddress", hdnode.address);
      console.log("[getMnemonics]: wallet mnemonic", hdnode.mnemonic);
    } catch(e) {
      console.log("[getMnemonics]: impossibile generare il wallet con ethers: ", e);
    }

    this.setDidAddress(`did:ethr:${hdnode.address}`)
    this.setEthAddress(hdnode.address)
    this.setPublicKey(hdnode.publicKey)
    this.setRecoverKey(hdnode.extendedKey);
    this.setMnemonic(hdnode.mnemonic);

    let potPrivateKey = hdnode.privateKey
    if(potPrivateKey.startsWith('0x')) {
      potPrivateKey = potPrivateKey.replace('0x', '')
    }
    this.setPrivateKey(potPrivateKey)
  }


  public async recoverEthWallet(mnemonic: string): Promise<boolean> {
    console.log(`[recoverEthWallet]: mnemonic in uso per il recupero del wallet: ${mnemonic}`)
    let hdnode
    try {
      console.log("provo recupero in italiano")
      hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic, undefined, ethers.wordlists["it"]);
      console.log("[recoverEthWallet]: wallet adddress", hdnode.address);
      console.log("[recoverEthWallet]: wallet mnemonic", hdnode.mnemonic);
    } catch(e) {
      try {
        console.log("provo recupero in inglese")
        hdnode = ethers.utils.HDNode.fromMnemonic(mnemonic, undefined, ethers.wordlists["en"]);
        console.log("[recoverEthWallet]: wallet adddress", hdnode.address);
        console.log("[recoverEthWallet]: wallet mnemonic", hdnode.mnemonic);
      } catch (e) {
        console.log("[recoverEthWallet]: impossibile generare il wallet con ethers: ", e);
        return false
      }
    }
    this.setDidAddress(`did:ethr:${hdnode.address}`)
    this.setEthAddress(hdnode.address)
    this.setPublicKey(hdnode.publicKey)
    this.setRecoverKey(hdnode.extendedKey);
    this.setMnemonic(hdnode.mnemonic);
    let potPrivateKey = hdnode.privateKey
    if(potPrivateKey.startsWith('0x')) {
      potPrivateKey = potPrivateKey.replace('0x', '')
    }
    this.setPrivateKey(potPrivateKey)
    console.log(`[recoverEthWallet]: wallet recuperato`)
    return true
  }


  public marshal(): string {
    const DidData = {
      didAddress: this.getDidAddress(),
      ethAddress: this.getEthAddress(),
      publicKey: this.getPublicKey(),
      privateKey: this.getPrivateKey(),
      recoverKey: this.getMnemonicToBeExported()
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

// Chose the length of your mnemonic:
const SeedLength = {
  l16: 16, // passphrase size: 12 words
  l20: 20, // passphrase size: 15 words
  l24: 24, // passphrase size: 18 words
  l28: 28, // passphrase size: 21 words
  l32: 32, // passphrase size: 24 words
}

export {DidSingleton};

