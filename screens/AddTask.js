import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddTask({ navigation, route }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Please enter a task title');
      return;
    }
    Alert.alert('Task Added', `Title: ${taskTitle}\nDescription: ${taskDescription}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Task Title"
        placeholderTextColor="#aaa"
        value={taskTitle}
        onChangeText={setTaskTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter Description"
        placeholderTextColor="#aaa"
        value={taskDescription}
        onChangeText={setTaskDescription}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleAddTask}>
        <Ionicons name="add-circle" size={28} color="#fff" />
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
});