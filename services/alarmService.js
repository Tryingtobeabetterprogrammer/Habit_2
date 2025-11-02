import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAndroidFullScreenAlarm } from './notifeeService';

// Configure notification handler for alarm-like behavior
// CRITICAL: This handler must always return true to allow notifications to show
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Always show notifications, especially alarms
    const isAlarm = notification.request.content.data?.type === 'alarm';
    
    console.log('📬 Notification handler called:', {
      isAlarm,
      title: notification.request.content.title,
      type: notification.request.content.data?.type,
    });
    
    // For alarms, always show, play sound, and set badge
    if (isAlarm) {
      console.log('⏰ Alarm notification - allowing to show');
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      };
    }
    
    // For other notifications, also allow them
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const NOTIFICATIONS_KEY = '@habit_alarms';
const SCHEDULED_NOTIFICATIONS_KEY = '@habit_scheduled_alarms';

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      // Create a dedicated alarm channel with maximum priority
      // CRITICAL: Use MAX importance to ensure alarms wake device and play sound
      await Notifications.setNotificationChannelAsync('alarm', {
        name: 'Task Alarms',
        description: 'Alarms for scheduled tasks',
        importance: Notifications.AndroidImportance.MAX, // CRITICAL: MAX wakes device
        vibrationPattern: [0, 250, 250, 250, 250, 250, 250, 250, 250, 250], // Long vibration
        lightColor: '#6C63FF',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        // Note: MAX importance should be sufficient to wake device and play sound
      });
      
      // Also keep default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for a task
 * @param {string} taskId - Unique task ID
 * @param {string} taskTitle - Task title
 * @param {Date} alarmTime - When to trigger the alarm
 * @param {string} [taskDescription] - Optional task description
 * @returns {Promise<string|null>} Notification identifier or null if failed
 */
export async function scheduleTaskAlarm(taskId, taskTitle, alarmTime, taskDescription = '') {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Ensure alarmTime is a Date object
    const alarmDateObj = alarmTime instanceof Date ? alarmTime : new Date(alarmTime);
    
    // Check if alarm time is in the future
    const now = new Date();
    const timeUntilAlarm = alarmDateObj.getTime() - now.getTime();
    
    console.log('scheduleTaskAlarm - Scheduling notification:');
    console.log('Task ID:', taskId);
    console.log('Alarm time:', alarmDateObj.toISOString());
    console.log('Current time:', now.toISOString());
    console.log('Time until alarm (ms):', timeUntilAlarm);
    console.log('Time until alarm (minutes):', timeUntilAlarm / 60000);
    
    if (alarmDateObj <= now) {
      console.warn('Alarm time must be in the future. Alarm time:', alarmDateObj.toISOString(), 'Current time:', now.toISOString());
      return null;
    }

    // Cancel any existing notification for this task
    await cancelTaskAlarm(taskId);

    // Android path: Prefer Notifee full-screen alarm if available
    if (Platform.OS === 'android') {
      try {
        const notifeeId = await scheduleAndroidFullScreenAlarm({
          taskId,
          title: taskTitle,
          description: taskDescription,
          date: alarmDateObj,
        });
        if (notifeeId) {
          await storeAlarmMapping(taskId, notifeeId);
          console.log('📱 Notifee full-screen alarm scheduled. ID:', notifeeId);
          return notifeeId;
        }
      } catch (e) {
        console.warn('Notifee schedule failed or unavailable. Falling back to expo-notifications.', e);
      }
      // Ensure expo channel exists for fallback
      try {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: 'Task Alarms',
          description: 'Alarms for scheduled tasks',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250, 250, 250, 250, 250, 250, 250],
          lightColor: '#6C63FF',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (_) {}
    }

    // Schedule the notification with alarm-like behavior
    console.log('📅 Scheduling alarm notification:');
    console.log('   Target date:', alarmDateObj.toISOString());
    console.log('   Target date (local):', alarmDateObj.toLocaleString());
    console.log('   Current date:', now.toISOString());
    console.log('   Current date (local):', now.toLocaleString());
    const secondsFromNow = Math.max(1, Math.floor((alarmDateObj.getTime() - now.getTime()) / 1000));
    console.log('   Seconds from now:', secondsFromNow);
    console.log('   Minutes from now:', Math.round(secondsFromNow / 60));
    
    let notificationId;
    try {
      // CRITICAL: Always use Date trigger for alarms - it's more reliable
      // Seconds trigger can fail when app is closed/backgrounded
      const notificationContent = {
        title: '⏰ Time to Do Your Task!',
        body: taskDescription 
          ? `NOW: ${taskTitle}\n${taskDescription}` 
          : `NOW: ${taskTitle}\nIt's time to complete this task!`,
        sound: true, // CRITICAL: Play sound
        priority: Notifications.AndroidNotificationPriority.MAX, // MAX priority
        data: { 
          taskId, 
          taskTitle,
          taskDescription: taskDescription || '',
          type: 'alarm', // Mark as alarm type
        },
        // Android-specific alarm settings
        ...(Platform.OS === 'android' && {
          channelId: 'alarm', // Use dedicated alarm channel
          vibrate: [0, 250, 250, 250, 250, 250, 250, 250, 250, 250], // Long vibration
        }),
      };
      
      console.log(`📅 Scheduling with Date trigger for maximum reliability`);
      console.log(`   Target time: ${alarmDateObj.toLocaleString()}`);
      console.log(`   Current time: ${now.toLocaleString()}`);
      
      // CRITICAL: Use Date trigger - it's more reliable for alarms
      // This works even when app is closed
      notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: alarmDateObj, // Always use Date object - more reliable
      });
      
      if (!notificationId) {
        throw new Error('Notification scheduling returned null/undefined ID');
      }
      
      console.log('📱 Alarm notification scheduled successfully. ID:', notificationId);
    } catch (scheduleError) {
      console.error('❌ Error during scheduleNotificationAsync:', scheduleError);
      console.error('Error details:', JSON.stringify(scheduleError, null, 2));
      
      // Fallback: Try with Date object directly
      try {
        console.log('🔄 Attempting fallback with Date object trigger...');
        const fallbackContent = {
          title: '⏰ Time to Do Your Task!',
          body: taskDescription 
            ? `NOW: ${taskTitle}\n${taskDescription}` 
            : `NOW: ${taskTitle}\nIt's time to complete this task!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { 
            taskId, 
            taskTitle,
            taskDescription: taskDescription || '',
            type: 'alarm' 
          },
          ...(Platform.OS === 'android' && {
            channelId: 'alarm',
            vibrate: [0, 250, 250, 250, 250, 250, 250, 250, 250, 250],
          }),
        };
        
        notificationId = await Notifications.scheduleNotificationAsync({
          content: fallbackContent,
          trigger: alarmDateObj, // Pass Date object directly
        });
        console.log('✅ Fallback succeeded. ID:', notificationId);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw scheduleError;
      }
    }
    
    // Verify the notification was scheduled
    // Note: There can be a delay before the notification appears in the scheduled list
    try {
      // Wait longer for the system to update (especially on Android)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Total scheduled notifications: ${scheduled.length}`);
      
      if (scheduled.length > 0) {
        console.log('📝 All scheduled notification IDs:', scheduled.map(n => n.identifier));
      }
      
      const thisNotification = scheduled.find(n => n.identifier === notificationId);
      if (thisNotification) {
        console.log('✅ Notification verified as scheduled:');
        console.log('   Notification ID:', notificationId);
        if (thisNotification.trigger) {
          if (thisNotification.trigger.seconds !== undefined) {
            const minutesUntil = Math.round(thisNotification.trigger.seconds / 60);
            console.log('   Trigger seconds from now:', thisNotification.trigger.seconds);
            console.log('   Minutes until trigger:', minutesUntil);
            console.log('   Expected trigger time:', new Date(now.getTime() + thisNotification.trigger.seconds * 1000).toLocaleString());
          } else if (thisNotification.trigger.value) {
            const triggerDate = new Date(thisNotification.trigger.value);
            const minutesUntil = (triggerDate.getTime() - now.getTime()) / 60000;
            console.log('   Trigger date:', triggerDate.toISOString());
            console.log('   Trigger date (local):', triggerDate.toLocaleString());
            console.log('   Minutes until trigger:', Math.round(minutesUntil));
          }
          console.log('   Trigger type:', thisNotification.trigger.type || 'seconds');
        }
        console.log('   Content:', thisNotification.content);
      } else {
        console.warn('⚠️ Notification ID returned but not found in scheduled list');
        console.warn('   This may indicate a scheduling issue. Trying alternative verification...');
        
        // Try checking again after a longer delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        const scheduled2 = await Notifications.getAllScheduledNotificationsAsync();
        const found = scheduled2.find(n => n.identifier === notificationId);
        
        if (found) {
          console.log('✅ Notification found on retry!');
        } else {
          console.error('❌ Notification still not found after retry.');
          console.error('   This suggests the notification may not have been scheduled properly.');
          console.error('   However, it might still trigger at the scheduled time.');
        }
      }
    } catch (verifyError) {
      console.error('Error verifying notification:', verifyError);
      // Don't fail the whole operation if verification fails
    }

    // Store the mapping
    await storeAlarmMapping(taskId, notificationId);

    console.log(`✅ Alarm scheduled successfully!`);
    console.log(`   Notification ID: ${notificationId}`);
    console.log(`   Task: ${taskTitle}`);
    console.log(`   Scheduled for: ${alarmDateObj.toLocaleString()}`);
    console.log(`   ISO String: ${alarmDateObj.toISOString()}`);
    
    // Even if verification failed, return the ID since the API call succeeded
    return notificationId;
  } catch (error) {
    console.error('Error scheduling alarm:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification for a task
 * @param {string} taskId - Task ID
 */
export async function cancelTaskAlarm(taskId) {
  try {
    const notificationId = await getNotificationIdForTask(taskId);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await removeAlarmMapping(taskId);
      console.log(`❌ Alarm cancelled for task ${taskId}`);
    }
  } catch (error) {
    console.error('Error cancelling alarm:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllAlarms() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
    console.log('❌ All alarms cancelled');
  } catch (error) {
    console.error('Error cancelling all alarms:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Store mapping between task ID and notification ID
 */
async function storeAlarmMapping(taskId, notificationId) {
  try {
    const existing = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const mappings = existing ? JSON.parse(existing) : {};
    mappings[taskId] = notificationId;
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error storing alarm mapping:', error);
  }
}

/**
 * Get notification ID for a task
 */
async function getNotificationIdForTask(taskId) {
  try {
    const existing = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const mappings = existing ? JSON.parse(existing) : {};
    return mappings[taskId] || null;
  } catch (error) {
    console.error('Error getting alarm mapping:', error);
    return null;
  }
}

/**
 * Remove alarm mapping for a task
 */
async function removeAlarmMapping(taskId) {
  try {
    const existing = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const mappings = existing ? JSON.parse(existing) : {};
    delete mappings[taskId];
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error removing alarm mapping:', error);
  }
}

/**
 * Format date and time for display
 */
export function formatAlarmTime(date) {
  if (!date) return 'Not set';
  
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  
  // Format time
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  // Format date
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  
  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  } else {
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    return `${dateStr} at ${timeStr}`;
  }
}

