import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTask({ navigation, route }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  // Function to get a future date/time (1 hour from now)
  const getDefaultDateTime = () => {
    const now = new Date();
    // Set to next hour as a reasonable default
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);
    return nextHour;
  };
  
  // Initialize with null - will be set when alarm is enabled
  const [alarmDate, setAlarmDate] = useState(null);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasAlarm, setHasAlarm] = useState(false);

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    // Get alarm date/time - alarmDate already contains both date and time since they're synchronized
    let alarmDateTime = null;
    if (hasAlarm) {
      // Ensure we have valid date/time values
      if (!alarmDate || !alarmTime) {
        Alert.alert('Error', 'Please select both date and time for the alarm.');
        return;
      }
      
      // Create a new date object from alarmDate to ensure we have a clean date
      const alarmDateTimeObj = new Date(alarmDate);
      alarmDateTimeObj.setSeconds(0);
      alarmDateTimeObj.setMilliseconds(0);

      // Check if alarm is in the future (with a small buffer to account for processing time)
      const now = new Date();
      const minFutureTime = new Date(now.getTime() + 10000); // 10 seconds in the future
      
      if (alarmDateTimeObj <= minFutureTime) {
        Alert.alert('Error', 'Alarm time must be at least 10 seconds in the future. Please select a later date and time.');
        return;
      }
      
      console.log('AddTask - Setting alarm for:', alarmDateTimeObj.toISOString());
      console.log('AddTask - Current time:', now.toISOString());
      console.log('AddTask - Time difference (ms):', alarmDateTimeObj.getTime() - now.getTime());
      console.log('AddTask - Time difference (minutes):', (alarmDateTimeObj.getTime() - now.getTime()) / 60000);
      
      alarmDateTime = alarmDateTimeObj.toISOString();
    }

    // Pass the new task back to TaskList
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      completed: false,
      createdAt: new Date().toISOString(),
      alarmTime: alarmDateTime,
      hasAlarm: hasAlarm
    };

    // Pass the new task back to the previous screen
    route.params.onAddTask(newTask);
    navigation.goBack();
  };

  const formatDateTime = () => {
    if (!hasAlarm || !alarmDate) return 'Not set';
    // Use alarmDate which now contains both date and time
    return alarmDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: alarmDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <Text style={styles.label}>Task Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task title"
          value={taskTitle}
          onChangeText={setTaskTitle}
          autoFocus
        />
        
        <Text style={[styles.label, { marginTop: 20 }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Enter task description"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          numberOfLines={4}
        />

        {/* Alarm Section */}
        <View style={styles.alarmSection}>
          <View style={styles.alarmHeader}>
            <Text style={styles.label}>Set Alarm (Optional)</Text>
            <TouchableOpacity
              onPress={() => {
                if (!hasAlarm) {
                  // When enabling alarm, always set default to 1 hour from NOW (not from component mount)
                  const defaultTime = getDefaultDateTime();
                  console.log('Enabling alarm with default time:', defaultTime.toISOString());
                  setAlarmDate(defaultTime);
                  setAlarmTime(defaultTime);
                  setHasAlarm(true);
                } else {
                  // Disabling alarm
                  setHasAlarm(false);
                }
              }}
              style={styles.toggleButton}
            >
              <Ionicons
                name={hasAlarm ? 'notifications' : 'notifications-outline'}
                size={24}
                color={hasAlarm ? '#6C63FF' : '#ccc'}
              />
            </TouchableOpacity>
          </View>

          {hasAlarm && (
            <View style={styles.alarmControls}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6C63FF" />
                <Text style={styles.dateTimeText}>
                  {alarmDate ? alarmDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Select date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6C63FF" />
                <Text style={styles.dateTimeText}>
                  {alarmTime ? alarmTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }) : 'Select time'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.alarmPreview}>
                Alarm: {formatDateTime()}
              </Text>
            </View>
          )}

          {/* Date Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.modalConfirm}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  {alarmDate && (
                    <DateTimePicker
                      value={alarmDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate && alarmTime) {
                          // Keep the selected time but update the date
                          const updatedDate = new Date(selectedDate);
                          updatedDate.setHours(alarmTime.getHours());
                          updatedDate.setMinutes(alarmTime.getMinutes());
                          updatedDate.setSeconds(0);
                          updatedDate.setMilliseconds(0);
                          
                          setAlarmDate(updatedDate);
                          setAlarmTime(updatedDate); // Keep them in sync
                        }
                      }}
                      minimumDate={new Date()}
                      style={styles.iosPicker}
                    />
                  )}
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && alarmDate && (
              <DateTimePicker
                value={alarmDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type !== 'dismissed' && selectedDate && alarmTime) {
                    // Keep the selected time but update the date
                    const updatedDate = new Date(selectedDate);
                    updatedDate.setHours(alarmTime.getHours());
                    updatedDate.setMinutes(alarmTime.getMinutes());
                    updatedDate.setSeconds(0);
                    updatedDate.setMilliseconds(0);
                    
                    setAlarmDate(updatedDate);
                    setAlarmTime(updatedDate); // Keep them in sync
                  }
                }}
                minimumDate={new Date()}
              />
            )
          )}

          {/* Time Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showTimePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowTimePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.modalCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Time</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={styles.modalConfirm}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  {alarmTime && (
                    <DateTimePicker
                      value={alarmTime}
                      mode="time"
                      display="spinner"
                      onChange={(event, selectedTime) => {
                        if (selectedTime && alarmDate) {
                          // Keep the selected date but update the time
                          const updatedTime = new Date(alarmDate);
                          updatedTime.setHours(selectedTime.getHours());
                          updatedTime.setMinutes(selectedTime.getMinutes());
                          updatedTime.setSeconds(0);
                          updatedTime.setMilliseconds(0);
                          
                          setAlarmTime(updatedTime);
                          setAlarmDate(updatedTime); // Keep them in sync
                        }
                      }}
                      style={styles.iosPicker}
                    />
                  )}
                </View>
              </View>
            </Modal>
          ) : (
            showTimePicker && alarmTime && (
              <DateTimePicker
                value={alarmTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (event.type !== 'dismissed' && selectedTime && alarmDate) {
                    // Keep the selected date but update the time
                    const updatedTime = new Date(alarmDate);
                    updatedTime.setHours(selectedTime.getHours());
                    updatedTime.setMinutes(selectedTime.getMinutes());
                    updatedTime.setSeconds(0);
                    updatedTime.setMilliseconds(0);
                    
                    setAlarmTime(updatedTime);
                    setAlarmDate(updatedTime); // Keep them in sync
                  }
                }}
              />
            )
          )}
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alarmSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    padding: 5,
  },
  alarmControls: {
    marginTop: 10,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  alarmPreview: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#6C63FF',
    color: '#fff',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalConfirm: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});