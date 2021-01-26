/* eslint-disable no-console */
/* eslint-disable functional/immutable-data */
/**
 * Set the basic PushNotification configuration
 */
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import {fromEither, fromNullable} from "fp-ts/lib/Option";
import * as t from "io-ts";
import {NonEmptyString} from "italia-ts-commons/lib/strings";
import {Alert, Platform} from "react-native";
import PushNotification from "react-native-push-notification";
import AsyncStorage from "@react-native-community/async-storage";
import {store} from "../App";
import {debugRemotePushNotification, gcmSenderId} from "../config";
import {loadMessages} from "../store/actions/messages";
import {
  updateSsiNotifications,
  updateNotificationsInstallationToken,
  updateNotificationsPendingMessage,
} from "../store/actions/notifications";
import { isDevEnv } from "../utils/environment";
import {  navigateToSsiNotificationScreen } from "../store/actions/navigation";
import { navigationCurrentRouteSelector } from "../store/reducers/navigation";
import ROUTES from "../navigation/routes";


/**
 * Helper type used to validate the notification payload.
 * The message_id can be in different places depending on the platform.
 */
const NotificationPayload = t.partial({
  message_id: NonEmptyString,
  data: t.partial({
    message_id: NonEmptyString
  })
});


const handleNotification = (notification: typeof PushNotification) => {
  console.log('🎈 notifica push arrivata! ('+Platform.OS+')');
  console.log('dettagli della push: ' + JSON.stringify(notification));
  console.log('dettagli della push object: ', notification);

  if (debugRemotePushNotification) {
    Alert.alert("Notification", JSON.stringify(notification));
  }
  
  const ssiNotificationPayload = Platform.OS === 'ios'
    ? notification.data.payload
    : JSON.parse(notification.payload);
  
  console.log('ssiNotificationPayload: ' + JSON.stringify(ssiNotificationPayload));

  const ssiPushType = ssiNotificationPayload.type;

  if(ssiPushType === 'ssi-issuedVC') {
    console.log('sto gestendo una notifica push SSI del tipo: ', ssiPushType);
    handleIssuedVCNotification(ssiNotificationPayload.verifiablePresentation, notification.foreground);
  } else {
    console.log(`⚠️ attenzione: il tipo di notifica push SSI (${ssiPushType}) non è ancora gestito`);
  }

  const maybeMessageId = fromEither(
    NotificationPayload.decode(notification)
  ).chain(payload =>
    fromNullable(payload.message_id).alt(
      fromNullable(payload.data).mapNullable(_ => _.message_id)
    )
  );

  maybeMessageId.map(messageId => {
    // We just received a push notification about a new message
    if (notification.foreground) {
      // The App is in foreground so just refresh the messages list
      store.dispatch(loadMessages.request());
    } else {
      // The App was closed/in background and has been now opened clicking
      // on the push notification.
      // Save the message id of the notification in the store so the App can
      // navigate to the message detail screen as soon as possible (if
      // needed after the user login/insert the unlock code)
      store.dispatch(
        updateNotificationsPendingMessage(
          messageId,
          notification.foreground
        )
      );

      // finally, refresh the message list to start loading the content of
      // the new message
      store.dispatch(loadMessages.request());
    }
  });

  // On iOS we need to call this when the remote notification handling is complete
  notification.finish(PushNotificationIOS.FetchResult.NoData);
};

const handleRegister = async (device : { os: string; token: string }) => {
  console.log('PUSH NOTIFICATIONS TOKEN: ', device.token);
  await AsyncStorage.setItem("PUSH_TOKEN", device.token);
  // Dispatch an action to save the token in the store
  store.dispatch(updateNotificationsInstallationToken(device.token));
  PushNotification.popInitialNotification((notification) => {
    if (notification) {
      handleNotification(notification);
    }
  });
};


function configurePushNotifications() {
  // if isDevEnv, disable push notification to avoid crash for missing firebase settings
  // Cristiano: disabilitato perchè è necessario avere le push abilitate anche in dev mode
  // if (isDevEnv) {
  //   return;
  // }
  PushNotification.configure({
    // Called when token is generated
    onRegister: device => {
      void handleRegister(device);
    },

    // Called when a remote or local notification is opened or received
    onNotification: notification => {
      handleNotification(notification);
    },
    popInitialNotification: false,

    // GCM Sender ID
    senderID: gcmSenderId
  });
}

function handleIssuedVCNotification(VPjwt: string, foreground: boolean) {

  store.dispatch(updateSsiNotifications(VPjwt));
  const maybeCurrentRoute = navigationCurrentRouteSelector(store.getState());
  // CONTROLLO CHE L'ATTUALE ROUTE SIA QUELLA DELLE NOTIFICATIONS
  console.log("CURRENT NAV", maybeCurrentRoute);

  maybeCurrentRoute.map(currentRoute => {
    // SE IN FOREGROUND FACCIO VEDERE UN ALLERT DI NOTIFICA CHE CHIEDE SE VUOLE NAVIGARE NELLA VISTA DEL NOTIFICHE
    if (foreground && currentRoute !== ROUTES.SSI_NOTIFICATIONS) {
      Alert.alert(
        'Nuova notifica',
        'Hai ricevuto una richiesta di accettazione per la credenziale firmata',
        [
          {
            text: 'Notifiche',
            onPress: () => {
                store.dispatch(navigateToSsiNotificationScreen());
             return true;
            }
          },
          {
            text: 'Chiudi',
            style: 'destructive',
            onPress: undefined
          }
        ],
        { cancelable: true }
      );
    }
  
    if (!foreground){
      store.dispatch(navigateToSsiNotificationScreen());
    }

  });
 }

export default configurePushNotifications;
