import React from "react";
import {ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import variables from "../../theme/variables";

type State = {
  modalVisible: boolean;
  modalStates: any;
};

class SsiSahreVCModal extends React.Component<State> {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: true,
      modalStates: {showPrompt: true, sharing: false, sharedSuccess: false, sharedFail: false}
    };
    this.props.sharedSuccess = this.sharedSuccess
  }

  public sharedSuccess = () => {
    this.setState({modalStates: {showPrompt: false, sharing: false, sharedSuccess: true, sharedFail: fail}});
  }

  public render() {
    return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>

              {this.state.modalStates.showPrompt && <>
                <Text style={styles.modalText}>Do you want to share this credential?</Text>

                <View style={{flexDirection: "row"}}>
                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandPrimary, marginHorizontal: 20}}
                  onPress={() => {
                    this.setState({modalStates: {showPrompt: false, sharing: true, sharedSuccess: false, sharedFail: false}});
                    setTimeout(() => {
                      this.setState({modalStates: {showPrompt: false, sharing: false, sharedSuccess: true, sharedFail: fail}});
                    }, 2500)
                  }}
                >
                  <Text style={styles.textStyle}>Yes</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandDanger, marginHorizontal: 20}}
                  onPress={() => {
                    this.setState({modalVisible: false});
                  }}
                >
                  <Text style={styles.textStyle}>No</Text>
                </TouchableHighlight>
                </View>
              </>}

              {this.state.modalStates.sharing && <>
                <Text style={styles.modalText}>Sharing credential...</Text>
                <ActivityIndicator/>
              </>}

              {this.state.modalStates.sharedSuccess && <>
                <Text style={styles.modalText}>Credential shared!</Text>
                <Text style={styles.modalText}>✅</Text>

                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandPrimary}}
                  onPress={() => {
                    this.setState({modalVisible: false})
                    this.setState({modalStates: {showPrompt: true, sharing: false, sharedSuccess: false, sharedFail: false}});
                  }}
                >
                  <Text style={styles.textStyle}>Ok, thanks</Text>
                </TouchableHighlight>
              </>}

              {this.state.modalStates.sharedFail && <>
                <Text style={styles.modalText}>Failed to share the credential</Text>
                <Text style={styles.modalText}>🚫</Text>
                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: variables.brandPrimary}}
                  onPress={() => {
                    this.setState({modalVisible: false});
                  }}
                >
                  <Text style={styles.textStyle}>Ok, thanks</Text>
                </TouchableHighlight>
              </>}
            </View>
          </View>
        </Modal>
    );
  }
}


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

const styles = StyleSheet.create({
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
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default SsiSahreVCModal;
