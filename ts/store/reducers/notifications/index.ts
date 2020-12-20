/**
 * Notifications reducer
 */

import { combineReducers } from "redux";
import { Action } from "../../actions/types";
import installationReducer, { InstallationState } from "./installation";
import pendingMessageReducer, { PendingMessageState } from "./pendingMessage";
import ssiNotificationsReducer, {
  VerifiedCredentialNotifications
} from "./ssiNotifications";

export type NotificationsState = {
  installation: InstallationState;
  pendingMessage: PendingMessageState;
  ssiNotifications: VerifiedCredentialNotifications;
};

const reducer = combineReducers<NotificationsState, Action>({
  installation: installationReducer,
  pendingMessage: pendingMessageReducer,
  ssiNotifications: ssiNotificationsReducer
});

export default reducer;
