import React from "react";
import { StyleSheet, View } from "react-native";
import PassPhraseWord from "./PassPhraseWord";

interface Props {
  passPhrase: string;
}

const PassPhraseWordList = ({ passPhrase }: Props) => {
  const passPhraseWords = passPhrase.split(" ");
  if (!passPhrase || passPhrase.length <= 1) {
    return null;
  }
  return (
    <View style={styles.container}>
      {passPhraseWords.map((word, index) => (
        <PassPhraseWord key={word} index={index + 1} word={word} />
      ))}
    </View>
  );
};

export default PassPhraseWordList;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start"
  }
});
