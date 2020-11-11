const ROUTES = {
  // Ingress
  INGRESS: "INGRESS",

  // Authentication
  AUTHENTICATION: "AUTHENTICATION",
  AUTHENTICATION_LANDING: "AUTHENTICATION_LANDING",
  AUTHENTICATION_IDP_SELECTION: "AUTHENTICATION_IPD_SELECTION",
  AUTHENTICATION_IDP_LOGIN: "AUTHENTICATION_IDP_LOGIN",
  AUTHENTICATION_IDP_TEST: "AUTHENTICATION_IDP_TEST",
  AUTHENTICATION_LOGIN: "AUTHENTICATION_LOGIN",
  AUTHENTICATION_SPID_INFORMATION: "AUTHENTICATION_SPID_INFORMATION",
  AUTHENTICATION_SPID_CIE_INFORMATION: "AUTHENTICATION_SPID_CIE_INFORMATION",
  AUTHENTICATION_CIE: "AUTHENTICATION_CIE",
  MARKDOWN: "MARKDOWN",

  // CIE
  CIE_EXPIRED_SCREEN: "CIE_EXPIRED_SCREEN",
  CIE_PIN_SCREEN: "CIE_PIN_SCREEN",
  CIE_AUTHORIZE_USAGE_SCREEN: "CIE_AUTHORIZE_USAGE_SCREEN",
  CIE_CARD_READER_SCREEN: "CIE_CARD_READER_SCREEN",
  CIE_CONSENT_DATA_USAGE: "CIE_CONSENT_DATA_USAGE",
  CIE_WRONG_PIN_SCREEN: "CIE_WRONG_PIN_SCREEN",
  CIE_PIN_TEMP_LOCKED_SCREEN: "CIE_PIN_TEMP_LOCKED_SCREEN",

  // Onboarding
  ONBOARDING: "ONBOARDING",
  ONBOARDING_TOS: "ONBOARDING_TOS",
  ONBOARDING_PIN: "ONBOARDING_PIN",
  ONBOARDING_FINGERPRINT: "ONBOARDING_FINGERPRINT",
  ONBOARDING_EMAIL_VALIDATE: "ONBOARDING_EMAIL_VALIDATE",

  // Documents
  DOCUMENTS_HOME: "DOCUMENTS_HOME",

  // Wallet
  WALLET_HOME: "WALLET_HOME",
  WALLET_TRANSACTION_DETAILS: "WALLET_TRANSACTION_DETAILS",
  WALLET_LIST: "WALLET_LIST",
  WALLET_CARD_TRANSACTIONS: "WALLET_CARD_TRANSACTION",
  WALLET_SAVE_CARD: "WALLET_SAVE_CARD",
  WALLET_ADD_PAYMENT_METHOD: "WALLET_ADD_PAYMENT_METHOD",
  WALLET_ADD_CARD: "WALLET_ADD_CARD",
  WALLET_CONFIRM_CARD_DETAILS: "WALLET_CONFIRM_CARD_DETAILS",
  WALLET_CHECKOUT_3DS_SCREEN: "WALLET_CHECKOUT_3DS_SCREEN",

  // Payment
  PAYMENT_SCAN_QR_CODE: "PAYMENT_SCAN_QR_CODE",
  PAYMENT_MANUAL_DATA_INSERTION: "PAYMENT_MANUAL_DATA_INSERTION",
  PAYMENT_TRANSACTION_SUMMARY: "PAYMENT_TRANSACTION_SUMMARY",
  PAYMENT_TRANSACTION_SUCCESS: "PAYMENT_TRANSACTION_SUCCESS",
  PAYMENT_TRANSACTION_ERROR: "PAYMENT_TRANSACTION_ERROR",
  PAYMENT_PICK_PAYMENT_METHOD: "PAYMENT_PICK_PAYMENT_METHOD",
  PAYMENT_CONFIRM_PAYMENT_METHOD: "PAYMENT_CONFIRM_PAYMENT_METHOD",
  PAYMENT_PICK_PSP: "PAYMENT_PICK_PSP",
  PAYMENTS_HISTORY_SCREEN: "PAYMENTS_HISTORY_SCREEN",
  PAYMENT_HISTORY_DETAIL_INFO: "PAYMENT_HISTORY_DETAIL_INFO",

  // SSI
  SSI_NAVIGATOR: "SSI_NAVIGATOR",
  SSI_HOME: "SSI_HOME",
  SSI_VERIFIED_CREDENTIALS_SCREEN: "SSI_VERIFIED_CREDENTIALS_SCREEN",
  SSI_SHARE_VERIFIED_CREDENTIALS_SCREEN: "SSI_SHARE_VERIFIED_CREDENTIALS_SCREEN",

  // ERCWALLET_NAVIGATOR
  ERCWALLET_NAVIGATOR: "ERCWALLET_NAVIGATOR",
  ERCWALLET_HOME: "ERCWALLET_HOME",

  // Pin
  PIN_LOGIN_NAVIGATOR: "PIN_LOGIN_NAVIGATOR",
  PIN_LOGIN: "PIN_LOGIN",

  // Main
  MAIN: "MAIN",

  // Messages
  MESSAGES_NAVIGATOR: "MESSAGES_NAVIGATOR",
  MESSAGES_HOME: "MESSAGES_HOME",
  MESSAGE_DETAIL: "MESSAGE_DETAIL",

  // Services
  SERVICES_NAVIGATOR: "SERVICES_NAVIGATOR",
  PREFERENCES_SERVICES: "PREFERENCES_SERVICES", // same target as ROUTES.SERVICES_HOME. It is kept for legacy pourposes
  SERVICES_HOME: "SERVICES_HOME",
  SERVICE_DETAIL: "SERVICE_DETAIL",
  SERVICE_WEBVIEW: "SERVICE_WEBVIEW",

  // Profile
  PROFILE_NAVIGATOR: "PROFILE_NAVIGATOR",
  PROFILE_MAIN: "PROFILE_MAIN",
  PROFILE_PRIVACY: "PROFILE_PRIVACY",
  PROFILE_PRIVACY_MAIN: "PROFILE_PRIVACY_MAIN",
  PROFILE_PREFERENCES_HOME: "PROFILE_PREFERENCES_HOME",
  PROFILE_PREFERENCES_BIOMETRIC_RECOGNITION:
    "PROFILE_PREFERENCES_BIOMETRIC_RECOGNITION",
  PROFILE_PREFERENCES_EMAIL_FORWARDING: "PROFILE_PREFERENCES_EMAIL_FORWARDING",
  PROFILE_PREFERENCES_CALENDAR: "PROFILE_PREFERENCES_CALENDAR",
  PROFILE_PREFERENCES_LANGUAGE: "PROFILE_PREFERENCES_LANGUAGE",
  PROFILE_FISCAL_CODE: "PROFILE_FISCAL_CODE",
  PROFILE_DOWNLOAD_DATA: "PROFILE_DOWNLOAD_DATA",
  MARKDOWN_PLAYGROUND: "MARKDOWN_PLAYGROUND",

  // Developer Mode
  WEB_PLAYGROUND: "WEB_PLAYGROUND",

  // Preferences
  READ_EMAIL_SCREEN: "READ_EMAIL_SCREEN",
  INSERT_EMAIL_SCREEN: "INSERT_EMAIL_SCREEN",

  // Used when the App is in background
  BACKGROUND: "BACKGROUND"
};

export default ROUTES;
