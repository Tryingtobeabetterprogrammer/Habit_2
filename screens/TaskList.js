import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskAlarm, cancelTaskAlarm, formatAlarmTime, getAllScheduledNotifications } from '../services/alarmService';
import { scheduleAndroidFullScreenAlarm, triggerAndroidFullScreenNow } from '../services/notifeeService';

// Import AddTask screen
import AddTask from './AddTask';

const TASKS_STORAGE_KEY = '@habit_tasks';

export default function TaskList({ navigation }) {
  const [tasks, setTasks] = useState([]);

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        
        // Reschedule alarms for tasks that have alarms set (in case app was restarted)
        await rescheduleTaskAlarms(parsedTasks);
      } else {
        // Default tasks if none exist
        const defaultTasks = [
          { id: '1', title: 'Read a book', description: 'Read 30 minutes before bed', completed: false, createdAt: new Date().toISOString() },
          { id: '2', title: 'Exercise', description: 'Go for a 30-minute run', completed: true, createdAt: new Date().toISOString() },
          { id: '3', title: 'Meditate', description: '10 minutes of morning meditation', completed: false, createdAt: new Date().toISOString() },
        ];
        setTasks(defaultTasks);
        await saveTasks(defaultTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Reschedule alarms for tasks that have alarms set
  const rescheduleTaskAlarms = async (tasksList) => {
    try {
      for (const task of tasksList) {
        if (task.hasAlarm && task.alarmTime && !task.completed) {
          const alarmDate = new Date(task.alarmTime);
          const now = new Date();
          
          // Only reschedule if alarm is in the future
          if (alarmDate > now) {
            console.log(`Rescheduling alarm for task: ${task.title} at ${alarmDate.toISOString()}`);
            await scheduleTaskAlarm(task.id, task.title, alarmDate, task.description || '');
          } else {
            console.log(`Skipping past alarm for task: ${task.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Error rescheduling alarms:', error);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleAddTask = async (newTask) => {
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    // Schedule alarm if task has one
    if (newTask.hasAlarm && newTask.alarmTime) {
      const alarmDate = new Date(newTask.alarmTime);
      
      // Debug logging
      console.log('TaskList - Scheduling alarm:');
      console.log('Task ID:', newTask.id);
      console.log('Alarm time string:', newTask.alarmTime);
      console.log('Alarm date object:', alarmDate.toISOString());
      console.log('Current time:', new Date().toISOString());
      console.log('Time until alarm (ms):', alarmDate.getTime() - new Date().getTime());
      
      const notificationId = await scheduleTaskAlarm(
        newTask.id, 
        newTask.title, 
        alarmDate,
        newTask.description || ''
      );
      if (notificationId) {
        // Verify the notification was scheduled correctly
        const scheduled = await getAllScheduledNotifications();
        console.log('All scheduled notifications:', scheduled.map(n => ({
          id: n.identifier,
          trigger: n.trigger,
          content: n.content
        })));
        
        const minutesUntil = Math.round((alarmDate.getTime() - new Date().getTime()) / 60000);
        Alert.alert(
          'Alarm Set', 
          `Alarm scheduled for ${formatAlarmTime(newTask.alarmTime)}\n\nNotification will appear in ${minutesUntil} minute(s).`
        );
      } else {
        Alert.alert('Warning', 'Failed to set alarm. Please check notification permissions and ensure the alarm time is in the future.');
      }
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
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
          onPress: async () => {
            // Cancel alarm if exists
            await cancelTaskAlarm(taskId);
            
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            await saveTasks(updatedTasks);
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
        {item.hasAlarm && item.alarmTime && (
          <View style={styles.alarmBadge}>
            <Ionicons name="alarm" size={14} color="#6C63FF" />
            <Text style={styles.alarmText}>
              {formatAlarmTime(item.alarmTime)}
            </Text>
          </View>
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
      
      {/* Test Alarm Button - Remove after testing */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={async () => {
          const testDate = new Date();
          testDate.setSeconds(testDate.getSeconds() + 30); // 30 seconds from now
          
          Alert.alert(
            'Test Alarm',
            `Testing alarm scheduled for 30 seconds from now (${testDate.toLocaleTimeString()}). Please close the app and wait.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Test Now',
                onPress: async () => {
                  const notificationId = await scheduleTaskAlarm(
                    'test-' + Date.now(),
                    'Test Alarm',
                    testDate,
                    'This is a test - should ring in 30 seconds'
                  );
                  
                  if (notificationId) {
                    const scheduled = await getAllScheduledNotifications();
                    console.log('✅ Test alarm scheduled!');
                    console.log('Scheduled notifications:', scheduled.length);
                    
                    Alert.alert(
                      'Test Alarm Scheduled',
                      `Alarm scheduled for 30 seconds from now.\n\nClose the app and wait for the alarm to ring.\n\nCheck console for details.`
                    );
                  } else {
                    Alert.alert('Error', 'Failed to schedule test alarm. Check console for errors.');
                  }
                },
              },
            ]
          );
        }}
      >
        <Text style={styles.testButtonText}>🧪 Test Alarm (30s)</Text>
      </TouchableOpacity>

      {/* Force Full-Screen Now (Android Dev Client) */}
      <TouchableOpacity
        style={[styles.testButton, { bottom: 145, backgroundColor: '#E91E63', shadowColor: '#E91E63' }]}
        onPress={async () => {
          try {
            // Try to show immediately
            const nowId = await triggerAndroidFullScreenNow({
              taskId: 'force-now-' + Date.now(),
              title: 'Force Full-Screen Test',
              description: 'Opening AlarmPopup...',
            });
            if (nowId) return;

            // Fallback: schedule in 2s and ask to lock
            const when = new Date(Date.now() + 2000);
            const id = await scheduleAndroidFullScreenAlarm({
              taskId: 'force-now-' + Date.now(),
              title: 'Force Full-Screen Test',
              description: 'This should open AlarmPopup now',
              date: when,
            });
            if (id) {
              Alert.alert('Full-Screen Test', 'Lock the device immediately. Popup should appear in ~2s.');
            } else {
              Alert.alert('Unavailable', 'Full-screen alarm not available (iOS or Expo Go).');
            }
          } catch (e) {
            console.log('Force full-screen failed', e);
            Alert.alert('Error', 'Failed to trigger full-screen test.');
          }
        }}
      >
        <Text style={styles.testButtonText}>🚀 Force Full-Screen Now</Text>
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
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f0edff',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  alarmText: {
    fontSize: 12,
    color: '#6C63FF',
    marginLeft: 4,
    fontWeight: '600',
  },
  testButton: {
    position: 'absolute',
    right: 25,
    bottom: 95,
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});