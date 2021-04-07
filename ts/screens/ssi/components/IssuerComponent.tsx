/* eslint-disable no-console */
import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator
} from "react-native";
import { connect } from "react-redux";

import variables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import {
  sessionTokenSelector,
  grantTokenSelector
} from "../../../store/reducers/authentication";
import { TranslationKeys } from "../../../../locales/locales";
import { DidSingleton } from "../../../types/DID";
import { apiSSIPrefix } from "../../../config";
import { IssuerInfo, IssuerInfoKeys } from "../types";
import { GlobalState } from "../../../store/reducers/types";

interface OwnProps {
  issuer: string | undefined | { id: string };
}

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

const IssuerComponent: React.FC<Props> = ({
  issuer,
  sessionToken,
  grantToken
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<"none" | "flex">("none");
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | undefined>(
    undefined
  );

  // const testSuccessIssuerId =
  //   "did:ethr:0x6968F2E335eF8ba1ee240023b91AA426707FF6cE";
  const issuerId = issuer?.id ? issuer.id : issuer;

  if (issuerId === DidSingleton.getDidAddress()) {
    return null;
  }

  useEffect(() => {
    const fetchIssuerInfo = async (id: string): Promise<void> => {
      setIsLoading(true);
      try {
        const issuerAddress = id.replace("did:ethr:", "");
        const response = await fetch(
          `${apiSSIPrefix}/issuers/${issuerAddress}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              AuthorizationGrant: `Bearer ${grantToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log("response stats from get fetchIssuer", response.status);
        console.log("response from get fetchIssuer", response);

        if (response.status === 204) {
          throw new Error("Unknown Issuer");
        }

        if (response.status === 404) {
          throw new Error("No matching resource found for given API");
        }

        if (response.status === 401) {
          throw new Error(`${JSON.stringify(await response.json())}`);
        }

        if (response.status !== 200) {
          throw new Error(`${JSON.stringify(await response.json())}`);
        }

        const data = await response.json();

        console.log("data from get fetchIssuer", data);
        setIssuerInfo(data);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    if (!issuerId) {
      setIssuerInfo(undefined);
      setIsLoading(false);
      return;
    }
    void fetchIssuerInfo(issuerId);
  }, [issuerId]);

  const handleOpen = () => {
    if (visible === "none") {
      setVisible("flex");
    } else {
      setVisible("none");
    }
  };

  const fieldElement = issuerInfo
    ? [...Object.keys(issuerInfo)].reverse().map(field => {
        if (field === "name" || field === "did") {
          return null;
        }

        if (
          issuerInfo[field as IssuerInfoKeys].startsWith("https://") ||
          issuerInfo[field as IssuerInfoKeys].startsWith("http://")
        ) {
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
                onPress={() =>
                  Linking.openURL(issuerInfo[field as IssuerInfoKeys])
                }
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
            <Text style={styles.issuerInfo}>
              {issuerInfo[field as IssuerInfoKeys]}
            </Text>
          </View>
        );
      })
    : undefined;

  const nameToShow = issuerInfo
    ? issuerInfo?.name.length >= 18
      ? issuerInfo.name.substr(0, 16) + "..."
      : issuerInfo.name
    : "";

  return (
    <View style={styles.issuerContainer}>
      <View style={styles.issuerTitleContainer}>
        <Text style={styles.issuerTitle}>
          Issuer:{" "}
          {isLoading && <ActivityIndicator color={variables.brandPrimary} />}
          {!isLoading && !issuerInfo && (
            <IconFont name="io-notice" color={variables.brandDanger} />
          )}
          {!isLoading && Boolean(issuerInfo) && <Text>{nameToShow}</Text>}
        </Text>
        <TouchableOpacity onPress={handleOpen}>
          <IconFont name="io-plus" color={variables.brandPrimary} />
        </TouchableOpacity>
      </View>
      <View style={{ display: visible }}>
        {!issuerInfo && (
          <Text style={styles.issuerInfo}>{I18n.t("ssi.issuer.unknown")}</Text>
        )}
        {fieldElement}
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

const mapStateToProps = (state: GlobalState) => ({
  sessionToken: sessionTokenSelector(state),
  grantToken: grantTokenSelector(state)
});

export default connect(mapStateToProps)(IssuerComponent);
