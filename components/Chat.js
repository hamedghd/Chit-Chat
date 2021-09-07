import React from 'react';

// Imports the Gifted Chat library
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';

// Import the needed components
import {
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  LogBox,
  Alert,
} from 'react-native';
//
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';;
// Import Firestore
const firebase = require('firebase');
require('firebase/firestore');

// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import NetInfo
import NetInfo from '@react-native-community/netinfo';

// Import renderActions
import CustomActions from './CustomActions';

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
        _id: "",
        name: "",
        avatar: "https://placeimg.com/140/140/any",
      },
      // Add a new state to hold the connection status
      isConnected: false,
      image: null,
      location: null,
    };
    //  Initializes the Firestore app
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Creates a reference to your Firestore collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // This ignores the warnings related to setting a timer
    LogBox.ignoreLogs([
      'Setting a timer',
      'deprecated',
      'Animated',
    ]);
  };

  // Loads the messages from asyncStorage.
  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // It only renders the default InputToolbar when the user is online.
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }
  componentDidMount() {
    let name = this.props.route.params.name;
    // Displays the user’s name in the navigation bar at the top of the chat screen.
    this.props.navigation.setOptions({ title: name });
    // To find out the user's connection status
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('Device is online');
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
            },
            isConnected: true,
          });
          // This function “listens” for updates in the collection
          this.unsubscribe = this.referenceChatMessages
            .orderBy("createdAt", "desc")
            .onSnapshot(this.onCollectionUpdate);
        });
        // it saves its current state into asyncStorage by calling the custom function saveMessages():
        this.saveMessages();
      } else {
        console.log('Device is offline');
        this.setState({ isConnected: false });
        //  Loads the messages from asyncStorage:
        this.getMessages();
        // Inform user about offline mode
        Alert.alert("You are offline and not able to send new messages!");
      }
    });
  }

  componentWillUnmount() {
    // Stops receiving updates about a collection
    this.unsubscribe();
    // Stops listening for authentication
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
        image: data.image || null,
        location: data.location || null,
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
      image: message.image || null,
      location: message.location || null,
    });
  };
  // This function saves the messages in the storage
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }
  //
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }
  // It will be called when a user sends a message.
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        // onSend adds new messages to the database and updates the messages state
        this.addMessages();
        // Once the state object is updated, 
        // it saves its current state into asyncStorage by calling the custom function saveMessages():
        this.saveMessages();
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
  // This function is responsible for creating the circle button.
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };
  //
  //custom map view
  renderCustomView(props) {
    const { currentMessage, } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          provider={PROVIDER_GOOGLE}
        />
      );
    }
    return null;
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
          renderUsernameOnMessage={true}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
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