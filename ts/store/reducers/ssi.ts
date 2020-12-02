/**
 * A reducer for the SSI
 */
import { getType } from "typesafe-actions";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type SSIState = {
  ssiAssetList: Array<any>;
  assetSelected: string;
};

const INITIAL_STATE: SSIState = {
  ssiAssetList: [],
  assetSelected: ""
};

const reducer = (state: SSIState = INITIAL_STATE, action: Action): SSIState => {
  switch (action.type) {
    case "ADD_NEW_ASSET_LIST":
      return {
        ...state,
        ssiAssetList: action.payload
      };
    case "SELECT_ASSET":
      return {
        ...state,
        assetSelected: action.payload
      };

    default:
      return state;
  }
};

export default reducer;
