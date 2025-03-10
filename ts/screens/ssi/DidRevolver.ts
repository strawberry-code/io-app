import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";

// see also https://github.com/decentralized-identity/ethr-did-resolver#multi-network-configuration
const providerConfig = {
  rpcUrl: "https://goerli.infura.io/v3/b94e9aa764d1469496c580212cd9d6d4",
  registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b"
};
const resolver = new Resolver(getResolver(providerConfig));

// eslint-disable-next-line arrow-body-style
const getDidResolver = (): Resolver => {
  return resolver;
};

export { getDidResolver };
