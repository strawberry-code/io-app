/**
 * Action types and action creator related to setting or recovering DID address.
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { DID } from "../../types/DID";

export const recoverDID = createStandardAction("RECOVER_DID")();

export const createDIDSuccess = createStandardAction("CREATE_DID_SUCCESS")<
  DID
>();

export type DIDSetActions = ActionType<
  typeof createDIDSuccess | typeof recoverDID
>;
