import React from "react";
import { ListItem, Text } from "native-base";
import { StyleSheet } from "react-native";

import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";

const styles = StyleSheet.create({
  noRightPadding: {
    paddingRight: 0
  }
});

interface Props {
  title: string;
  onPress: () => void;
  isDanger?: boolean;
  hide?: boolean;
}

const DebugListItem: React.FC<Props> = ({ title, onPress, isDanger, hide }) => {
  if (hide) {
    return null;
  }

  return (
    <ListItem style={styles.noRightPadding}>
      <ButtonDefaultOpacity
        primary={true}
        danger={isDanger}
        small={true}
        onPress={onPress}
      >
        <Text numberOfLines={1}>{title}</Text>
      </ButtonDefaultOpacity>
    </ListItem>
  );
};

export default DebugListItem;
