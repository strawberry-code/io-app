// https://ropsten.infura.io/v3/9b3e31b76db04cf2a6ff7ed0f1592ab9
import EthrDID from "ethr-did";
import { isRight } from "fp-ts/lib/Either";
import { type, literal, string, TypeOf } from "io-ts";
import { createVerifiableCredentialJwt } from "did-jwt-vc";
import { Issuer, JWT } from "did-jwt-vc/lib/types";

import { DidSingleton } from "../../../types/DID";
import VCstore from "../VCstore";

const SignUpResponse = type({
  type: literal("ssi-VIDrequest"),
  sub: string,
  challengeText: string
});

export type SignUpResponse = TypeOf<typeof SignUpResponse>;

const createVCWithChallengeMessage = async (
  signUpResponse: SignUpResponse
): Promise<JWT | undefined> => {
  const issuer: Issuer = DidSingleton.getIssuer();

  const isSignResponse = isRight(SignUpResponse.decode(signUpResponse));

  if (!isSignResponse) {
    throw new TypeError(
      `Malformatted response body from /auth/signUp/: ${JSON.stringify(
        signUpResponse
      )}`
    );
  }

  const { sub, challengeText } = signUpResponse;

  const vcPayload = {
    iat: 1541493724,
    exp: 1773029723,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      type: ["VerifiableCredential"],
      credentialSubject: {
        challengeText
      }
    },
    sub,
    jti: "http://example.edu/credentials/3732",
    iss: DidSingleton.getDidAddress(),
    nbf: 1541493724,
    nonce: "660!6345FSer"
  };
  try {
    return await createVerifiableCredentialJwt(vcPayload, issuer);
  } catch (e) {
    errorHandler(e);
    return;
  }
};

const errorHandler = (error: Error) => {
  // eslint-disable-next-line no-console
  console.log("Malformatted response", error);
};

const SignChallengeResponse = type({
  type: literal("ssi-issuedVC"),
  verifiablePresentation: string
});

export type SignChallengeResponse = TypeOf<typeof SignChallengeResponse>;

const saveVCFromSignChallenge = async (
  response: SignChallengeResponse
): Promise<void> => {
  const isSignChallengeResponse = isRight(
    SignChallengeResponse.decode(response)
  );

  if (!isSignChallengeResponse) {
    throw new TypeError(
      `Malformatted response body from /auth/signUp/: ${JSON.stringify(
        response
      )}`
    );
  }
  const verifiablePresentation = response.verifiablePresentation;
  await VCstore.storeVC(verifiablePresentation);
};

export { createVCWithChallengeMessage, saveVCFromSignChallenge };
