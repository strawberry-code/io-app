/**
 * A saga to manage notifications
 */
import { readableReport } from "italia-ts-commons/lib/reporters";
import { TypeOfApiResponseStatus } from "italia-ts-commons/lib/requests";
import { Platform } from "react-native";
import { call, Effect, put, select, takeEvery } from "redux-saga/effects";
import { PlatformEnum } from "../../definitions/backend/Platform";
import { CreateOrUpdateInstallationT } from "../../definitions/backend/requestTypes";
import { BackendClient } from "../api/backend";
import notificationStore from "../screens/ssi/notificationStore";
import {
  updateNotificationInstallationFailure,
  loadSsiNotifications
} from "../store/actions/notifications";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";
import { SagaCallReturnType } from "../types/utils";

const notificationsPlatform: PlatformEnum = Platform.select<PlatformEnum>({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm,
  default: PlatformEnum.gcm
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
): Generator<
  Effect,
  TypeOfApiResponseStatus<CreateOrUpdateInstallationT> | undefined,
  any
> {
  // Get the notifications installation data from the store
  const notificationsInstallation: ReturnType<typeof notificationsInstallationSelector> = yield select(
    notificationsInstallationSelector
  );

  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token === undefined) {
    return undefined;
  }
  try {
    // Send the request to the backend
    const response: SagaCallReturnType<typeof createOrUpdateInstallation> = yield call(
      createOrUpdateInstallation,
      {
        installationID: notificationsInstallation.id,
        installation: {
          platform: notificationsPlatform,
          pushChannel: notificationsInstallation.token
        }
      }
    );

    /**
     * If the response isLeft (got an error) dispatch a failure action
     */
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    return response.value.status;
  } catch (error) {
    yield put(updateNotificationInstallationFailure(error));
    return undefined;
  }
}

function* loadSsiNotificationFromAsyncStorage(): Generator<Effect, any> {
  // Get the notifications installation data from the store
  try {
    // Send the request to the backend
    const notifications = yield call(notificationStore.getNotifications);
    yield put(loadSsiNotifications.success(notifications));
    return undefined;
  } catch (error) {
    yield put(loadSsiNotifications.failure(error as Error));
  }
}

export function* loadSsiNotificationsSaga() {
  yield takeEvery(
    loadSsiNotifications.request,
    loadSsiNotificationFromAsyncStorage
  );
}
