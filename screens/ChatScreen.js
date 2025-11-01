// ChatScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    { id: '1', text: "Hi there! I'm your habit assistant. How can I help you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Check if user is asking about free time or places
    const lowerCaseText = inputText.toLowerCase();
    if (lowerCaseText.includes('free') || lowerCaseText.includes('bored') || lowerCaseText.includes('what to do')) {
      // Get user's location
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission not granted');
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Add a small delay to simulate AI thinking
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              text: "I see you have some free time! Here are some places you might want to check out nearby:",
              isUser: false,
              action: 'suggest_places',
              location: { latitude, longitude }
            }
          ]);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error getting location:', error);
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now().toString(), 
            text: "I'd love to suggest some places, but I need location permission to do that. Please enable location services and try again.", 
            isUser: false 
          }
        ]);
        setIsLoading(false);
      }
    } else {
      // Default response for other messages
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now().toString(), 
            text: "I'm here to help you with your habits and tasks. Let me know if you need anything!", 
            isUser: false 
          }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.isUser ? styles.userBubble : styles.botBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser && styles.userMessageText
      ]}>
        {item.text}
      </Text>
      {item.action === 'suggest_places' && (
        <TouchableOpacity
          style={styles.suggestionButton}
          onPress={() => {
            navigation.navigate('NearbyPlaces', {
              initialLocation: item.location
            });
          }}
        >
          <MaterialIcons name="location-on" size={20} color="white" />
          <Text style={styles.suggestionText}>Show Nearby Places</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#6C63FF" />
      <FlatList
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          enablesReturnKeyAutomatically
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]} 
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons 
              name="send" 
              size={24} 
              color={!inputText.trim() ? '#aaa' : 'white'} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: 'black',
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d0c9ff',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default React.memo(ChatScreen);