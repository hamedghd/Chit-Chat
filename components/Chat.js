import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

export default class Chat extends React.Component {
  componentDidMount() {
    let name = this.props.route.params.name;
    // Displays the user’s name in the navigation bar at the top of the chat screen.
    this.props.navigation.setOptions({ title: name });
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: this.props.route.params.colorSelectionBackground }}>

      </View>
    )
  }
}