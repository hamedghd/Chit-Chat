import React from 'react';

// Imports the Gifted Chat library
import { GiftedChat, Bubble, } from 'react-native-gifted-chat';

// Import the needed components
import {
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  LogBox,
} from 'react-native';

// Import Firestore
const firebase = require('firebase');
require('firebase/firestore');

//  Configures the Firestore app
const firebaseConfig = {
  apiKey: "AIzaSyCX98BL5JmxuBZ8299hbCbdxz8q5-_P1-Q",
  authDomain: "test-hgh.firebaseapp.com",
  projectId: "test-hgh",
  storageBucket: "test-hgh.appspot.com",
  messagingSenderId: "844357971418",
  appId: "1:844357971418:web:f9468fd21e638ed82164e3",
  measurementId: "G-7RHTWKP8PJ",
};

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Creates a container to hold the messages
      messages: [],
      uid: 0,
      loggedInText: "Logging in...",
      user: {
        _id: '',
        name: "",
        avatar: "https://placeimg.com/140/140/any",
      },
    };
    //  Initializes the Firestore app
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Creates a reference to your Firestore collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // This ignores the warnings related to setting a timer
    LogBox.ignoreLogs(['Setting a timer']);
  };

  componentDidMount() {
    let name = this.props.route.params.name;
    // Displays the user’s name in the navigation bar at the top of the chat screen.
    this.props.navigation.setOptions({ title: name });

    // User authentication
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      // Updates user state with the currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
          // avatar: user.avatar,
        }
      });
      // This function “listens” for updates in the collection
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }
  componentWillUnmount() {
    // Stops receiving updates about a collection
    this.unsubscribe();
    // Stops receiving updates about a collection
    this.authUnsubscribe();
  }
  // This function retrieves the current data in your “messages” collection 
  // and stores it in the state "messages".
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });

    this.setState({
      messages,
    });
  };
  // This function stores messages in the collection
  addMessages() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  };
  // It will be called when a user sends a message.
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // onSend adds new messages to the database and updates the messages state
        this.addMessages();
      }
    );

  }
  // Create a function to change the bubble color
  renderBubble(props) {
    let color = this.props.route.params.colorSelectionBackground;
    if (color = '#090c08') {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#757575'
            }
          }}
        />
      );
    } else {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#000'
            }
          }}
        />
      );
    }
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
          user={{ _id: this.state.uid, name: this.props.route.params.name, /*avatar: this.state.avatar*/ }}
        />

        {/* This, prevents the keyboard to hide 
        the message input field, so that you can’t see what you’re typing: */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}

      </View >
    );
  };
}



const styles = StyleSheet.create({
  chat: {
  },
});