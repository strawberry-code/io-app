import {Platform} from "react-native";
import {getSsiAccessToken} from "../../utils/keychain";
import AsyncStorage from "@react-native-community/async-storage";


class __NetCode {

  protocol = 'https://'
  serverAddress = 'ssi-aria-backend.herokuapp.com'
  serverBaseURL = this.protocol + this.serverAddress

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
    headers.append('Authorization', 'Bearer ' + <string>await getSsiAccessToken())

    let rawResponse

    this.dumpPreFetch('doAuthenticatedCallbackUrlFromQr', {url, method, headers, body})
    try {
      rawResponse = await fetch(url, {
        method: method.toUpperCase(),
        headers: headers,
        body: JSON.stringify(body)
      })
      console.log('response status: ' + rawResponse.status)
    } catch (err) {
      console.log('[doAuthenticatedCallbackUrlFromQr] errored (string): ' + err)
      console.log('[doAuthenticatedCallbackUrlFromQr] errored (object): ' + JSON.stringify(err))
      return false
    }

    return await rawResponse.json()
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

  public dumpPreFetch(caller: string,{body, headers, method, url}: { url?: string; method?: string; headers?: Headers; body?: object; }) {
    let debugString = `🚀 [HTTP REQUEST][${caller}] - url: ${url} - method: ${method} - headers: ${JSON.stringify(headers)} - body: ${JSON.stringify(body)}`
    console.log(debugString)
  }

}

let NetCode = new __NetCode()

export default NetCode
