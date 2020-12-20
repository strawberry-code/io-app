/**
 * Notification message reducer
 */
import { getType } from "typesafe-actions";
import VCstore from "../../../screens/ssi/VCstore";

import {
  loadSsiNotifications,
  updateSsiNotifications,
  clearSsiNotifications,
  acceptSsiNotification,
  refuseSsiNotification
} from "../../actions/notifications";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type VerifiedCredentialNotifications =
  | Array<{
      id: number;
      VPjwt: string;
      date: Date;
      isRead: boolean;
    }>
  | [];

const INITIAL_STATE: VerifiedCredentialNotifications = [];

const reducer = (
  state: VerifiedCredentialNotifications = INITIAL_STATE,
  action: Action
): VerifiedCredentialNotifications => {
  console.log("SSI NOTIFICATIONS", state);
  console.log("ACTION", action);
  switch (action.type) {
    case getType(loadSsiNotifications.success):
      return action.payload;

    case getType(loadSsiNotifications.failure):
      return state;

    case getType(updateSsiNotifications):
      const { VPjwt: VPjwtToAdd } = action.payload;

      if (!VPjwtToAdd) {
        return state;
      }

      // CHECK IF VPjwt already in the state and filter it out
      const updatedNotifications = state.filter(n => n.VPjwt !== VPjwtToAdd);

      const newEntry = {
        id: state.length > 0 ? state[state.length - 1].id + 1 : 1,
        VPjwt: action.payload.VPjwt,
        date: new Date(),
        isRead: false
      };

      return [...updatedNotifications, newEntry];

    case getType(acceptSsiNotification):
      const { id: acceptedId } = action.payload;
      const notificationToAccept = state.find(n => n.id === acceptedId);
      if (!notificationToAccept) {
        return state;
      }

      void VCstore.storeVC(notificationToAccept.VPjwt);

      return state.filter(notication => notication.id !== acceptedId);

    case getType(refuseSsiNotification):
      const { id: refusedId } = action.payload;
      const notificationToRefuse = state.find(n => n.id === refusedId);
      if (!notificationToRefuse) {
        return state;
      }
      return state.filter(notication => notication.id !== refusedId);

    case getType(clearSsiNotifications):
      return [];

    default:
      return state;
  }
};

export default reducer;

// Selector
export const getSsiNotifications = (state: GlobalState) =>
  state.notifications.ssiNotifications;
