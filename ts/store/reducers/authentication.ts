import { none, Option, some } from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { createSelector } from "reselect";
import { isActionOf } from "typesafe-actions";
import { addSeconds } from "date-fns";
import { PublicSession } from "../../../definitions/backend/PublicSession";
import { IdentityProvider } from "../../models/IdentityProvider";
import { SessionToken } from "../../types/SessionToken";
import {
  idpSelected,
  loginSuccess,
  loginSuccessWithoutGrantToken,
  logoutFailure,
  logoutSuccess,
  resetAuthenticationState,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid,
  startRefreshingTokens,
  refreshAuthenticationTokens,
  refreshAuthenticationGrantToken
} from "../actions/authentication";
import { Action } from "../actions/types";
import { logoutRequest } from "./../actions/authentication";
import { GlobalState } from "./types";

// Types

// reason for the user to be in the unauthenticated state
type LoggedOutReason = "NOT_LOGGED_IN" | "SESSION_EXPIRED";

// PublicSession attributes
export type TokenName = keyof Omit<PublicSession, "spidLevel">;

// The user is logged out and hasn't selected an IDP
type LoggedOutWithoutIdp = Readonly<{
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}>;

// The user is logged out but has already selected an IDP
export type LoggedOutWithIdp = Readonly<{
  kind: "LoggedOutWithIdp";
  idp: IdentityProvider;
  reason: LoggedOutReason;
}>;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutGrantToken = Readonly<{
  kind: "LoggedInWithoutGrantToken";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  refreshToken: SessionToken;
  expire: Date;
}>;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutSessionInfo = Readonly<{
  kind: "LoggedInWithoutSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  refreshToken: SessionToken;
  expire: Date;
  grantToken: SessionToken;
}>;

// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  kind: "LoggedInWithSessionInfo";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  refreshToken: SessionToken;
  expire: Date;
  grantToken: SessionToken;
  sessionInfo: PublicSession;
}>;

// The user is logged in and we are refreshing tokens
export type LoggedInAndRefreshingTokens = Readonly<{
  kind: "LoggedInAndRefreshingTokens";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  refreshToken: SessionToken;
  expire: Date;
  grantToken: SessionToken;
  sessionInfo?: PublicSession;
}>;

// The user is logged in and we are refreshing grant token
export type LoggedInAndRefreshingGrantToken = Readonly<{
  kind: "LoggedInAndRefreshingGrantToken";
  idp: IdentityProvider;
  sessionToken: SessionToken;
  refreshToken: SessionToken;
  expire: Date;
  grantToken: SessionToken;
  sessionInfo?: PublicSession;
}>;

export type LogoutRequested = Readonly<{
  kind: "LogoutRequested";
  idp: IdentityProvider;
  reason: LoggedOutReason;
}>;

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutGrantToken
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo
  | LoggedInAndRefreshingTokens
  | LoggedInAndRefreshingGrantToken;

type AuthenticationStateWithIdp =
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithoutGrantToken
  | LoggedInWithSessionInfo
  | LoggedInAndRefreshingTokens
  | LoggedInAndRefreshingGrantToken;

// Here we mix the plain AuthenticationState with the keys added by redux-persist
export type PersistedAuthenticationState = AuthenticationState & PersistPartial;

// Initially the user is logged out and hasn't selected an IDP
const INITIAL_STATE: LoggedOutWithoutIdp = {
  kind: "LoggedOutWithoutIdp",
  reason: "NOT_LOGGED_IN"
};

// Type guards

export function isLoggedOutWithIdp(
  state: AuthenticationState
): state is LoggedOutWithIdp {
  return state.kind === "LoggedOutWithIdp";
}

export function isLoggedInWithoutGrantToken(
  state: AuthenticationState
): state is LoggedInWithoutGrantToken {
  return state.kind === "LoggedInWithoutGrantToken";
}

function isLoggedInWithoutSessionInfo(
  state: AuthenticationState
): state is LoggedInWithoutSessionInfo {
  return state.kind === "LoggedInWithoutSessionInfo";
}

export function isLoggedInWithSessionInfo(
  state: AuthenticationState
): state is LoggedInWithSessionInfo {
  return state.kind === "LoggedInWithSessionInfo";
}

export function isLoggedInAndRefreshingTokens(
  state: AuthenticationState
): state is LoggedInWithSessionInfo {
  return state.kind === "LoggedInAndRefreshingTokens";
}

export function isLoggedInAndRefreshingGrantToken(
  state: AuthenticationState
): state is LoggedInWithSessionInfo {
  return state.kind === "LoggedInAndRefreshingGrantToken";
}

export function isLoggedIn(
  state: AuthenticationState
): state is
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo
  | LoggedInAndRefreshingTokens
  | LoggedInAndRefreshingGrantToken {
  return (
    isLoggedInWithoutSessionInfo(state) ||
    isLoggedInWithSessionInfo(state) ||
    isLoggedInAndRefreshingTokens(state) ||
    isLoggedInAndRefreshingGrantToken(state)
  );
}

export function isRefreshing(
  state: AuthenticationState
): state is LoggedInAndRefreshingTokens | LoggedInAndRefreshingGrantToken {
  return (
    isLoggedInAndRefreshingTokens(state) ||
    isLoggedInAndRefreshingGrantToken(state)
  );
}

export function isSessionExpired(
  state: AuthenticationState
): state is LoggedOutWithoutIdp | LoggedOutWithIdp {
  return isLoggedOutWithIdp(state) && state.reason === "SESSION_EXPIRED";
}

// Selectors

export const isLogoutRequested = (state: GlobalState) =>
  state.authentication.kind === "LogoutRequested";

export const isSessionExpiredSelector = (state: GlobalState) =>
  !isLoggedIn(state.authentication) && isSessionExpired(state.authentication);

export const isRefreshingTokensSelector = (state: GlobalState): boolean =>
  isRefreshing(state.authentication);

export const isRefreshingGrantTokenSelector = (state: GlobalState): boolean =>
  isLoggedInAndRefreshingGrantToken(state.authentication);

export const isSpidLoginSelector = (state: GlobalState): boolean => {
  return isLoggedIn(state.authentication)
    ? state.authentication.refreshToken !== "NO_SPID_LOGIN" &&
        state.authentication.grantToken !== "NO_SPID_LOGIN"
    : false;
};

export const sessionTokenSelector = (
  state: GlobalState
): SessionToken | undefined =>
  isLoggedIn(state.authentication)
    ? state.authentication.sessionToken
    : undefined;

export const refreshTokenSelector = (
  state: GlobalState
): SessionToken | undefined =>
  isLoggedIn(state.authentication)
    ? state.authentication.refreshToken
    : undefined;

export const tokenExpirationSelector = (state: GlobalState): Date | undefined =>
  isLoggedIn(state.authentication) ? state.authentication.expire : undefined;

export const sessionInfoSelector = (state: GlobalState) =>
  isLoggedInWithSessionInfo(state.authentication)
    ? some(state.authentication.sessionInfo)
    : none;

export const tokenFromNameSelector = (
  tokenName: TokenName
): ((state: GlobalState) => Option<string>) =>
  createSelector<GlobalState, Option<PublicSession>, Option<string>>(
    sessionInfoSelector,
    maybeSessionInfo => maybeSessionInfo.map(si => si[tokenName])
  );

export const selectedIdentityProviderSelector = (state: GlobalState) =>
  isLoggedOutWithIdp(state.authentication)
    ? state.authentication.idp
    : undefined;

function matchWithIdp<O>(
  state: AuthenticationState,
  whenWithoutIdp: O,
  whenWithIdp: (state: AuthenticationStateWithIdp) => O
): O {
  if (state.kind === "LoggedOutWithoutIdp") {
    return whenWithoutIdp;
  }

  return whenWithIdp(state);
}

export const idpSelector = ({
  authentication
}: GlobalState): Option<IdentityProvider> =>
  matchWithIdp(authentication, none, ({ idp }) => some(idp));

/* eslint-disable sonarjs/cognitive-complexity */
// eslint-disable-next-line complexity
const reducer = (
  state: AuthenticationState = INITIAL_STATE,
  action: Action
): AuthenticationState => {
  console.log("AUTHENTICATION", state, "\n", "ACTION", action);

  if (
    isActionOf(idpSelected, action) &&
    !isLoggedIn(state) &&
    !isLoggedInWithoutGrantToken(state) &&
    !isRefreshing(state)
  ) {
    // Save the selected IDP in the state
    return {
      ...state,
      ...{
        kind: "LoggedOutWithIdp",
        idp: action.payload
      }
    };
  }

  if (isActionOf(loginSuccess, action) && isLoggedOutWithIdp(state)) {
    // Save the SessionToken (got from the WebView redirect url) in the state
    return {
      kind: "LoggedInWithoutGrantToken",
      idp: state.idp,
      sessionToken: action.payload.access_token,
      refreshToken: action.payload.refresh_token,
      expire: addSeconds(new Date(), action.payload.expires_in)
    };
  }

  if (
    isActionOf(loginSuccessWithoutGrantToken, action) &&
    isLoggedInWithoutGrantToken(state)
  ) {
    // Save the SessionToken (got from the WebView redirect url) in the state
    return {
      ...state,
      ...{
        kind: "LoggedInWithoutSessionInfo",
        grantToken: action.payload
      }
    };
  }

  if (
    isActionOf(sessionInformationLoadSuccess, action) &&
    isLoggedInWithoutSessionInfo(state)
  ) {
    // Save the session info in the state
    return {
      ...state,
      ...{
        kind: "LoggedInWithSessionInfo",
        sessionInfo: action.payload
      }
    };
  }

  if (isActionOf(logoutRequest, action) && isLoggedIn(state)) {
    return {
      ...state,
      ...{
        kind: "LogoutRequested",
        reason: "NOT_LOGGED_IN"
      }
    };
  }

  if (
    isActionOf(startRefreshingTokens, action) &&
    isLoggedIn(state) &&
    !isRefreshing(state)
  ) {
    return {
      ...state,
      kind: "LoggedInAndRefreshingTokens"
    };
  }

  if (
    isActionOf(refreshAuthenticationTokens, action) &&
    isLoggedInAndRefreshingTokens(state)
  ) {
    return {
      ...state,
      ...{
        kind: "LoggedInAndRefreshingGrantToken",
        sessionToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        expire: addSeconds(new Date(), action.payload.expires_in)
      }
    };
  }

  if (
    isActionOf(refreshAuthenticationGrantToken, action) &&
    isLoggedInAndRefreshingGrantToken(state)
  ) {
    return {
      ...state,
      ...{
        kind: "LoggedInWithSessionInfo",
        grantToken: action.payload
      }
    };
  }

  if (
    (isActionOf(sessionExpired, action) ||
      isActionOf(sessionInvalid, action) ||
      isActionOf(logoutSuccess, action) ||
      isActionOf(logoutFailure, action)) &&
    isLoggedIn(state)
  ) {
    return {
      kind: "LoggedOutWithIdp",
      idp: state.idp,
      reason: isActionOf(sessionExpired, action)
        ? "SESSION_EXPIRED"
        : "NOT_LOGGED_IN"
    };
  }

  if (isActionOf(resetAuthenticationState, action) && isSessionExpired(state)) {
    return INITIAL_STATE;
  }

  return state;
};

export default reducer;
