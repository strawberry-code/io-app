/**
 * A primitive (to be improved) object that defines an Ethereum wallet
 */
export interface EthereumWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic: string;
  seed: string;
}
