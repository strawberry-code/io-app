import { Action, combineReducers } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getValue } from "../../../model/RemoteValue";
import bpdActivationReducer, { BpdActivation } from "./activation";

export type BdpDetailsState = {
  activation: BpdActivation;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  activation: bpdActivationReducer
});

export const bpdActivationSelector = (state: GlobalState): BpdActivation =>
  state.bonus.bpd.details.activation;

/**
 * In order to know if the bpd program is enabled for the user
 * @param state
 */
export const bpdEnabledForUserSelector = (
  state: GlobalState
): boolean | undefined => getValue(state.bonus.bpd.details.activation.enabled);

export default bpdDetailsReducer;