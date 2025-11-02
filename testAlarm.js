/**
 * Test Alarm Script
 * Use this to debug alarm scheduling issues
 * 
 * Run this in your app console or create a test button that calls these functions
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { scheduleTaskAlarm, getAllScheduledNotifications, requestNotificationPermissions } from './services/alarmService';

/**
 * Test alarm scheduling - schedules an alarm for 1 minute from now
 */
export async function testAlarm1Minute() {
  try {
    console.log('🧪 Testing alarm scheduling...');
    
    // Check permissions first
    const hasPermission = await requestNotificationPermissions();
    console.log('Permissions:', hasPermission);
    
    if (!hasPermission) {
      console.error('❌ Permissions not granted!');
      return false;
    }
    
    // Schedule alarm for 1 minute from now
    const testDate = new Date();
    testDate.setMinutes(testDate.getMinutes() + 1);
    testDate.setSeconds(0);
    testDate.setMilliseconds(0);
    
    console.log('Scheduling test alarm for:', testDate.toLocaleString());
    console.log('Current time:', new Date().toLocaleString());
    
    const notificationId = await scheduleTaskAlarm(
      'test-task-' + Date.now(),
      'Test Alarm',
      testDate,
      'This is a test alarm - should ring in 1 minute'
    );
    
    if (notificationId) {
      console.log('✅ Test alarm scheduled! ID:', notificationId);
      
      // Verify it's scheduled
      await new Promise(resolve => setTimeout(resolve, 2000));
      const scheduled = await getAllScheduledNotifications();
      console.log('📋 Scheduled notifications:', scheduled.length);
      
      const found = scheduled.find(n => n.identifier === notificationId);
      if (found) {
        console.log('✅ Alarm found in scheduled list:', found);
        return true;
      } else {
        console.warn('⚠️ Alarm not found in scheduled list, but ID was returned');
        return false;
      }
    } else {
      console.error('❌ Failed to schedule test alarm');
      return false;
    }
  } catch (error) {
    console.error('❌ Test alarm error:', error);
    return false;
  }
}

/**
 * Check current notification settings
 */
export async function checkNotificationSettings() {
  try {
    console.log('📋 Checking notification settings...');
    
    // Check permissions
    const permissions = await Notifications.getPermissionsAsync();
    console.log('Permissions:', permissions);
    
    // Check scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Total scheduled:', scheduled.length);
    
    if (scheduled.length > 0) {
      console.log('Scheduled notifications:');
      scheduled.forEach((n, i) => {
        console.log(`  ${i + 1}. ID: ${n.identifier}`);
        console.log(`     Title: ${n.content.title}`);
        if (n.trigger) {
          if (n.trigger.seconds !== undefined) {
            const triggerTime = new Date(Date.now() + n.trigger.seconds * 1000);
            console.log(`     Will trigger in ${n.trigger.seconds}s (${triggerTime.toLocaleString()})`);
          } else if (n.trigger.value) {
            console.log(`     Will trigger at: ${new Date(n.trigger.value).toLocaleString()}`);
          }
        }
      });
    }
    
    // Check Android channel (if Android)
    if (Platform.OS === 'android') {
      try {
        const channels = await Notifications.getNotificationChannelsAsync();
        console.log('Android notification channels:', channels?.length || 0);
        
        if (channels) {
          const alarmChannel = channels.find(c => c.id === 'alarm');
          if (alarmChannel) {
            console.log('Alarm channel:', {
              id: alarmChannel.id,
              importance: alarmChannel.importance,
              name: alarmChannel.name,
            });
          } else {
            console.warn('⚠️ Alarm channel not found!');
          }
        }
      } catch (e) {
        console.warn('Could not check channels:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking settings:', error);
    return false;
  }
}

