import React from 'react';
// Imports the Gifted Chat library
import { GiftedChat, Bubble, } from 'react-native-gifted-chat';
import {
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,

} from 'react-native';

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
    }
  }
  componentDidMount() {
    let name = this.props.route.params.name;
    // Displays the user’s name in the navigation bar at the top of the chat screen.
    this.props.navigation.setOptions({ title: name });
    // Sets the state with a static message so that you’ll be able to see each 
    // element of the UI displayed on screen right away
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        // Create a system message
        {
          _id: 3,
          text: `${name} entered the room.`,
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }
  // It will be called when a user sends a message.
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }
  // Create a function to change the bubble color
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.route.params.colorSelectionBackground }}>
        {/* Renders the chat interface: */}
        < GiftedChat
          // Adds a prop to change the bubble color
          renderBubble={this.renderBubble.bind(this)}
          style={styles.chat}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{ _id: 1, }}
        />
        {/* This, prevents the keyboard to hide 
        the message input field, so that you can’t see what you’re typing: */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  chat: {
  },
});