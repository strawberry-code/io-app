import { createStackNavigator } from "react-navigation";
import SsiMainScreen from "../screens/ssi/SsiMainScreen";
import SsiWalletSendScreen from "../screens/ssi/SsiWalletSendScreen"
import SsiWalletReceiveScreen from "../screens/ssi/SsiWalletReceiveScreen"
import SsiVerifiedCredentials from "../screens/ssi/SsiVerifiedCredentialsScreen";
import MarkdownPlayground from "../screens/profile/playgrounds/MarkdownPlayground";
import WebPlayground from "../screens/profile/WebPlayground";
import ShareVcsWithRequesterScreen from "../screens/ssi/ShareVerifiedCredentialsWithRequester";
import ROUTES from "./routes";

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
