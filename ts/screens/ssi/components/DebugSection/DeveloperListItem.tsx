import React from "react";
import { ListItem, Text, View } from "native-base";
import { StyleSheet } from "react-native";

import Switch from "../../../../components/ui/Switch";
import customVariables from "../../../../theme/variables";

const styles = StyleSheet.create({
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  qrButton: {
    margin: 20
  },
  white: {
    color: customVariables.colorWhite
  },
  itemLeftText: {
    alignSelf: "flex-start"
  },
  developerSectionItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  developerSectionItemLeft: {
    flex: 1
  },
  developerSectionItemRight: {
    flex: 0
  },
  modalHeader: {
    lineHeight: 40
  },
  whiteBg: {
    backgroundColor: customVariables.colorWhite
  },

  noRightPadding: {
    paddingRight: 0
  }
});

interface Props {
  title: string;
  switchValue: boolean;
  onSwitchValueChange: (value: boolean) => void;
  description?: string;
}

const DeveloperListItem: React.FC<Props> = ({
  title,
  switchValue,
  onSwitchValueChange,
  description
}) => (
  <ListItem style={styles.noRightPadding}>
    <View style={styles.developerSectionItem}>
      <View style={styles.developerSectionItemLeft}>
        <Text style={styles.itemLeftText}>{title}</Text>

        <Text style={styles.itemLeftText}>{description}</Text>
      </View>
      <View style={styles.developerSectionItemRight}>
        <Switch value={switchValue} onValueChange={onSwitchValueChange} />
      </View>
    </View>
  </ListItem>
);

export default DeveloperListItem;
