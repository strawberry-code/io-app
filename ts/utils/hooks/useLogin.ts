/* eslint-disable no-console */
import { useState } from "react";
import { store } from "../../App";
import NetCode from "../../screens/ssi/NetCode";
import { idpSelected, loginSuccess } from "../../store/actions/authentication";
import { SessionToken } from "../../types/SessionToken";
import I18n from "../../i18n";
import { IdentityProvider } from "../../models/IdentityProvider";

const testIdp: IdentityProvider = {
  id: "test",
  name: "Test",
  logo: require("../../../img/spid.png"),
  entityID: "test-login",
  profileUrl: "",
  isTestIdp: true
};

// const testSessionToken: SessionToken = "ABCDEF12345";

export const useLogin = () => {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const loginUser = async (username: string, password: string) => {
    setModalVisible(true);
    setMessage(I18n.t("ssi.login.loadingMessage"));
    setIsLoading(true);

    try {
      const response = await NetCode.signIn(username, password);

      if (!response.access_token) {
        setIsLoading(false);
        setMessage(I18n.t("ssi.login.loginError"));
        setError(true);
        return;
      }

      setIsLoading(false);
      setMessage("You logged in Successfully");
      setMessage(I18n.t("ssi.login.success"));
      setSuccess(true);
      // NEED A TEST IDP OR THE APP WILL NOT LOGIN AND SAVE TOKEN
      store.dispatch(idpSelected(testIdp));
      store.dispatch(loginSuccess(response.access_token as SessionToken));

      setTimeout(() => {
        setModalVisible(false);
      }, 1000);
    } catch (e) {
      setMessage(I18n.t("ssi.login.loginError"));
      setIsLoading(false);
      setMessage("Login failed");
      setError(true);
    }
  };

  const hideModal = () => {
    setSuccess(false);
    setError(false);
    setModalVisible(false);
  };

  return {
    success,
    error,
    isLoading,
    message,
    loginUser,
    modalVisible,
    hideModal
  };
};
