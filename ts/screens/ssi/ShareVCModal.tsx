import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Modal,
  StyleSheet,
  StyleSheetProperties,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import variables from "../../theme/variables";

type State = {
  modalVisible: boolean;
  modalStates: {
    showPrompt: boolean;
    sharing: boolean;
    sharedSuccess: boolean;
    sharedFail: boolean | any;
  };
};
class SsiShareVCModal extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      modalVisible: true,
      modalStates: {
        showPrompt: true,
        sharing: false,
        sharedSuccess: false,
        sharedFail: false
      }
    };
    // this.props.sharedSuccees = this.sharedSuccess;
  }

  public setModalVisible = (visible: boolean): void => {
    this.setState({ modalVisible: visible });
  };

  public shareLoading = () => {
    this.setState({
      modalStates: {
        showPrompt: false,
        sharing: true,
        sharedSuccess: false,
        sharedFail: false
      }
    });
  };

  public sharedSuccess = () => {
    this.setState({
      modalStates: {
        showPrompt: false,
        sharing: false,
        sharedSuccess: true,
        sharedFail: fail
      }
    });
  };

  public render() {
    const { modalVisible, modalStates } = this.state;

    return (
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {modalStates.showPrompt && (
              <>
                <Text style={styles.modalText}>
                  Do you want to share this credential?
                </Text>

                <View style={{ flexDirection: "row" }}>
                  <Button
                    style={{
                      ...styles.openButton,
                      backgroundColor: variables.brandPrimary,
                      marginHorizontal: 20
                    }}
                    onPress={() => {
                      this.shareLoading();
                      setTimeout(this.sharedSuccess, 2500);
                    }}
                    text="Yes"
                    textStyle={styles.textStyle}
                  />

                  <Button
                    style={{
                      ...styles.openButton,
                      backgroundColor: variables.brandDanger,
                      marginHorizontal: 20
                    }}
                    onPress={() => {
                      this.setModalVisible(false);
                    }}
                    text="No"
                    textStyle={styles.textStyle}
                  />
                </View>
              </>
            )}

            {modalStates.sharing && (
              <>
                <Text style={styles.modalText}>Sharing credential...</Text>
                <ActivityIndicator />
              </>
            )}

            {modalStates.sharedSuccess && (
              <>
                <Text style={styles.modalText}>Credential shared!</Text>
                <Text style={styles.modalText}>✅</Text>

                <Button
                  text="Ok, thanks"
                  textStyle={styles.textStyle}
                  style={{
                    ...styles.openButton,
                    backgroundColor: variables.brandPrimary
                  }}
                  onPress={() => {
                    this.setModalVisible(false);
                    this.setState({
                      modalStates: {
                        showPrompt: true,
                        sharing: false,
                        sharedSuccess: false,
                        sharedFail: false
                      }
                    });
                  }}
                />
              </>
            )}

            {modalStates.sharedFail && (
              <>
                <Text style={styles.modalText}>
                  Failed to share the credential
                </Text>
                <Text style={styles.modalText}>🚫</Text>

                <Button
                  text="Ok, thanks"
                  style={{
                    ...styles.openButton,
                    backgroundColor: variables.brandPrimary
                  }}
                  onPress={() => this.setModalVisible(false)}
                  textStyle={styles.textStyle}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }
}

interface ButtonProps {
  style?: StyleSheetProperties | any;
  onPress: (event: GestureResponderEvent) => void;
  text: string;
  textStyle?: StyleSheetProperties | any;
}

// eslint-disable-next-line arrow-body-style
const Button: React.FC<ButtonProps> = ({ style, onPress, text, textStyle }) => {
  return (
    <TouchableHighlight style={{ ...style }} onPress={onPress}>
      <Text style={textStyle}>{text}</Text>
    </TouchableHighlight>
  );
};

/*
      <TouchableHighlight
        style={styles.openButton}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Text style={styles.textStyle}>Show Modal</Text>
      </TouchableHighlight>
 */

const styles = StyleSheet.create<StyleSheetProperties | any>({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    height: 40
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default SsiShareVCModal;
