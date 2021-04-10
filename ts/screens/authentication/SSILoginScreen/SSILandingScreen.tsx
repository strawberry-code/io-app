import React from "react";
import { Text, View, H1 } from "native-base";
import { StyleSheet, Image, Dimensions } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationScreenProps } from "react-navigation";

import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";

import variables from "../../../theme/variables";
import { IdentityProvider } from "../../../models/IdentityProvider";

import ROUTES from "../../../navigation/routes";
import { idpSelected } from "../../../store/actions/authentication";
import { navigateToIdpSelectionScreenAction } from "../../../store/actions/navigation";
import ContainerLanding from "./ContainerLanding";

const { width, height } = Dimensions.get("window");
export const SLIDE_HEIGHT = 0.61 * height;
export const BORDER_RADIUS = 75;

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black"
  },
  picture: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    // height: undefined,
    borderBottomRightRadius: BORDER_RADIUS,
    opacity: 0.3
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  titleText: {
    color: variables.colorWhite,
    paddingHorizontal: 20
  }
});

type Props = ReturnType<typeof mapDispatchToProps> & NavigationScreenProps;

const testIdp: IdentityProvider = {
  id: "test",
  name: "Test",
  logo: require("../../../../img/spid.png"),
  entityID: "test-login",
  profileUrl: "",
  isTestIdp: true
};

const SSILandingScreen: React.FC<Props> = ({ setSelectedIdp, navigation }) => {
  const goToLoginWithSpid = () => {
    setSelectedIdp(testIdp);
    navigation.navigate(ROUTES.AUTHENTICATION_IDP_LOGIN);
  };

  return (
    <View style={{ flex: 1 }}>
      <ContainerLanding
        buttonPrimary={
          <ButtonDefaultOpacity
            block
            lightText
            icon
            large
            delayPressIn={0}
            onPress={goToLoginWithSpid}
          >
            <Text>{I18n.t("authentication.landing.loginSpid")}</Text>
          </ButtonDefaultOpacity>
        }
      >
        <View style={styles.container}>
          <View style={styles.overlay}>
            <Image
              source={require("../../../../img/landing/regione-lombardia-palazzo.jpg")}
              style={styles.picture}
            />
          </View>
          <View style={[styles.titleContainer]}>
            <H1 style={styles.titleText}>{I18n.t("ssi.landing.title")}</H1>
          </View>
        </View>
      </ContainerLanding>
    </View>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToIdpSelection: () => dispatch(navigateToIdpSelectionScreenAction),
  setSelectedIdp: (idp: IdentityProvider) => dispatch(idpSelected(idp))
});

export default connect(undefined, mapDispatchToProps)(SSILandingScreen);
