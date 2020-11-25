import React from 'react'
import { View, Text } from "react-native"
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import I18n from "../../i18n"

const SsiWalletReceiveScreen: React.FC = () => {

  return (
      <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      goBack={true}
      >
        <ScreenContent
          title="Ricevi nel tuo Wallet"
          subtitle="Da qui potrai ricevere nel tuo Wallet"
          icon={require("../../../img/icons/gears.png")}
        >
        </ScreenContent>
      </TopScreenComponent>
  )
}

export default SsiWalletReceiveScreen