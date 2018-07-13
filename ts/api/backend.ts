import * as t from "io-ts";
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicErrorResponseDecoder,
  basicResponseDecoder,
  BasicResponseType,
  composeHeaderProducers,
  composeResponseDecoders,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType,
  IPutApiRequestType,
  IResponseType,
  ResponseDecoder
} from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Installation } from "../../definitions/backend/Installation";
import { LimitedProfile } from "../../definitions/backend/LimitedProfile";
import { Messages } from "../../definitions/backend/Messages";
import { MessageWithContent } from "../../definitions/backend/MessageWithContent";
import { ProfileWithEmail } from "../../definitions/backend/ProfileWithEmail";
import { ProfileWithoutEmail } from "../../definitions/backend/ProfileWithoutEmail";
import { PublicSession } from "../../definitions/backend/PublicSession";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { SessionToken } from "../types/SessionToken";

//
// Define composed types (e.g. oneOf) as they are not yet generated by
// gen-api-models
//

// ProfileWithOrWithoutEmail is oneOf [ProfileWithEmail, ProfileWithoutEmail]
const ProfileWithOrWithoutEmail = t.union([
  ProfileWithEmail,
  ProfileWithoutEmail
]);

export type ProfileWithOrWithoutEmail = t.TypeOf<
  typeof ProfileWithOrWithoutEmail
>;

// FullProfile is allOf [ExtendedProfile, LimitedProfile]
export const FullProfile = t.intersection([ExtendedProfile, LimitedProfile]);

export type FullProfile = t.TypeOf<typeof FullProfile>;

export const SuccessResponse = t.interface({
  message: t.string
});

export type SuccessResponse = t.TypeOf<typeof SuccessResponse>;

//
// Define the types of the requests
//

// A basic response type that also include 401
export type BasicResponseTypeWith401<R> =
  | BasicResponseType<R>
  | IResponseType<401, Error>;

// A basic response decoder that also include 401
export function basicResponseDecoderWith401<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<BasicResponseTypeWith401<R>> {
  return composeResponseDecoders(
    basicResponseDecoder(type),
    basicErrorResponseDecoder(401)
  );
}

export type GetSessionT = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseTypeWith401<PublicSession>
>;

export type GetServiceT = IGetApiRequestType<
  {
    id: string;
  },
  "Authorization",
  never,
  BasicResponseType<ServicePublic>
>;

export type GetMessagesT = IGetApiRequestType<
  {
    cursor?: number;
  },
  "Authorization",
  "cursor",
  BasicResponseTypeWith401<Messages>
>;

export type GetMessageT = IGetApiRequestType<
  {
    id: string;
  },
  "Authorization",
  never,
  BasicResponseType<MessageWithContent>
>;

export type GetProfileT = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseTypeWith401<ProfileWithEmail | ProfileWithoutEmail>
>;

export type CreateOrUpdateProfileT = IPostApiRequestType<
  {
    newProfile: ExtendedProfile;
  },
  "Authorization" | "Content-Type",
  never,
  BasicResponseTypeWith401<LimitedProfile | ExtendedProfile>
>;

export type CreateOrUpdateInstallationT = IPutApiRequestType<
  {
    id: string;
    installation: Installation;
  },
  "Authorization" | "Content-Type",
  never,
  BasicResponseType<NonEmptyString>
>;

export type LogoutT = IPostApiRequestType<
  {},
  "Authorization" | "Content-Type",
  never,
  BasicResponseTypeWith401<SuccessResponse>
>;

export type BackendClientT = ReturnType<typeof BackendClient>;

//
// Create client
//

export function BackendClient(baseUrl: string, token: SessionToken) {
  const options = {
    baseUrl
  };

  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  const getSessionT: GetSessionT = {
    method: "get",
    url: () => "/api/v1/session",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: basicResponseDecoderWith401(PublicSession)
  };

  const getServiceT: GetServiceT = {
    method: "get",
    url: params => `/api/v1/services/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(ServicePublic)
  };

  const getMessagesT: GetMessagesT = {
    method: "get",
    url: () => `/api/v1/messages`,
    query: params => ({
      cursor: params.cursor ? `${params.cursor}` : ""
    }),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoderWith401(Messages)
  };

  const getMessageT: GetMessageT = {
    method: "get",
    url: params => `/api/v1/messages/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(MessageWithContent)
  };

  const getProfileT: GetProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoderWith401(ProfileWithOrWithoutEmail)
  };

  const createOrUpdateProfileT: CreateOrUpdateProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.newProfile),
    response_decoder: basicResponseDecoderWith401(ProfileWithOrWithoutEmail)
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.id}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.installation),
    response_decoder: basicResponseDecoder(NonEmptyString)
  };

  const logoutT: LogoutT = {
    method: "post",
    url: () => "/logout",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: _ => JSON.stringify({}),
    response_decoder: basicResponseDecoderWith401(SuccessResponse)
  };

  return {
    getSession: createFetchRequestForApi(getSessionT, options),
    getService: createFetchRequestForApi(getServiceT, options),
    getMessages: createFetchRequestForApi(getMessagesT, options),
    getMessage: createFetchRequestForApi(getMessageT, options),
    getProfile: createFetchRequestForApi(getProfileT, options),
    createOrUpdateProfile: createFetchRequestForApi(
      createOrUpdateProfileT,
      options
    ),
    createOrUpdateInstallation: createFetchRequestForApi(
      createOrUpdateInstallationT,
      options
    ),
    logout: createFetchRequestForApi(logoutT, options)
  };
}
