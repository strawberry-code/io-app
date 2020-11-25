import React from 'react'
import { View, Text } from "react-native"
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import I18n from "../../i18n"

const SsiBalanceAndTransctionScreen: React.FC = () => {

  return (
      <TopScreenComponent
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      headerTitle={I18n.t("ssi.title")}
      goBack={true}
      >
        <ScreenContent
          title="Bilancio e Transazioni"
          subtitle="Da qui potrai controllare bilancio e transazioni"
          icon={require("../../../img/icons/gears.png")}
        >
        </ScreenContent>
      </TopScreenComponent>
  )
}

export default SsiBalanceAndTransctionScreen