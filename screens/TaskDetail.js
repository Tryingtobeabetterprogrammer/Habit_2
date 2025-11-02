import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatAlarmTime } from '../services/alarmService';

export default function TaskDetail({ route }) {
  const { task, highlighted } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Highlight animation if opened from notification
  useEffect(() => {
    if (highlighted) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [highlighted]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {highlighted && (
          <View style={styles.highlightBanner}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.highlightText}>Opened from alarm notification</Text>
          </View>
        )}
        <Text style={styles.title}>{task.title}</Text>
        
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'time-outline'}
              size={24}
              color={task.completed ? '#4CAF50' : '#FF9800'}
            />
            <Text style={[styles.statusText, task.completed && styles.completedStatus]}>
              {task.completed ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>

        {task.hasAlarm && task.alarmTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alarm</Text>
            <View style={styles.alarmContainer}>
              <Ionicons name="alarm" size={24} color="#6C63FF" />
              <View style={styles.alarmInfo}>
                <Text style={styles.alarmTime}>{formatAlarmTime(task.alarmTime)}</Text>
                <Text style={styles.alarmSubtext}>
                  {new Date(task.alarmTime) > new Date() ? 'Scheduled' : 'Past'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {task.createdAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Created</Text>
            <Text style={styles.createdDate}>
              {new Date(task.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#FF9800',
    fontWeight: '600',
  },
  completedStatus: {
    color: '#4CAF50',
  },
  alarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  alarmInfo: {
    marginLeft: 15,
    flex: 1,
  },
  alarmTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 4,
  },
  alarmSubtext: {
    fontSize: 14,
    color: '#888',
  },
  createdDate: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  highlightBanner: {
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  highlightText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});