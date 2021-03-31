/* eslint-disable no-console */
import {Platform} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { JWT } from "did-jwt-vc/lib/types";
import {getSsiAccessToken} from "../../utils/keychain";
import { sessionTokenSelector } from "../../store/reducers/authentication";
import * as config from '../../config';
import { store } from "../../App";
import { fetchWithTimeout } from "./SsiUtils";


class __NetCode {

  serverBaseURL = config.apiSSIPrefix;

  constructor() {
    if (NetCode) {
      return NetCode
    } else {
      return this
    }
  }

  public async doAuthenticatedCallbackUrlFromQr({body, method, url}) {

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
   // headers.append('Authorization', 'Bearer ' + <string>await getSsiAccessToken())

    let rawResponse

    this.dumpPreFetch('doAuthenticatedCallbackUrlFromQr', {url, method, headers, body})
    try {
      rawResponse = await fetchWithTimeout(url, {
        method: method.toUpperCase(),
        headers: headers,
        body: JSON.stringify(body)
      });
      console.log('response status: ', rawResponse.status)
      if (rawResponse.status !== 200) {
        throw new Error(JSON.stringify(await rawResponse.json()));
      }
      return await rawResponse.json();
    } catch (err) {

      if (err.name === 'AbortError') {
        throw new Error('Network error occurred.');
      }

      console.log('[doAuthenticatedCallbackUrlFromQr] errored (string): ' + err)
      console.log('[doAuthenticatedCallbackUrlFromQr] errored (object): ' + JSON.stringify(err))
      return false
    }

  }

  public async createNewUser(didAddress: string, pushDeviceToken: string | undefined) {

    if(pushDeviceToken === null || pushDeviceToken === undefined) {
      pushDeviceToken = await AsyncStorage.getItem('PUSH_TOKEN')
    }

    console.log('[NetCode][createNewUser] - did address: <'+didAddress+'> | push device token: <'+pushDeviceToken+'>')

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Authorization', 'Bearer ' + <string>await getSsiAccessToken())
    let pushService: string = Platform.OS === 'ios' ? 'APN' : 'FCM'
    let body = {
      "did": didAddress,
      "notificationToken": pushDeviceToken,
      "service": pushService
    }
    let apiUrl = '/users'
    let method = 'PUT'

    let url = this.serverBaseURL + apiUrl;

    let rawResponse

    if(pushDeviceToken === undefined) {
      pushDeviceToken = ''
      pushService = ''
    }

    this.dumpPreFetch('createNewUser',{url, method, headers, body})
    try {
      rawResponse = await fetch(url, {
        method: method.toUpperCase(),
        headers: headers,
        body: JSON.stringify(body)
      })
    } catch (err) {
      console.log('[createNewUser] errored (string): ' + err)
      console.log('[createNewUser] errored (object): ' + JSON.stringify(err))
      return false
    }

    console.log('rawResponse.status: ' + rawResponse.status)

    //console.log('response final: ' + JSON.stringify(await rawResponse.json()))

    if (rawResponse.status === 201 || rawResponse.status === 200) {
      return true
    } else {
      return false
    }
  }

  public async deleteUser(didAddress: string) {
    let apiUrl = '/users'
    let method = 'DELETE'
    let url = this.serverBaseURL + apiUrl + '/' + encodeURI(didAddress);
    let headers = new Headers()
    headers.append('Authorization', 'Bearer ' + <string>await getSsiAccessToken())
    let rawResponse
    this.dumpPreFetch('deleteUser',{url, method, headers})
    try {
      rawResponse = await fetch(url, {
        method: method.toUpperCase(),
        headers: headers
      })

      console.log(`[deleteUser] raw response:  ${JSON.stringify(rawResponse)}`)
      console.log(`[deleteUser] json response:  ${JSON.stringify(await rawResponse.json())}`)

    } catch (err) {
      console.log('[deleteUser] errored (string): ' + err)
      console.log('[deleteUser] errored (object): ' + JSON.stringify(err))
      return false
    }

    if (rawResponse.status === 201) {
      return true
    } else {
      return false
    }
  }

  public async signIn(username: string, password: string) {
    const apiUrl = '/auth/signIn';
    const method = 'POST';
    const url = this.serverBaseURL + apiUrl;;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const body = JSON.stringify({ username, password });

    this.dumpPreFetch('auth/signIn',{url, method, headers, body});
    try {
      const rawResponse = await fetch(url, {
        headers,
        method,
        body
      });
      
      const responseBody = await rawResponse.json();

      console.log(`[auth/signIn] raw response:  ${JSON.stringify(rawResponse)}`);
      console.log(`[auth/signIn] json response:  ${JSON.stringify(responseBody)}`);

      if (rawResponse.status === 201) {
        return responseBody;
      } else {
        throw new Error(`[auth/signIn] Something went wrong ${JSON.stringify(responseBody)}`);
      }


    } catch (err) {
      console.log('[auth/signIn] errored (string): ', err);
      console.log('[auth/signIn] errored (object): ' + JSON.stringify(err));
      return;
    }

  }

  public async signUpDid(didAddress: string, overWriteDID?: boolean) {
    const apiUrl = '/auth/signUp';
    const method = 'GET';
    const overWriteParam = overWriteDID ? '&overwrite=true' : '';
    const url = this.serverBaseURL + apiUrl + '/?sub=' + encodeURI(didAddress) + overWriteParam;
    const headers = new Headers();
    const sessionToken = sessionTokenSelector(store.getState());
    headers.append('Authorization', `Bearer ${sessionToken}`);
    this.dumpPreFetch('auth/signUp',{url, method, headers});
    try {
      const rawResponse = await fetch(url, {
        headers,
        method,
      });
      
      const responseBody = await rawResponse.json();

      console.log(`[auth/signUp] raw response:  ${JSON.stringify(rawResponse)}`);
      console.log(`[auth/signUp] json response:  ${JSON.stringify(responseBody)}`);

      if (rawResponse.status === 409) {
        throw new Error(`[auth/signUp] User has already a DID`);
      }

      if (rawResponse.status === 200) {
        return responseBody;
      } else {
        throw new Error(`[auth/signUp] Something went wrong ${JSON.stringify(responseBody)}`);
      }

    } catch (err) {
      console.log('[auth/signUp] errored (string): ', err);
      console.log('[auth/signUp] errored (object): ' + JSON.stringify(err));
      throw new Error(err.message);
    }

  }

  public async signChallengeForVID(signedJWT: JWT) {
    const apiUrl = '/auth/signChallengeForVID';
    const method = 'POST';
    const url = this.serverBaseURL + apiUrl;
    const headers = new Headers();
    const sessionToken = sessionTokenSelector(store.getState());
    headers.append('Authorization', `Bearer ${sessionToken}`);
    headers.append('Content-Type', 'application/json');

    const notificationToken = await AsyncStorage.getItem('PUSH_TOKEN');
    const service = Platform.OS === "ios" ? "APN" : "FCM";

    const body = JSON.stringify({
      signedVIDRequest: signedJWT,
      notificationToken,
      service
    });

    this.dumpPreFetch('signChallangeForVID',{url, method, headers, body});
    try {
      const rawResponse = await fetch(url, {
        headers,
        method,
        body
      });
      
      const responseBody = await rawResponse.json();

      console.log(`[/auth/signChallengeForVID] raw response:  ${JSON.stringify(rawResponse)}`);
      console.log(`[/auth/signChallengeForVID] json response:  ${JSON.stringify(responseBody)}`);

      if (rawResponse.status === 201) {
        return responseBody;
      } else {
        throw new Error(`[/auth/signChallengeForVID] Something went wrong: ${JSON.stringify(responseBody)}`);
      }


    } catch (err) {
      console.log('[/auth/signChallengeForVID] errored (string): ', err);
      console.log('[/auth/signChallengeForVID] errored (object): ' + JSON.stringify(err));
      return;
    }

  }

  public dumpPreFetch(caller: string,{body, headers, method, url}: { url?: string; method?: string; headers?: Headers; body?: RequestInit["body"] }) {
    const debugString = `🚀 [HTTP REQUEST][${caller}] - url: ${url} - method: ${method} - headers: ${JSON.stringify(headers)} - body: ${JSON.stringify(body)}`;
    console.log(debugString);
  }

}

const NetCode = new __NetCode();

export default NetCode;
