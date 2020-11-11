import { createStackNavigator } from "react-navigation";
import MarkdownPlayground from "../screens/profile/playgrounds/MarkdownPlayground";
import WebPlayground from "../screens/profile/WebPlayground";
import ROUTES from "./routes";
import ErcWalletMainScreen from "../screens/ercwallet/ErcWalletMainScreen";

/**
 * A navigator for all the screens of the SSI section
 * PwC - Cristiano Cavo - 8th October 2020
 */
const ProfileNavigator = createStackNavigator(
  {
    [ROUTES.ERCWALLET_HOME]: {
      screen: ErcWalletMainScreen
    },
    [ROUTES.MARKDOWN_PLAYGROUND]: {
      screen: MarkdownPlayground
    },
    [ROUTES.WEB_PLAYGROUND]: {
      screen: WebPlayground
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
