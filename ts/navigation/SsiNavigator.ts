import { createStackNavigator } from "react-navigation";
import SsiMainScreen from "../screens/ssi/SsiMainScreen";
import SsiWalletSendScreen from "../screens/ssi/SsiWalletSendScreen";
import SsiWalletReceiveScreen from "../screens/ssi/SsiWalletReceiveScreen";
import SsiSignReq from "../screens/ssi/SsiSignReq";
import SsiSuccess from "../screens/ssi/SsiSuccess";
import SsiNotificationScreen from "../screens/ssi/SsiNotificationScreen";
import SsiBalanceAndTransactionScreen from "../screens/ssi/SsiBalanceAndTransaction";
import SsiVerifiedCredentials from "../screens/ssi/SsiVerifiedCredentialsScreen";
import MarkdownPlayground from "../screens/profile/playgrounds/MarkdownPlayground";
import WebPlayground from "../screens/profile/WebPlayground";
import ShareVcsWithRequesterScreen from "../screens/ssi/ShareVerifiedCredentialsWithRequester";
import ROUTES from "./routes";
import ScanQrCodeScreen from "../screens/wallet/payment/ScanQrCodeScreen";

/**
 * A navigator for all the screens of the SSI section
 * PwC - Cristiano Cavo - 8th October 2020
 */
const ProfileNavigator = createStackNavigator(
  {
    [ROUTES.SSI_HOME]: {
      screen: SsiMainScreen
    },
    [ROUTES.SSI_VERIFIED_CREDENTIALS_SCREEN]: {
      screen: SsiVerifiedCredentials
    },
    [ROUTES.SSI_SHARE_VERIFIED_CREDENTIALS_SCREEN]: {
      screen: ShareVcsWithRequesterScreen
    },
    [ROUTES.MARKDOWN_PLAYGROUND]: {
      screen: MarkdownPlayground
    },
    [ROUTES.WEB_PLAYGROUND]: {
      screen: WebPlayground
    },
    [ROUTES.SSI_WALLET_SEND_SCREEN]: {
      screen: SsiWalletSendScreen
    },
    [ROUTES.SSI_WALLET_RECEIVE_SCREEN]: {
      screen: SsiWalletReceiveScreen
    },
    [ROUTES.PAYMENT_SCAN_QR_CODE]: {
      screen: ScanQrCodeScreen
    },
    [ROUTES.SSI_WALLET_BALANCE_AND_TRANSACTION]: {
      screen: SsiBalanceAndTransactionScreen
    },
    [ROUTES.SSI_SIGNREQ]: {
      screen: SsiSignReq
    },
    [ROUTES.SSI_SUCCESS]: {
      screen: SsiSuccess
    },
    [ROUTES.SSI_NOTIFICATIONS]: {
      screen: SsiNotificationScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default ProfileNavigator;
