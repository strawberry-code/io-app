import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  FlatList,
  Alert
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationScreenProps } from "react-navigation";
import PushNotification from "react-native-push-notification";

import { GlobalState } from "../../store/reducers/types";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";
import StyledIconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import {
  acceptSsiNotification,
  clearSsiNotifications,
  loadSsiNotifications,
  refuseSsiNotification
} from "../../store/actions/notifications";
import { getSsiNotifications } from "../../store/reducers/notifications/ssiNotifications";
import { navigateToVCsList } from "../../store/actions/navigation";
import VCstore from "./VCstore";
import SingleVCInfoModal from "./components/SingleVCInfoModal";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationScreenProps;

const SsiNotificationScreen: React.FC<Props> = ({
  loadSsiNotifications,
  clearSsiNotifications,
  notifications,
  acceptNotification,
  refuseNotification,
  goToVerifiableCredetials
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    PushNotification.cancelAllLocalNotifications();
  });

  const toggleCredentials = () => setModalVisible(!modalVisible);

  const handleAcceptCredential = (id: number, VPjwt: string) => {
    Alert.alert(
      "Salvando nuova credenziale",
      "Sicuro di voler salvare questa credenziale?",
      [
        {
          text: "Salva",
          onPress: async () => {
            acceptNotification(id);
            await VCstore.storeVC(VPjwt);
            goToVerifiableCredetials();
            return true;
          }
        },
        {
          text: "Indietro",
          style: "destructive",
          onPress: undefined
        }
      ],
      { cancelable: true }
    );
  };

  const handleRefuseCredential = (id: number) => {
    Alert.alert(
      "Eliminando Notifica",
      "Sicuro di voler non accettare questa credenziale?",
      [
        {
          text: "Rifiuta",
          onPress: () => {
            refuseNotification(id);
            return true;
          }
        },
        {
          text: "Indietro",
          style: "destructive",
          onPress: undefined
        }
      ],
      { cancelable: true }
    );
  };

  const renderNotifications = ({ item }) => {
    console.log("ITEM", item);
    const vpDecoded = item ? VCstore.decodeJwt(item.VPjwt) : null;
    console.log("vp decodificato:", vpDecoded);
    const issuer = vpDecoded.iss;
    const vc = vpDecoded.vp.verifiableCredential[0];
    const vCredential = vc ? VCstore.decodeJwt(vc) : null;

    const { iat, exp, vc: credentialInfo } = vCredential;
    const dateInfo = { iat, exp };

    return (
      <View style={styles.notificationContainer}>
        <View style={styles.topNotification}>
          <Text style={styles.sender}>{/* sDa: Regione Lombardia */}</Text>
          <Text>
            {new Date(item?.date).toLocaleString() ||
              new Date().toLocaleString()}
          </Text>
        </View>
        <View style={styles.textBox}>
          <NotificationTitle type={credentialInfo.type[1]} />
          <TouchableOpacity onPress={toggleCredentials}>
            <StyledIconFont name="io-right" color={variables.brandPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.notificationQuestion}>Accetti la credenziale?</Text>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => handleAcceptCredential(item.id, item.VPjwt)}
          >
            <Text style={styles.button}>Accetta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRefuse}
            onPress={() => handleRefuseCredential(item.id)}
          >
            <Text style={styles.buttonRefuseText}>Rifiuta</Text>
          </TouchableOpacity>
        </View>
        <SingleVCInfoModal
          visible={modalVisible}
          credentialInfo={credentialInfo}
          dateInfo={dateInfo}
          changeVisibility={setModalVisible}
          toggleCredentials={toggleCredentials}
          issuer={issuer}
        />
      </View>
    );
  };

  return (
    <TopScreenComponent
      accessibilityLabel={"Notifiche Credenziali"}
      headerTitle="Wallet"
      goBack={true}
    >
      <Text
        style={{
          fontSize: variables.h1FontSize,
          fontFamily:
            Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
          paddingLeft: 20,
          paddingVertical: 20,
          backgroundColor: variables.brandPrimary,
          color: variables.colorWhite
        }}
      >
        Notifiche
      </Text>

      <FlatList
        ListEmptyComponent={() => (
          <Text style={{ padding: 20 }}>Ancora nessuna notifica</Text>
        )}
        data={notifications}
        renderItem={renderNotifications}
        ItemSeparatorComponent={() => <ItemSeparatorComponent />}
      />
    </TopScreenComponent>
  );
};

const NotificationTitle: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case "CartaIdentita":
      return (
        <Text style={styles.notificationTitle}>
          {I18n.t("ssi.singleVC.types.CartaIdentita")}
        </Text>
      );
    case "DimensioneImpresa":
      return (
        <Text style={styles.notificationTitle}>
          {I18n.t("ssi.singleVC.types.DimensioneImpresa")}
        </Text>
      );
    default:
      return (
        <Text style={styles.notificationTitle}>Credenziale Sconosciuta</Text>
      );
  }
};

const styles = StyleSheet.create({
  notificationContainer: {
    padding: 20
  },
  topNotification: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sender: {
    fontSize: variables.fontSizeBase,
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular"
    // fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
  },
  textBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  notificationTitle: {
    fontFamily: Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Bold",
    fontWeight: Platform.OS === "ios" ? "bold" : "normal",
    fontSize: variables.fontSize2
  },
  notificationQuestion: {
    marginBottom: 10,
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    fontSize: variables.fontSize1
  },
  buttonsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonContainer: {
    backgroundColor: variables.brandPrimary,
    width: "35%",
    paddingVertical: 3,
    borderRadius: 5
  },
  buttonRefuse: {
    borderWidth: 1,
    borderColor: variables.brandPrimary,
    backgroundColor: variables.colorWhite,
    width: "35%",
    paddingVertical: 3,
    borderRadius: 5
  },
  buttonRefuseText: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    color: variables.brandPrimary,
    fontSize: variables.fontSize1,
    textAlign: "center"
  },
  button: {
    fontFamily:
      Platform.OS === "ios" ? "Titillium Web" : "TitilliumWeb-Regular",
    color: variables.colorWhite,
    fontSize: variables.fontSize1,
    textAlign: "center"
  }
});

const mapStateToProps = (state: GlobalState) => ({
  notifications: getSsiNotifications(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadSsiNotifications: () => dispatch(loadSsiNotifications.request()),
  clearSsiNotifications: () => dispatch(clearSsiNotifications()),
  acceptNotification: (id: number) => dispatch(acceptSsiNotification(id)),
  refuseNotification: (id: number) => dispatch(refuseSsiNotification(id)),
  goToVerifiableCredetials: () => dispatch(navigateToVCsList())
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SsiNotificationScreen);
