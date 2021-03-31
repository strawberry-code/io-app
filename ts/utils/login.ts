import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import base64 from "react-native-base64";
import * as config from "../config";
import { SessionToken } from "../types/SessionToken";
import { AccessAndRefreshToken } from "../store/actions/authentication";
/**
 * Helper functions for handling the SPID login flow through a webview.
 */

type LoginSuccess = {
  success: true;
  token?: SessionToken;
  parameters?: { code: string; state: string };
};

type LoginFailure = {
  success: false;
  errorCode?: string;
};

type LoginResult = LoginSuccess | LoginFailure;

// eslint-disable-next-line sonarjs/cognitive-complexity
function getAllUrlParams(url) {
  // get query string from url (optional) or window
  let queryString = url ? url.split("?")[1] : window.location.search.slice(1);

  // we'll store the parameters here
  const obj = {};

  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split("#")[0];

    // split our query string into its component parts
    const arr = queryString.split("&");

    for (let i = 0; i < arr.length; i++) {
      // separate the keys and the values
      const a = arr[i].split("=");

      // set parameter name and value (use 'true' if empty)
      let paramName = a[0];
      let paramValue = typeof a[1] === "undefined" ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === "string") paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {
        // create key if it doesn't exist
        const key = paramName.replace(/\[(\d+)?\]/, "");
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          const index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === "string") {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

// Prefixes for LOGIN SUCCESS/ERROR
// const LOGIN_SUCCESS_PREFIX = "/profile.html?token=";
const LOGIN_AUTHORIZATION_CODE_PREFIX = "/callback?";
const LOGIN_SUCCESS_PREFIX = "/?grant=";
const LOGIN_FAILURE_PREFIX = "/error.html";
const LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX = "/error.html?errorCode=";

export const extractLoginResult = (url: string): LoginResult | undefined => {
  // Check for LOGIN_SUCCESS
  const successTokenPathPos = url.indexOf(LOGIN_SUCCESS_PREFIX);
  const authorizationCodeString = url.indexOf(LOGIN_AUTHORIZATION_CODE_PREFIX);

  if (authorizationCodeString !== -1) {
    const authorizationCodeUrlParameters = getAllUrlParams(url);
    return { success: true, parameters: authorizationCodeUrlParameters };
  }

  if (successTokenPathPos !== -1) {
    const token = url.substr(successTokenPathPos + LOGIN_SUCCESS_PREFIX.length);
    const accessToken = getAllUrlParams(url).grant;

    if (token && token.length > 0) {
      console.log("SUCCESS", token);
      return { success: true, token: token as SessionToken };
    } else {
      return { success: false };
    }
  }

  // Check for LOGIN_FAILURE
  if (url.indexOf(LOGIN_FAILURE_PREFIX) !== -1) {
    const failureWithErrorCodeTokenPathPos = url.indexOf(
      LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX
    );
    // try to extract error code
    if (failureWithErrorCodeTokenPathPos !== -1) {
      const errCode = url.substr(
        failureWithErrorCodeTokenPathPos +
          LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX.length
      );
      return {
        success: false,
        errorCode: errCode.length > 0 ? errCode : undefined
      };
    }
    return {
      success: false,
      errorCode: undefined
    };
  }
  // Url is not LOGIN related
  return undefined;
};

/** for a given idp id get the relative login uri */
// export const getIdpLoginUri = (idpId: string) =>
//   `${config.apiUrlPrefix}/login?authLevel=SpidL2&entityID=${idpId}`;
export const getIdpLoginUri = (idpId: string) =>
  `https://api.lispa.it/oauth2/authorize?response_type=code&client_id=nX1EUUIb60_1Kl93GpslxCbvGjoa&redirect_uri=http://10.218.161.123/124:9001/callback&scope=ssiplatform_user&state=prova&friendlyName=SPIDMobile`;

/**
 * Extract the login result from the given url.
 * Return true if the url contains login pattern & token
 */
export const onLoginUriChanged = (
  onFailure: (errorCode: string | undefined) => void,
  onSuccessAuthorizationCode: (_: { code: string; state: string }) => void,
  onSuccessToken: (_: SessionToken) => void
) => (navState: WebViewNavigation): boolean => {
  if (navState.url) {
    // If the url is not related to login this will be `null`
    const loginResult = extractLoginResult(navState.url);
    if (loginResult) {
      if (
        loginResult.success &&
        loginResult.parameters &&
        loginResult.parameters.code
      ) {
        // In case of successful login
        onSuccessAuthorizationCode(loginResult.parameters);
        return true;
      } else if (loginResult.success && loginResult.token) {
        onSuccessToken(loginResult.token);
        return true;
      } else if (!loginResult.success) {
        // In case of login failure
        onFailure(loginResult.errorCode);
      }
    }
  }
  return false;
};

export const getToken = async (authorizationCode: {
  code: string;
  state: string;
}) => {
  const blob = base64.encode(
    "nX1EUUIb60_1Kl93GpslxCbvGjoa:33CaI5lihDfAWxtuWeajNu1uYRwa"
  );

  const details = {
    grant_type: "authorization_code",
    code: authorizationCode.code,
    scope: encodeURIComponent("ssiplatform tokenplatform"),
    redirect_uri: "http://10.218.161.123/124:9001/callback"
  };

  const formData = new URLSearchParams(details);

  console.log("body", formData.toString());

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${blob}`
  };

  console.log("blob", headers);
  const url = "https://api.lispa.it/oauth2/token";

  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers,
      body: formData.toString()
    });

    if (rawResponse.status !== 200) {
      throw new Error(JSON.stringify(await rawResponse.json()));
    }
    return await rawResponse.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Network error occurred.");
    }

    console.log("[getTokenfromSPID] errored (string): " + err);
    console.log("[getTokenfromSPID] errored (object): " + JSON.stringify(err));
  }
};

export const refreshSessionFromRefreshToken = async (
  refreshToken: SessionToken
): AccessAndRefreshToken => {
  const blob = base64.encode(
    "nX1EUUIb60_1Kl93GpslxCbvGjoa:33CaI5lihDfAWxtuWeajNu1uYRwa"
  );

  const details = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: encodeURIComponent("ssiplatform tokenplatform"),
    redirect_uri: "http://10.218.161.123/124:9001/callback"
  };

  const formData = new URLSearchParams(details);

  console.log("body", formData.toString());

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${blob}`
  };

  console.log("blob", headers);
  const url = "https://api.lispa.it/oauth2/token";

  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers,
      body: formData.toString()
    });

    if (rawResponse.status !== 200) {
      throw new Error(JSON.stringify(await rawResponse.json()));
    }
    const data = await rawResponse.json();
    console.log("RESPONSE DATA:", data);
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Network error occurred.");
    }

    console.log("[refreshToken] errored (string): " + err);
    console.log("[refreshToken] errored (object): " + JSON.stringify(err));
  }
};

// export const onLoginUriChanged = (
//   onFailure: (errorCode: string | undefined) => void,
//   onSuccess: (_: SessionToken) => void
// ) => (navState: WebViewNavigation): boolean => {
//   if (navState.url) {
//     // If the url is not related to login this will be `null`
//     console.log("navstate url", navState.url, "navstate", navState);
//     const loginResult = extractLoginResult(navState.url);
//     console.log("loginResult", loginResult);
//     if (loginResult) {
//       if (loginResult.success) {
//         // In case of successful login
//         onSuccess(loginResult.token);
//         return true;
//       } else {
//         // In case of login failure
//         onFailure(loginResult.errorCode);
//       }
//     }
//   }
//   return false;
// };
