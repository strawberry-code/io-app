import { Effect, put, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { navigateToOnboardingDIDScreenAction } from "../../store/actions/navigation";
import { createDIDSuccess } from "../../store/actions/didset";

export function* checkConfiguredDIDSaga(): Generator<Effect, any> {
  // Go through the DID Onboarding Screen configuration screen
  yield put(navigateToOnboardingDIDScreenAction);

  // and block until a DID was set
  yield take(getType(createDIDSuccess));
}
