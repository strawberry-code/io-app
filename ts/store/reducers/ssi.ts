/**
 * A reducer for the SSI
 */
import { getType } from "typesafe-actions";
import { addNewAssetList, selectAsset } from "../actions/ssi";
import { Action } from "../actions/types";

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
    case getType(addNewAssetList):
      return {
        ...state,
        ssiAssetList: action.payload
      };
    case getType(selectAsset):
      return {
        ...state,
        assetSelected: action.payload
      };

    default:
      return state;
  }
};

export default reducer;
