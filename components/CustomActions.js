/**
 * @description this file handles the CustomAction button in text input field
 * @class CustomActions
 * @requires React
 * @requires React-Native
 * @requires Prop-Types
 * @requires Expo-Image-Picker
 * @requires Expo-Permissions
 * @requires Expo-Location
 * @requires Firebase
 * @requires Firestore
 */

//  import PropTypes
import PropTypes from "prop-types";
//import react
import React from "react";
//import necessary components from react-native
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
//import permissions and imagepicker
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import firebase from 'firebase';
import firestore from 'firebase';
//import firebase
// const firebase = require("firebase");
// require("firebase/firestore");

export default class CustomActions extends React.Component {

  /**
   * function that handles communication features
   * @function onActionPress
   */
  onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("user wants to pick an image");
            return;
          case 1:
            console.log("user wants to take a photo");
            return;
          case 2:
            console.log("user wants to get their location");
            return;
        }
      }
    );
  };

  //render function
  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Let’s you choose to send an image or your geolocation."
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};