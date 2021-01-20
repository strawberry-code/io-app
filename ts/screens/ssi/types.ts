export interface Asset {
  address: string;
  abi: Record<string, unknown>;
  symbol: string;
  assetName: string;
  issuerAddress: string;
}

export interface Transaction {
  id: number;
  txHash: string;
  assetAddress: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  addressFrom: {
    orgId: number | null;
    userId: number | null;
    fullname: string;
  };
  addressTo: {
    orgId: number | null;
    userId: null;
    fullname: string;
  };
}

export type IssuerInfoKeys =
  | "did"
  | "name"
  | "tradeName"
  | "postalAddress"
  | "electronicAddress"
  | "informationUri";
export type IssuerInfo = {
  [index in IssuerInfoKeys]: string;
};
