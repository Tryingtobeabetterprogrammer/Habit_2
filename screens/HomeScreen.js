import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Read a book', description: '30 minutes before bed', color: '#FFF6D6', done: false },
    { id: '2', title: 'Exercise', description: 'Go for a 30-min run', color: '#EAF2FF', done: false },
    { id: '3', title: 'Meditate', description: '10 minutes of calm', color: '#FFE9EE', done: false },
  ]);

   const toggleCheckbox = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, { backgroundColor: item.color }]}>
      <View style={styles.taskLeft}>
        <Checkbox
          value={item.done}
          onValueChange={() => toggleCheckbox(item.id)}
          color={item.done ? '#705CFF' : undefined}
          style={styles.checkbox}
        />
        <View>
          <Text style={[styles.taskTitle, item.done && styles.doneText]}>
            {item.title}
          </Text>
          <Text style={[styles.taskDescription, item.done && styles.doneText]}>
            {item.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => setTasks(tasks.filter(t => t.id !== item.id))}>
        <Ionicons name="trash" size={22} color="#C54B4B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#705CFF', '#F883DD']} style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </LinearGradient>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.taskList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    height: 110,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskList: { padding: 15 },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskDescription: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
});