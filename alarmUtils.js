/**
 * Alarm Utilities
 * Handles notification permissions, scheduling, and alarm management
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler for alarm-like behavior
// Note: This is also set in alarmService.js - the last call takes precedence
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.type === 'alarm';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true, // Always play sound for alarms
      shouldSetBadge: true,
      // For alarms, make them more prominent
      ...(isAlarm && {
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    };
  },
});

const ALARM_STORAGE_KEY = '@habit_scheduled_alarms';

/**
 * Requests and checks notification permissions
 * Automatically enables Android notification channel with high importance, default sound, and vibration
 * @returns {Promise<boolean>} True if permissions granted, false otherwise
 */
export async function requestNotificationPermission() {
  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permissions not granted');
      return false;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      // Create alarm channel with high importance
      await Notifications.setNotificationChannelAsync('alarm', {
        name: 'Task Alarms',
        description: 'Alarms for scheduled tasks',
        importance: Notifications.AndroidImportance.HIGH, // High importance
        sound: 'default', // Default sound
        vibrationPattern: [0, 250, 250, 250, 250, 250, 250, 250], // Vibration pattern
        lightColor: '#6C63FF',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Also create a default channel for other notifications
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedules an alarm at the specified time
 * Works even when app is closed
 * @param {Object} params - Alarm parameters
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body text
 * @param {Date|string|number} params.time - Date object, ISO string, or timestamp when alarm should trigger
 * @param {Object} [params.data] - Additional data to pass with notification
 * @returns {Promise<string|null>} Notification identifier or null if failed
 */
export async function scheduleAlarm({ title, body, time, data = {} }) {
  try {
    // Ensure permissions are granted
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.error('❌ Cannot schedule alarm: permissions not granted');
      return null;
    }

    // Convert time to Date object
    const alarmDate = time instanceof Date ? time : new Date(time);
    const now = new Date();

    // Validate time is in the future
    if (alarmDate <= now) {
      console.error('❌ Cannot schedule alarm: time must be in the future');
      return null;
    }

    // Calculate seconds from now
    const secondsFromNow = Math.max(1, Math.floor((alarmDate.getTime() - now.getTime()) / 1000));

    console.log('📅 Scheduling alarm:');
    console.log('   Title:', title);
    console.log('   Body:', body);
    console.log('   Time:', alarmDate.toLocaleString());
    console.log('   Seconds from now:', secondsFromNow);

    // Ensure alarm channel exists (Android)
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: 'Task Alarms',
          description: 'Alarms for scheduled tasks',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250, 250, 250, 250, 250],
          lightColor: '#6C63FF',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (channelError) {
        console.warn('Note: Alarm channel setup warning:', channelError);
      }
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title ? `⏰ ${title}` : '⏰ Time to Do Your Task!',
        body: body || 'It\'s time to complete your task!',
        sound: true, // Play sound
        priority: Notifications.AndroidNotificationPriority.MAX, // Maximum priority for alarm-like behavior
        data: {
          ...data,
          type: 'alarm',
          scheduledTime: alarmDate.toISOString(),
        },
        // Android-specific settings
        ...(Platform.OS === 'android' && {
          channelId: 'alarm',
          vibrate: [0, 250, 250, 250, 250, 250, 250, 250], // Long vibration pattern
        }),
      },
      trigger: {
        seconds: secondsFromNow, // Use seconds-based trigger for reliability
      },
    });

    if (!notificationId) {
      throw new Error('Notification scheduling returned null/undefined ID');
    }

    // Store alarm mapping
    try {
      const existing = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
      const mappings = existing ? JSON.parse(existing) : {};
      mappings[notificationId] = {
        title,
        body,
        time: alarmDate.toISOString(),
        ...data,
      };
      await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(mappings));
    } catch (storageError) {
      console.warn('Warning: Could not store alarm mapping:', storageError);
    }

    console.log('✅ Alarm scheduled successfully!');
    console.log('   Notification ID:', notificationId);
    console.log('   Will trigger at:', alarmDate.toLocaleString());

    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling alarm:', error);
    return null;
  }
}

/**
 * Cancels all scheduled alarms
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function cancelAllAlarms() {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Clear stored alarm mappings
    await AsyncStorage.removeItem(ALARM_STORAGE_KEY);

    console.log('✅ All alarms cancelled');
    return true;
  } catch (error) {
    console.error('❌ Error cancelling all alarms:', error);
    return false;
  }
}

/**
 * Gets all scheduled alarms
 * @returns {Promise<Array>} Array of scheduled notifications
 */
export async function getAllScheduledAlarms() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled || [];
  } catch (error) {
    console.error('Error getting scheduled alarms:', error);
    return [];
  }
}

/**
 * Cancels a specific alarm by notification ID
 * @param {string} notificationId - Notification identifier
 * @returns {Promise<boolean>} True if successful
 */
export async function cancelAlarm(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    
    // Remove from storage
    const existing = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
    if (existing) {
      const mappings = JSON.parse(existing);
      delete mappings[notificationId];
      await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(mappings));
    }

    console.log('✅ Alarm cancelled:', notificationId);
    return true;
  } catch (error) {
    console.error('Error cancelling alarm:', error);
    return false;
  }
}

/**
 * Checks if notification permissions are granted
 * @returns {Promise<boolean>} True if permissions granted
 */
export async function hasNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

