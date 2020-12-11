import React, { useState, useRef } from "react";
import _ from "lodash";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity
} from "react-native";

import variables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";

interface Props {
  issuer: {
    [param: string]: string;
  };
}

const IssuerComponent: React.FC<Props> = ({ issuer }) => {
  const [visible, setVisible] = useState<"none" | "flex">("none");

  const handleOpen = () => {
    if (visible === "none") setVisible("flex");
    else setVisible("none");
  };

  return (
    <View style={styles.issuerContainer}>
      <View style={styles.issuerTitleContainer}>
        <Text style={styles.issuerTitle}>
          Issuer:{" "}
          {Object.keys(issuer).length === 1 ? (
            <IconFont name="io-notice" color={variables.brandDanger} />
          ) : (
            <Text>{issuer.tradeName}</Text>
          )}
        </Text>
        <TouchableOpacity onPress={handleOpen}>
          <IconFont name="io-plus" color={variables.brandPrimary} />
        </TouchableOpacity>
      </View>
      <View style={{ display: visible }}>
        {Object.keys(issuer).length <= 1 && (
          <Text style={styles.issuerInfo}>Firmatario Sconosciuto</Text>
        )}
        {Object.keys(issuer).length > 1 &&
          Object.keys(issuer).map(field => (
            <>
              <Text style={styles.issuerInfo}>{_.startCase(field)}</Text>
              <Text>{issuer[field]}</Text>
            </>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  issuerContainer: {
    backgroundColor: variables.colorWhite,
    borderRadius: 5,
    padding: 10,
    shadowColor: "black",
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 1,
    shadowRadius: 5
  },
  issuerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  issuerTitle: {
    fontSize: variables.h4FontSize,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "600" : "normal"
  },
  issuerInfo: {
    fontSize: variables.h5FontSize,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular"
  }
});

export default IssuerComponent;
