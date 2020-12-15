import React, { useState, useRef } from "react";
import _ from "lodash";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking
} from "react-native";

import variables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { TranslationKeys } from "../../../../locales/locales";
import { DidSingleton } from "../../../types/DID";

interface Props {
  issuer: {
    [param: string]: string;
  };
}

const IssuerComponent: React.FC<Props> = ({ issuer }) => {
  const [visible, setVisible] = useState<"none" | "flex">("none");

  if (issuer.id === DidSingleton.getDidAddress()) return null;

  const handleOpen = () => {
    if (visible === "none") setVisible("flex");
    else setVisible("none");
  };

  const fieldElement = Object.keys(issuer).map(field => {
    if (field === "id") return null;

    if (field === "informationUri") {
      return (
        <View
          style={[
            styles.issuerField,
            { flexDirection: "row", alignItems: "center" }
          ]}
        >
          <Text style={styles.issuerFieldText}>
            {I18n.t(`ssi.issuer.fields.${field}` as TranslationKeys)}
          </Text>
          <TouchableOpacity
            style={styles.issuerInfoLink}
            onPress={() => Linking.openURL(issuer[field])}
          >
            <Text style={styles.issuerFieldTextLink}>
              {I18n.t("ssi.linkText")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={field} style={styles.issuerField}>
        <Text style={styles.issuerFieldText}>
          {I18n.t(`ssi.issuer.fields.${field}` as TranslationKeys)}
        </Text>
        <Text style={styles.issuerInfo}>{issuer[field]}</Text>
      </View>
    );
  });

  return (
    <View style={styles.issuerContainer}>
      <View style={styles.issuerTitleContainer}>
        <Text style={styles.issuerTitle}>
          Issuer:{" "}
          {Object.keys(issuer).length === 1 ? (
            <IconFont name="io-notice" color={variables.brandDanger} />
          ) : (
            <Text>
              {issuer.tradeName.length >= 18
                ? issuer.tradeName.substr(0, 16) + "..."
                : issuer.tradeName}
            </Text>
          )}
        </Text>
        <TouchableOpacity onPress={handleOpen}>
          <IconFont name="io-plus" color={variables.brandPrimary} />
        </TouchableOpacity>
      </View>
      <View style={{ display: visible }}>
        {Object.keys(issuer).length <= 1 && (
          <Text style={styles.issuerInfo}>{I18n.t("ssi.issuer.unknown")}</Text>
        )}
        {Object.keys(issuer).length > 1 && fieldElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  issuerContainer: {
    marginBottom: 5,
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
  issuerField: {
    marginBottom: 5
  },
  issuerFieldText: {
    fontSize: variables.h5FontSize,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.brandPrimary
  },
  issuerFieldTextLink: {
    fontSize: variables.fontSizeBase,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-SemiBold",
    fontWeight: Platform.OS === "ios" ? "500" : "normal",
    color: variables.colorWhite
  },
  issuerInfo: {
    fontSize: variables.fontSizeBase,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular"
  },
  issuerInfoLink: {
    backgroundColor: "#003354",
    marginLeft: 5,
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 5
  }
});

export default IssuerComponent;
