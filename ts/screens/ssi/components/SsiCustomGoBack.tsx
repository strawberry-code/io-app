import IconFont from "../../../components/ui/IconFont";
import variables from "../../../theme/variables";
import {TouchableHighlight} from "react-native";
import * as React from "react";

function SsiCustomGoBack(props: any) {
  return <TouchableHighlight onPress={() => {
    props.cb()
  }}>
    <IconFont name={"io-back"} style={{color: variables.colorBlack}}/>
  </TouchableHighlight>
}

export {SsiCustomGoBack}
