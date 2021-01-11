import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import customVariables from "../../../theme/variables";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: customVariables.brandPrimary,
    marginBottom: 5,
    width: "33%"
  },
  index: {
    backgroundColor: customVariables.brandPrimary,
    color: customVariables.colorWhite,
    paddingHorizontal: 5,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-Regular"
    })
  },
  word: {
    paddingHorizontal: 5,
    fontFamily: Platform.select({
      ios: "Titillium Web",
      android: "TitilliumWeb-Regular"
    })
  }
});

interface Props {
  word: string;
  index: number;
}

const PassPhraseWord = ({ index, word }: Props) => (
  <View style={styles.container}>
    <Text style={styles.index}>{index}</Text>
    <Text style={styles.word}>{word}</Text>
  </View>
);

export default PassPhraseWord;
