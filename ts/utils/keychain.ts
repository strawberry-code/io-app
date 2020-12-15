/**
 * Helpers for setting a getting the PIN code.
 *
 * Note: setGenerigPassword and getGenericPassword will use the App bundle ID
 * as the service ID by default.
 * @see https://github.com/oblador/react-native-keychain#options
 */

import { fromEither, none, Option } from "fp-ts/lib/Option";
import * as Keychain from "react-native-keychain";

import { PinString } from "../types/PinString";
import {DidSingleton} from "../types/DID";
import NetCode from "../screens/ssi/NetCode";

const PIN_KEY = "PIN";
const DID_KEY = "DID";
const ACCESS_TOKEN_KEY = "ACCESS_TOKEN_KEY";

/**
 * Wrapper that sets default accessible option.
 *
 * More about accessibility options:
 * https://developer.apple.com/documentation/security/ksecattraccessibleafterfirstunlock
 */
export async function setGenericPasswordWithDefaultAccessibleOption(
  username: string,
  password: string,
  options?: Keychain.Options
) {
  return Keychain.setGenericPassword(username, password, {
    ...options,
    // The data in the keychain item can be accessed only while the device is unlocked by the user.
    // This is recommended for items that need to be accessible only while the application is in the foreground. Items
    // with this attribute do not migrate to a new device. Thus, after restoring from a backup of a different device,
    // these items will not be present.
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

/**
 * Saves the provided unlock code in the Keychain
 */
export async function setPin(pin: PinString): Promise<boolean> {
  return await setGenericPasswordWithDefaultAccessibleOption(PIN_KEY, pin, {service: PIN_KEY});
}

/**
 * Removes the unlock code from the Keychain
 */
export async function deletePin(): Promise<boolean> {
  await deleteDid() // FIXME: qui va bene per or, anche se non è proprio ortodossa come cosa, capire come fare bene rafactoring we necessario
  await deleteSsiAccessToken() // FIXME: qui va bene per or, anche se non è proprio ortodossa come cosa, capire come fare bene rafactoring we necessario
  return await Keychain.resetGenericPassword({service: PIN_KEY});
}

/**
 * Returns the unlock code from the Keychain.
 *
 * The promise fails when there is no valid unlock code stored.
 */
export async function getPin(): Promise<Option<PinString>> {
  const credentials = await Keychain.getGenericPassword({service: PIN_KEY});
  if (typeof credentials !== "boolean" && credentials.password.length > 0) {
    return fromEither(PinString.decode(credentials.password));
  } else {
    return none;
  }
}

/**
 * Save marshalled DID info in keychain
 */
export async function setDidOnKeychain(): Promise<boolean> {
  return await setGenericPasswordWithDefaultAccessibleOption(DID_KEY, DidSingleton.marshal(), {service: DID_KEY});
}

/**
 * Removes the DID from the Keychain
 */
export async function deleteDid(): Promise<boolean> {
  await NetCode.deleteUser(DidSingleton.getDidAddress())
  DidSingleton.destroy()
  return await Keychain.resetGenericPassword({service: DID_KEY});
}

/**
 * Returns the DID from the Keychain
 *
 * The promise fails when there is no valid unlock code stored.
 */
export async function getDidFromKeychain(): Promise<boolean> {
  let credentials = await Keychain.getGenericPassword({service: DID_KEY});
  if (typeof credentials !== "boolean" && credentials.password.length > 0) {
    try {
      DidSingleton.unmarshal(credentials.password)
    } catch(e) {
      throw new Error(e)
    }
    return true
  }
  return false
}



/**
 * Save marshalled SSI Access Token info in keychain
 */
export async function setSsiAccessToken(_accessToken: string): Promise<boolean> {
  return await setGenericPasswordWithDefaultAccessibleOption(ACCESS_TOKEN_KEY, _accessToken, {service: ACCESS_TOKEN_KEY});
}

/**
 * Removes the SSI Access Token from the Keychain
 */
export async function deleteSsiAccessToken(): Promise<boolean> {
  return await Keychain.resetGenericPassword({service: ACCESS_TOKEN_KEY});
}

/**
 * Returns the SSI Access Token from the Keychain
 */
export async function getSsiAccessToken(): Promise<string | null> {
  let credentials = await Keychain.getGenericPassword({service: ACCESS_TOKEN_KEY});
  if (typeof credentials !== "boolean" && credentials.password.length > 0) {
    return credentials.password
  } else {
    return null
  }
}
