import * as React from "react";
import {connect} from "react-redux";
import * as Animatable from 'react-native-animatable';
import {none, Option} from "fp-ts/lib/Option";
import {View} from 'react-native';
import I18n from "../../i18n";
import {
  disableSearch,
  searchMessagesEnabled,
  searchServicesEnabled,
  updateSearchText
} from "../../store/actions/search";
import {Dispatch} from "../../store/actions/types";
import variables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";
import {navigateToSsiNotificationScreen} from "../../store/actions/navigation";
import {GlobalState} from "../../store/reducers/types";
import {getSsiNotifications} from "../../store/reducers/notifications/ssiNotifications";

export const MIN_CHARACTER_SEARCH_TEXT = 3;

export type SearchType = "Messages" | "Services";

interface OwnProps {
  color?: string;
  searchType?: SearchType;
}

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>
  & ReturnType<typeof mapStateToProps>;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

class NotificationBell extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: none,
      debouncedSearchText: none,
    };
  }

  public render() {
    const {notifications} = this.props;
    return (
      <React.Fragment>
        <ButtonDefaultOpacity
          onPress={this.props.navigateToSsiNotificationScreen}
          transparent={true}
          accessibilityLabel={I18n.t("global.buttons.search")}
        >
          {notifications.length > 0 &&
          <>
            <Animatable.View animation="tada" iterationCount={3} direction="alternate">
              <IconFont name="bell-o" color={variables.colorBlack}/>
              <Animatable.View animation="flash" iterationCount={10} direction="alternate">
                <View style={{
                  position: 'absolute',
                  right: 0,
                  top: -24,
                  borderRadius: 100,
                  backgroundColor: 'red',
                  width: 10,
                  height: 10
                }}/>
              </Animatable.View>
            </Animatable.View>
          </>}
          {notifications.length <= 0 &&
          <>
            <IconFont name="bell-o" color={variables.lightestGray}/>
          </>}
        </ButtonDefaultOpacity>
      </React.Fragment>
    );
  }

}

const mapStateToProps = (state: GlobalState) => ({
  notifications: getSsiNotifications(state)
});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({

  navigateToSsiNotificationScreen: () => dispatch(navigateToSsiNotificationScreen()),
  dispatchSearchText: (searchText: Option<string>) =>
    dispatch(updateSearchText(searchText)),
  dispatchDisableSearch: () => dispatch(disableSearch()),
  dispatchSearchEnabled: (isSearchEnabled: boolean) => {
    const searchType = props.searchType;
    switch (searchType) {
      case "Messages":
        dispatch(searchMessagesEnabled(isSearchEnabled));
        break;
      case "Services":
        dispatch(searchServicesEnabled(isSearchEnabled));
        break;
    }
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(NotificationBell);
