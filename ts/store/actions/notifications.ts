/**
 * Action types and action creator related to the Notifications.
 */

import {
  ActionType,
  createAction,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";

import { VerifiedCredentialNotifications } from "../reducers/notifications/ssiNotifications";

export const updateNotificationsInstallationToken = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE"
)<string>();

export const updateNotificationInstallationFailure = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE"
)<Error>();

export const updateNotificationsPendingMessage = createAction(
  "NOTIFICATIONS_PENDING_MESSAGE_UPDATE",
  resolve => (messageId: string, foreground: boolean) =>
    resolve({ id: messageId, foreground })
);

export const clearNotificationPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_CLEAR"
)();

/*
 * SSI NOTIICATIONS ACTIONS
 */

export const updateSsiNotifications = createAction(
  "UPDATE_SSI_NOTIFICATIONS",
  resolve => (vpJwt: string) => resolve({ VPjwt: vpJwt })
);

export const acceptSsiNotification = createAction(
  "ACCEPT_SSI_NOTIFICATION",
  resolve => (id: number) => resolve({ id })
);

export const refuseSsiNotification = createAction(
  "REFUSE_SSI_NOTIFICATION",
  resolve => (id: number) => resolve({ id })
);
export const clearSsiNotifications = createStandardAction(
  "CLEAR_SSI_NOTIFICATIONS"
)();

export const loadSsiNotifications = createAsyncAction(
  "LOAD_SSI_NOTIFICATIONS",
  "LOAD_SSI_NOTIFICATIONS_SUCCESS",
  "LOAD_SSI_NOTIFICATIONS_FAILURE"
)<void, VerifiedCredentialNotifications, Error>();

export type NotificationsActions =
  | ActionType<typeof updateNotificationsInstallationToken>
  | ActionType<typeof updateNotificationInstallationFailure>
  | ActionType<typeof updateNotificationsPendingMessage>
  | ActionType<typeof clearNotificationPendingMessage>
  | ActionType<typeof loadSsiNotifications>
  | ActionType<typeof updateSsiNotifications>
  | ActionType<typeof clearSsiNotifications>
  | ActionType<typeof refuseSsiNotification>
  | ActionType<typeof acceptSsiNotification>;
