import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";

// see also https://github.com/decentralized-identity/ethr-did-resolver#multi-network-configuration
const providerConfig = {
  rpcUrl: "https://ropsten.infura.io/v3/7f0947027dbe4c01b568cb62c00306b2",
  registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b"
};
const resolver = new Resolver(getResolver(providerConfig));

// eslint-disable-next-line arrow-body-style
const getDidResolver = (): Resolver => {
  return resolver;
};

export { getDidResolver };
