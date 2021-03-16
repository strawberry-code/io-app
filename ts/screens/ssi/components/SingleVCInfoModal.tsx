import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform
} from "react-native";
import { format, parse } from "date-fns";

import { TranslationKeys } from "../../../../locales/locales";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import IconFont from "../../../components/ui/IconFont";

import { VCType } from "../SsiSingleVC";
import IssuerComponent from "./IssuerComponent";

interface Props {
  credentialInfo: VCType["vc"];
  dateInfo: {
    iat: VCType["iat"];
    exp: VCType["exp"];
  };
  visible: boolean;
  toggleCredentials: () => void;
  changeVisibility: (value: boolean) => void;
  isSigning?: boolean;
  signRequest?: () => void;
  backHome: () => void;
  closeAll: () => void;
  issuer: string | { id: string } | undefined;
}

const SingleVCInfoModal: React.FC<Props> = ({
  credentialInfo,
  dateInfo,
  visible,
  isSigning,
  toggleCredentials,
  changeVisibility,
  signRequest,
  backHome,
  closeAll,
  issuer
}) => {
  const { credentialSubject, type } = credentialInfo;

  const handleBackButton = () => {
    if (isSigning) {
      closeAll();
    } else {
      changeVisibility(false);
    }
  };

  const dateInfoElements = Object.keys(dateInfo).map(field => {
    if (!dateInfo[field]) {
      return null;
    }

    const dateObject = new Date(dateInfo[field] * 1000);
    const dateString = format(dateObject, "DD/MM/YYYY");

    return (
      <>
        <Text style={vcItem.modalDescription}>
          {I18n.t(`ssi.singleVC.fields.${field}` as TranslationKeys)}:{" "}
        </Text>
        <Text style={vcItem.modalInfo}>{dateString}</Text>
      </>
    );
  });

  const fieldsElement = Object.keys(credentialSubject).map(field => {
    if (field === "id") {
      return null;
    }

    const fieldName = I18n.t(
      `ssi.singleVC.fields.${field}` as TranslationKeys
    ).startsWith("[missing")
      ? field.charAt(0).toUpperCase() + field.slice(1)
      : I18n.t(`ssi.singleVC.fields.${field}` as TranslationKeys);

    const fieldData =
      !isNaN(new Date(credentialSubject[field])) &&
      field !== "valore" &&
      field !== "value"
        ? format(parse(credentialSubject[field]), "DD/MM/YYYY")
        : credentialSubject[field];

    return (
      <>
        <Text style={vcItem.modalDescription}>{fieldName}: </Text>
        <Text style={vcItem.modalInfo}>{fieldData}</Text>
      </>
    );
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleBackButton}
    >
      <ScrollView>
        <View style={vcItem.modalHeader}>
          <TouchableOpacity onPress={isSigning ? closeAll : toggleCredentials}>
            <IconFont
              name="io-close"
              color={variables.colorWhite}
              size={30}
              style={vcItem.modalCloseButton}
            />
          </TouchableOpacity>
          <SingleVCModalHeader type={type} />
          {isSigning && (
            <Text style={vcItem.signingTitle}>
              {I18n.t("ssi.signReqScreen.saveQuestion")}
            </Text>
          )}
        </View>
        <View style={vcItem.modalBody}>
          {!isSigning && <IssuerComponent issuer={issuer} />}
          {fieldsElement}
          {dateInfoElements}
        </View>
      </ScrollView>
      {isSigning && (
        <View style={vcItem.signButtonsRow}>
          <TouchableOpacity
            style={[button.container, button.marginRight]}
            onPress={() => {
              changeVisibility(false);
              if (signRequest) {
                signRequest();
              }
            }}
          >
            <Text style={button.text}>
              {I18n.t("ssi.signReqScreen.acceptButton")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              button.container,
              { backgroundColor: variables.brandDanger }
            ]}
            onPress={backHome}
          >
            <Text style={button.text}>
              {I18n.t("ssi.signReqScreen.declineButton")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};

interface HeaderProps {
  type: VCType["vc"]["type"];
}

const SingleVCModalHeader: React.FC<HeaderProps> = ({ type }) => {
  switch (type[1]) {
    case "CartaIdentita":
      return <Text style={vcItem.modalTitle}>Carta d'identità</Text>;
    case "DimensioneImpresa":
      return <Text style={vcItem.modalTitle}>Dimensione Impresa</Text>;
    default:
      return <Text style={vcItem.modalTitle}>{type[1]}</Text>;
  }
};

const vcItem = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 20
  },
  modalHeader: {
    backgroundColor: variables.brandPrimary,
    padding: 20
  },
  modalCloseButton: {
    marginTop: 30
  },
  modalTitle: {
    marginTop: 50,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "bold" : "normal",
    fontSize: variables.h1FontSize,
    color: variables.colorWhite
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  modalDescription: {
    fontSize: variables.h3FontSize,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "bold" : "normal"
  },
  modalInfo: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    fontSize: variables.h4FontSize,
    marginBottom: 10
  },
  signingTitle: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "bold" : "normal",
    fontSize: variables.h4FontSize,
    color: variables.colorWhite
  },
  signButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#E6E9F2",
    padding: 10
  },
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

const button = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: "50%",
    backgroundColor: variables.brandPrimary,
    justifyContent: "center",
    borderRadius: 5
  },
  text: {
    fontSize: variables.h5FontSize,
    color: variables.colorWhite,
    textAlign: "center"
  },
  marginRight: {
    marginRight: 5
  }
});

export default SingleVCInfoModal;
