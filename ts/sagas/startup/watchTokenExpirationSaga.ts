/**
 * this saga checks at regular intervals if token is expired
 */
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  call,
  Effect,
  fork,
  takeLatest,
  put,
  select
} from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { addSeconds, isAfter } from "date-fns";
import {
  tokenExpirationSelector,
  refreshTokenSelector,
  sessionTokenSelector,
  isRefreshingGrantTokenSelector
} from "../../store/reducers/authentication";
import {
  AccessAndRefreshToken,
  startRefreshingTokens,
  refreshAuthenticationTokens,
  sessionExpired
} from "../../store/actions/authentication";
import { startTimer } from "../../utils/timer";
import { refreshSessionFromRefreshToken } from "../../utils/login";
import { SessionToken } from "../../types/SessionToken";
import { startApplicationInitialization } from "../../store/actions/application";

const CHECK_TOKEN_EXPIRATION_INTERVAL = (5 * 1000) as Millisecond;

/**
 * this saga requests and checks in loop token expiration date
 * if some of them is critical app could show a warning message or avoid
 * the whole usage.
 */
function* getNewTokensInfo(refreshToken: SessionToken) {
  try {
    const response: AccessAndRefreshToken = yield call(
      refreshSessionFromRefreshToken,
      refreshToken
    );
    // const response = true;

    if (!response) {
      // error during getting refreshing token and so we need to restart application
      throw new Error("Api Manager could not refresh tokens Session Expired");
    }

    // TESTING
    // const sessionToken: SessionToken = yield select(sessionTokenSelector);

    // yield put(
    //   refreshAuthenticationTokens({
    //     access_token: sessionToken,
    //     refresh_token: "NO_SPID_LOGIN" as SessionToken,
    //     expires_in: 60
    //   })
    // );

    yield put(refreshAuthenticationTokens(response));
  } catch (error) {
    console.log("AN ERROR OCCURRED", error);
    yield put(sessionExpired());
  }
}

export function* watchTokenExpirationSaga() {
  // check periodically tokens expiration date

  while (true) {
    const expirationDate: Date = yield select(tokenExpirationSelector);
    const isRefreshingGrantToken: boolean = yield select(
      isRefreshingGrantTokenSelector
    );
    const now = new Date();
    console.log("COMPARO", now, expirationDate);
    if (isAfter(now, expirationDate) && !isRefreshingGrantToken) {
      const refreshToken: SessionToken = yield select(refreshTokenSelector);

      // change authentication State to show Grant Token Modal and retrieve it
      yield put(startRefreshingTokens());

      // getting new access_token and refresh_token and expiration date
      yield call(getNewTokensInfo, refreshToken);
    }

    // INTERVAL TIMER for checking if token is expired
    yield call(startTimer, CHECK_TOKEN_EXPIRATION_INTERVAL);
  }
}
