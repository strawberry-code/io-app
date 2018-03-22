// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import { Container, Content, Text, View, Button } from 'native-base'

import { type ReduxProps } from '../../actions/types'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * A screen where the user can choose to login with SPID or get for
 * informations.
 */
class LandingScreen extends React.Component<Props> {
  render(): React.Node {
    return (
      <Container>
        <Content />
        <View footer>
          <Button
            block
            primary
            onPress={(): boolean =>
              this.props.navigation.navigate(ROUTES.AUTHENTICATION_LOGIN)
            }
          >
            <Text>{I18n.t('authentication.landing.login')}</Text>
          </Button>
          <View spacer />
          <Button block transparent>
            <Text>{I18n.t('authentication.landing.nospid')}</Text>
          </Button>
        </View>
      </Container>
    )
  }
}

export default connect()(LandingScreen)
