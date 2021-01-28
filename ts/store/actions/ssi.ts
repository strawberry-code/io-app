import { ActionType, createStandardAction } from "typesafe-actions";

export const addNewAssetList = createStandardAction("ADD_NEW_ASSET_LIST")<
  Array<any>
>();

export const selectAsset = createStandardAction("SELECT_ASSET")<string>();

export type SSIActions =
  | ActionType<typeof addNewAssetList>
  | ActionType<typeof selectAsset>;
