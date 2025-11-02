import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getTaskById, updateTaskAlarm } from '../services/alarmHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@habit_tasks';

export default function AlarmPopup() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId, taskTitle } = route.params || {};

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Start vibrating on mount (repeat) until user acts or popup closes
    const pattern = [0, 500, 500, 500, 500, 500];
    try {
      Vibration.vibrate(pattern, true);
    } catch (e) {
      // no-op
    }
    (async () => {
      try {
        const t = taskId ? await getTaskById(taskId) : null;
        if (mounted) {
          setTask(t || null);
        }
      } catch (e) {
        console.error('Error loading task for alarm popup:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      try { Vibration.cancel(); } catch (_) {}
    };
  }, [taskId]);

  const close = () => navigation.goBack();

  const snoozeMinutes = async (mins) => {
    try {
      const base = new Date();
      base.setMinutes(base.getMinutes() + mins);
      base.setSeconds(0);
      base.setMilliseconds(0);

      await updateTaskAlarm(taskId, base.toISOString(), true);
      try { Vibration.cancel(); } catch (_) {}
      Alert.alert('Snoozed', `Alarm snoozed for ${mins} minutes.`);
      close();
    } catch (e) {
      console.error('Snooze failed', e);
      Alert.alert('Error', 'Failed to snooze alarm.');
    }
  };

  const markComplete = async () => {
    try {
      const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const tasks = stored ? JSON.parse(stored) : [];
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        tasks[idx].completed = true;
        tasks[idx].hasAlarm = false;
        tasks[idx].alarmTime = null;
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      }
      try { Vibration.cancel(); } catch (_) {}
      Alert.alert('Great!', 'Task marked as completed.');
      close();
    } catch (e) {
      console.error('Mark complete failed', e);
      Alert.alert('Error', 'Failed to update task.');
    }
  };

  const openTask = () => {
    try { Vibration.cancel(); } catch (_) {}
    if (task) {
      navigation.navigate('TasksTab', {
        screen: 'TaskDetail',
        params: { task, highlighted: true },
      });
      close();
    } else {
      navigation.navigate('TasksTab');
      close();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="alarm" size={22} color="#fff" />
          <Text style={styles.headerText}>It's time!</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Loading task...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>{task?.title || taskTitle || 'Scheduled Task'}</Text>
            {task?.description ? (
              <Text style={styles.description}>{task.description}</Text>
            ) : null}

            <View style={styles.actionsPrimary}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={openTask}>
                <Ionicons name="open-outline" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Open Task</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={markComplete}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}>Mark Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsSecondary}>
              <TouchableOpacity style={[styles.btnOutline]} onPress={() => snoozeMinutes(5)}>
                <Text style={styles.btnOutlineText}>Snooze 5m</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnOutline]} onPress={() => snoozeMinutes(10)}>
                <Text style={styles.btnOutlineText}>Snooze 10m</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnGhost]} onPress={close}>
                <Text style={styles.btnGhostText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionsPrimary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionsSecondary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  btnPrimary: {
    backgroundColor: '#6C63FF',
  },
  btnSuccess: {
    backgroundColor: '#4CAF50',
    marginRight: 0,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  btnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  btnOutlineText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  btnGhost: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  btnGhostText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
