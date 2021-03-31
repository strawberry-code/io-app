import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View, Button } from "native-base";
import * as React from "react";
import { Image, StyleSheet, Modal } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import brokenLinkImage from "../../../img/broken-link.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import {
  loginFailure,
  AccessAndRefreshToken,
  refreshAuthenticationGrantToken,
  refreshAuthenticationTokens
} from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isRefreshing,
  sessionTokenSelector,
  isLoggedInAndRefreshingTokens,
  isLoggedInAndRefreshingGrantToken
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";
import { SessionToken } from "../../types/SessionToken";
import { onLoginUriChanged, getToken } from "../../utils/login";
import { getUrlBasepath } from "../../utils/url";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

type State = {
  requestState: pot.Pot<true, ErrorType>;
  loginUri: string;
  errorCode?: string;
  loginTrace?: string;
};

const loginFailureTag = "spid-login-failure";

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 10
  },
  errorBody: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center"
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  },
  flex2: {
    flex: 2
  }
});

class GrantTokenModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      requestState: pot.noneLoading,
      loginUri: `https://api.lispa.it/lispaauthenticationendpoint/authpin.do?redirect_uri=http://localhost&friendlyName=SISSMobile&Authorization=${props.accessToken}`
    };
  }

  componentDidMount() {
    console.log("MOUNTED GRANT TOKEN MODAL", this.state.loginUri);
    this.updateUrl(
      `https://api.lispa.it/lispaauthenticationendpoint/authpin.do?redirect_uri=http://localhost&friendlyName=SISSMobile&Authorization=${this.props.accessToken}`
    );
  }

  private updateLoginTrace = (url: string): void => {
    this.setState({ loginTrace: url });
  };

  private updateUrl = (url: string): void => {
    this.setState({ loginUri: url });
  };

  private handleLoadingError = (): void => {
    this.setState({
      requestState: pot.noneError(ErrorType.LOADING_ERROR)
    });
  };

  private handleLoginFailure = (errorCode?: string) => {
    this.props.dispatchLoginFailure(
      new Error(`login failure with code ${errorCode || "n/a"}`)
    );
    this.setState({
      requestState: pot.noneError(ErrorType.LOGIN_ERROR),
      errorCode
    });
  };

  private handleLoginSuccess = (grantToken: SessionToken) => {
    this.props.dispatchRefreshGrantToken(grantToken);
  };

  private handleGettingSessionTokens = async (authorizationCode: {
    code: string;
    state: string;
  }) => {
    try {
      const tokensInfo = await getToken(authorizationCode);
      this.props.dispatchRefreshGrantToken(tokensInfo);
      this.updateUrl(
        `https://api.lispa.it/lispaauthenticationendpoint/authpin.do?redirect_uri=http://localhost&friendlyName=SISSMobile&Authorization=${tokensInfo.access_token}`
      );
    } catch (error) {
      console.log("Could not add session tokens", error);
    }
  };

  private setRequestStateToLoading = (): void =>
    this.setState({ requestState: pot.noneLoading });

  private handleNavigationStateChange = (event: WebViewNavigation): void => {
    console.log(event.url);
    if (event.url) {
      const urlChanged = getUrlBasepath(event.url);
      if (urlChanged !== this.state.loginTrace) {
        this.updateLoginTrace(urlChanged);
      }
    }

    const isAssertion = fromNullable(event.url).fold(
      false,
      s => s.indexOf("/assertionConsumerService") > -1
    );
    this.setState({
      requestState:
        event.loading || isAssertion ? pot.noneLoading : pot.some(true)
    });
  };

  private handleShouldStartLoading = (event: WebViewNavigation): boolean => {
    const isLoginUrlWithToken = onLoginUriChanged(
      this.handleLoginFailure,
      this.handleGettingSessionTokens,
      this.handleLoginSuccess
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  private renderMask = () => {
    if (pot.isLoading(this.state.requestState)) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      );
    } else if (pot.isError(this.state.requestState)) {
      const errorType = this.state.requestState.error;
      const errorTranslationKey = `authentication.errors.spid.error_${this.state.errorCode}`;

      return (
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <Text style={styles.errorTitle} bold={true}>
            {I18n.t(
              errorType === ErrorType.LOADING_ERROR
                ? "authentication.errors.network.title"
                : "authentication.errors.login.title"
            )}
          </Text>

          {errorType === ErrorType.LOGIN_ERROR && (
            <Text style={styles.errorBody}>
              {I18n.t(errorTranslationKey, {
                defaultValue: I18n.t("authentication.errors.spid.unknown")
              })}
            </Text>
          )}

          <View style={styles.errorButtonsContainer}>
            <ButtonDefaultOpacity
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              onPress={this.setRequestStateToLoading}
              style={styles.flex2}
              block={true}
              primary={true}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </ButtonDefaultOpacity>
          </View>
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  public render() {
    const {
      loggedInAndRefreshingTokens,
      loggedInAndRefreshingGrantToken,
      loggedInAuth
    } = this.props;
    const hasError = pot.isError(this.state.requestState);

    if (loggedInAuth) {
      return (
        <Modal>
          <IdpSuccessfulAuthentication />
        </Modal>
      );
    }

    if (!loggedInAndRefreshingTokens && !loggedInAndRefreshingGrantToken) {
      // This condition will be true only temporarily (if the navigation occurs
      // before the redux state is updated succesfully)
      return (
        <Modal>
          <LoadingSpinnerOverlay isLoading={true} />
        </Modal>
      );
    }

    const { loginUri } = this.state;

    return (
      <Modal>
        {!hasError && (
          <>
            <WebView
              textZoom={100}
              source={{ uri: loginUri }}
              onError={this.handleLoadingError}
              javaScriptEnabled={true}
              onNavigationStateChange={this.handleNavigationStateChange}
              onShouldStartLoadWithRequest={this.handleShouldStartLoading}
            />
          </>
        )}
        <Button
          onPress={() => {
            this.dispatchRefreshTokens({
              access_token: "NO_SPID_LOGIN",
              refresh_token: "NO_SPID_LOGIN",
              expires_in: 60
            });
            this.handleLoginSuccess("NO_SPID_LOGIN" as SessionToken);
          }}
        >
          <Text>Grant Token Accettato</Text>
        </Button>
        {this.renderMask()}
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  loggedInAndRefreshingGrantToken: isLoggedInAndRefreshingGrantToken(
    state.authentication
  ),
  loggedInAndRefreshingTokens: isLoggedInAndRefreshingTokens(
    state.authentication
  ),
  loggedInAuth:
    isLoggedIn(state.authentication) && !isRefreshing(state.authentication),
  accessToken: sessionTokenSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchRefreshGrantToken: (token: SessionToken) =>
    dispatch(refreshAuthenticationGrantToken(token)),
  dispatchRefreshTokens: (accessAndRefreshToken: AccessAndRefreshToken) =>
    dispatch(refreshAuthenticationTokens(accessAndRefreshToken)),
  dispatchLoginFailure: (error: Error) => dispatch(loginFailure(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(GrantTokenModal);
