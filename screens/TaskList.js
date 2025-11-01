import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import AddTask screen
import AddTask from './AddTask';

export default function TaskList({ navigation }) {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Read a book', description: 'Read 30 minutes before bed', completed: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Exercise', description: 'Go for a 30-minute run', completed: true, createdAt: new Date().toISOString() },
    { id: '3', title: 'Meditate', description: '10 minutes of morning meditation', completed: false, createdAt: new Date().toISOString() },
  ]);

  const handleAddTask = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          },
        },
      ]
    );
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        {item.completed ? (
          <Ionicons name="checkbox-outline" size={24} color="#6C63FF" />
        ) : (
          <Ionicons name="square-outline" size={24} color="#ccc" />
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.taskContent}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
      >
        <Text 
          style={[
            styles.taskText, 
            item.completed && styles.completedTask
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.taskList}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask', { onAddTask: handleAddTask })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  taskList: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  checkbox: {
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#888',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});