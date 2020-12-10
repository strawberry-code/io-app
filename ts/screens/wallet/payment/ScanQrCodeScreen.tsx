/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import {AmountInEuroCents, RptId} from "italia-pagopa-commons/lib/pagopa";
import {ITuple2} from "italia-ts-commons/lib/tuples";
import {Container, Text, View} from "native-base";
import * as React from "react";
import {Alert, Dimensions, ScrollView, StyleSheet} from "react-native";
// @ts-ignore
import EthrDID from 'ethr-did'

import ImagePicker from "react-native-image-picker";
import * as ReaderQR from "react-native-lewin-qrcode";
import QRCodeScanner from "react-native-qrcode-scanner";
import {NavigationEvents, NavigationInjectedProps} from "react-navigation";
import {connect} from "react-redux";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent, {ContextualHelpPropsMarkdown} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import {CameraMarker} from "../../../components/wallet/CameraMarker";

import I18n from "../../../i18n";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen, navigateToShareVCsList,
  navigateToSsiHome, navigateToSsiSignReq, navigateToVCsList,
  navigateToWalletHome,
  navigateToSsiWalletSendScreen
} from "../../../store/actions/navigation";
import {Dispatch} from "../../../store/actions/types";
import {paymentInitializeState} from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import {ComponentProps} from "../../../types/react";
import {openAppSettings} from "../../../utils/appSettings";
import {decodePagoPaQrCode} from "../../../utils/payment";
import {showToast} from "../../../utils/showToast";
import {DidSingleton} from "../../../types/DID";
import {SsiSignReqOld} from '../../ssi/SsiSignReq'
import 'text-encoding-polyfill'
import {createVerifiableCredentialJwt, Issuer, JwtCredentialPayload} from "did-jwt-vc";

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  scanningState: ComponentProps<typeof CameraMarker>["state"];
  isFocused: boolean;
};

const screenWidth = Dimensions.get("screen").width;
const cameraTextOverlapping = 20;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  white: {
    backgroundColor: variables.brandPrimaryInverted
  },

  bottomText: {
    textAlign: "center",
    paddingTop: cameraTextOverlapping
  },

  content: {
    backgroundColor: variables.colorWhite,
    marginTop: -cameraTextOverlapping,
    zIndex: 1
  },

  cameraContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  button: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -cameraTextOverlapping,
    width: screenWidth - variables.contentPadding * 2,
    backgroundColor: variables.colorWhite,
    zIndex: 999
  },

  camera: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    height: screenWidth,
    width: screenWidth
  },

  notAuthorizedContainer: {
    padding: variables.contentPadding,
    flex: 1,
    alignItems: "center"
  },
  notAuthorizedText: {
    textAlign: "justify",
    marginBottom: 25
  },
  notAuthorizedBtn: {
    flex: 1,
    alignSelf: "center"
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 4000;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};

class ScanQrCodeScreen extends React.Component<Props, State> {
  private scannerReactivateTimeoutHandler?: number;
  private goBack = () => this.props.navigation.goBack();
  private qrCodeScanner = React.createRef<QRCodeScanner>();

  componentDidMount() {
    this.handleDidFocus()
  }

  /**
   * Handles valid pagoPA QR codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.setState({
      scanningState: "VALID"
    });
    this.props.runPaymentTransactionSummarySaga(data.e1, data.e2);
  };

  /**
   * Handles SSI QR to make signature request
   */
  private onSsiSignReq = async (data: string) => {
    console.log("scansionato codice QR SSI per creazione VC");

    this.setState({
      scanningState: "VALID"
    });

    //  let SignRequestHandler: SsiSignReqOld = new SsiSignReqOld(data)
    //  SignRequestHandler.handleRequest()

    console.log('navigo verso SSI_SIGNREQ')
    //this.props.navigation.navigate('SSI_WALLET_RECEIVE_SCREEN')

    // action: variabile fittizia che suggerisce la prossima azione da fare
    // data: oggetto JSON che rappresenta i dati del QR Code parsati
    this.props.navigateToSsiSignReq({action: "signRequest", data: JSON.parse(data)});


    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);
  };

  /**
   * Handles SSI QR to share verified credential
   */
  private onSsiShareReq = async (data: string) => {
    console.log("scansionato codice QR SSI per condividere VC");

    this.setState({
      scanningState: "VALID"
    });

    let qrData = JSON.parse(data)

    this.props.navigateToShareVCsList({action: "shareVCfromQR", data: qrData});

    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);

    //this.props.navigateToScannedSsiQrCode();
  };

  /**
   * Handles SSI QR to save a verified credential in the device store
   */
  private onSsiIssuedVc = async (data: string) => {
    console.log("scansionato codice QR SSI per salvare VC nello store");

    this.setState({
      scanningState: "VALID"
    });

    let qrData = JSON.parse(data)
    let jwt = qrData.verifiableCredential

    console.log('jwt X: ' + jwt)

    this.props.navigateToVCsList({action: "saveVCinTheStore", data: jwt});

    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);
    //this.props.navigateToScannedSsiQrCode();
  };

  private handleSsiWalletRecipientScan(data: string) {
      this.props.navigateToSsiWalletSendScreen({
        action: 'SSI_WALLET_RECIPIENT_SCANNED',
        data
      });
  }

  /**
   * Handles invalid pagoPA QR codes
   */
  private onInvalidQrCode = () => {
    showToast(I18n.t("wallet.QRtoPay.wrongQrCode"), "danger");

    this.setState({
      scanningState: "INVALID"
    });
    // eslint-disable-next-line
    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);
  };

  /**
   * Gets called by the QR code reader on new QR code reads
   */
  private onQrCodeData = (data: string) => {
    console.log(data)

    // On-the-fly fix for badly-read QRs
    if (data === null || data === undefined) {
      const resultOrError = decodePagoPaQrCode(data);
      resultOrError.foldL<void>(this.onInvalidQrCode, this.onValidQrCode);
      return
    }

    if (this.props.navigation.state.params && this.props.navigation.state.params.action === 'SSI_WALLET_SCAN_RECIPIENT') {
      this.handleSsiWalletRecipientScan(data);
      return;
    }

    let qrType = (JSON.parse(data)).type
    console.log('qr type scansionato: ' + qrType)

    if (qrType === "ssi-shareReq") { // FIXME: non propriamente "safe", se pagopa includesse una stringa signReq, non si potrà scansionare con effetti imprevedibili
      this.onSsiShareReq(data); // Condividi una VC (qr piccolo)
    } else if (qrType === "ssi-signReq") { // FIXME: non propriamente "safe", se pagopa includesse una stringa shareReq, non si potrà scansionare con effetti imprevedibili
      this.onSsiSignReq(data); // Firma una VC (qr grande, step 2)
    } else if (qrType === "ssi-issuedVC") {
      this.onSsiIssuedVc(data); // Salva una VC (qr grande, step 3)
    } else {
      const resultOrError = decodePagoPaQrCode(data);
      resultOrError.foldL<void>(this.onInvalidQrCode, this.onValidQrCode);
    }
  };

  /**
   * Start image chooser
   */
  private showImagePicker = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: "images"
      },
      // PermissionDenied message only for Android
      permissionDenied: {
        title: I18n.t("wallet.QRtoPay.settingsAlert.title"),
        text: I18n.t("wallet.QRtoPay.settingsAlert.message"),
        okTitle: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
        reTryTitle: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings")
      }
    };
    // Open Image Library
    ImagePicker.launchImageLibrary(options, response => {
      const path = response.path ? response.path : response.uri;
      if (path != null) {
        ReaderQR.readerQR(path)
          .then((data: string) => {
            this.onQrCodeData(data);
          })
          .catch(() => {
            this.onInvalidQrCode();
          });
      } else if (response.error !== undefined) {
        // Alert to invite user to enable the permissions
        Alert.alert(
          I18n.t("wallet.QRtoPay.settingsAlert.title"),
          I18n.t("wallet.QRtoPay.settingsAlert.message"),
          [
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings"),
              onPress: openAppSettings
            }
          ],
          {cancelable: false}
        );
      } // else if the user has not selected a file, do nothing
    });
  };

  public constructor(props: Props) {
    super(props);
    this.state = {
      scanningState: "SCANNING",
      isFocused: false
    };
  }

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

  private handleDidFocus = () => this.setState({isFocused: true, scanningState: "SCANNING"})

  private handleWillBlur = () => this.setState({isFocused: false});

  public render(): React.ReactNode {
    const primaryButtonProps = {
      buttonFontSize: customVariables.btnFontSize - 1,
      block: true,
      primary: true,
      onPress: this.props.navigateToPaymentManualDataInsertion,
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    const secondaryButtonProps = {
      buttonFontSize: customVariables.btnFontSize - 1,
      block: true,
      cancel: true,
      onPress: this.props.navigation.goBack,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container style={styles.white}>
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillBlur={this.handleWillBlur}
        />
        <BaseScreenComponent
          headerTitle={I18n.t("wallet.QRtoPay.byCameraTitle")}
          goBack={this.goBack}
          contextualHelpMarkdown={contextualHelpMarkdown}
          faqCategories={["wallet"]}
        >
          <ScrollView bounces={false}>
            {this.state.isFocused && (
              <QRCodeScanner
                onRead={(reading: { data: string }) =>
                  this.onQrCodeData(reading.data)
                }
                ref={this.qrCodeScanner}
                containerStyle={styles.cameraContainer as any}
                showMarker={true}
                cameraStyle={styles.camera as any}
                customMarker={
                  <CameraMarker
                    screenWidth={screenWidth}
                    state={this.state.scanningState}
                  />
                }
                bottomContent={
                  <View>
                    <ButtonDefaultOpacity
                      onPress={this.showImagePicker}
                      style={styles.button}
                      bordered={true}
                    >
                      <Text>{I18n.t("wallet.QRtoPay.chooser")}</Text>
                    </ButtonDefaultOpacity>
                    <View style={styles.content}>
                      <View spacer={true}/>
                      <Text style={[styles.padded, styles.bottomText]}>
                        {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
                      </Text>
                      <View spacer={true} extralarge={true}/>
                    </View>
                  </View>
                }
                // "captureAudio" enable/disable microphone permission
                cameraProps={{captureAudio: false}}
                // "checkAndroid6Permissions" property enables permission checking for
                // Android versions greater than 6.0 (23+).
                checkAndroid6Permissions={true}
                permissionDialogTitle={I18n.t(
                  "wallet.QRtoPay.cameraUsagePermissionInfobox.title"
                )}
                permissionDialogMessage={I18n.t(
                  "wallet.QRtoPay.cameraUsagePermissionInfobox.message"
                )}
                // "notAuthorizedView" is by default available on iOS systems ONLY.
                // In order to make Android systems act the same as iOSs you MUST
                // enable "checkAndroid6Permissions" property as well.
                // On devices before SDK version 23, the permissions are automatically
                // granted if they appear in the manifest, so message customization would
                // be impossible.
                notAuthorizedView={
                  <View style={styles.notAuthorizedContainer}>
                    <Text style={styles.notAuthorizedText}>
                      {I18n.t("wallet.QRtoPay.enroll_cta")}
                    </Text>

                    <ButtonDefaultOpacity
                      onPress={openAppSettings}
                      style={styles.notAuthorizedBtn}
                    >
                      <Text>
                        {I18n.t("biometric_recognition.enroll_btnLabel")}
                      </Text>
                    </ButtonDefaultOpacity>
                  </View>
                }
              />
            )}
          </ScrollView>
        </BaseScreenComponent>
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  navigateToScannedSsiQrCode: () => dispatch(navigateToSsiHome()),
  navigateToVCsList: (params: any) => dispatch(navigateToVCsList(params)),
  navigateToShareVCsList: (params: any) => dispatch(navigateToShareVCsList(params)),
  navigateToSsiSignReq: (params: any) => dispatch(navigateToSsiSignReq(params)),
  navigateToSsiWalletSendScreen: (params: any) => dispatch(navigateToSsiWalletSendScreen(params)),
  navigateToPaymentManualDataInsertion: () =>
    dispatch(navigateToPaymentManualDataInsertion()),
  runPaymentTransactionSummarySaga: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId,
        initialAmount
      })
    );
  }
});

export default connect(undefined, mapDispatchToProps)(ScanQrCodeScreen);
