/**
 * Alarm Helper Functions
 * Utility functions for managing task alarms
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskAlarm, cancelTaskAlarm, formatAlarmTime } from './alarmService';

const TASKS_STORAGE_KEY = '@habit_tasks';

/**
 * Get all tasks from storage
 */
export async function getAllTasks() {
  try {
    const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

/**
 * Get a specific task by ID
 */
export async function getTaskById(taskId) {
  try {
    const tasks = await getAllTasks();
    return tasks.find(task => task.id === taskId);
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

/**
 * Update task alarm
 */
export async function updateTaskAlarm(taskId, alarmTime, hasAlarm) {
  try {
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Cancel existing alarm
    if (task.hasAlarm) {
      await cancelTaskAlarm(taskId);
    }

    // Update task
    task.hasAlarm = hasAlarm;
    task.alarmTime = alarmTime ? new Date(alarmTime).toISOString() : null;

    // Schedule new alarm if needed
    if (hasAlarm && alarmTime) {
      const alarmDate = new Date(alarmTime);
      const now = new Date();
      
      if (alarmDate > now) {
        await scheduleTaskAlarm(taskId, task.title, alarmDate, task.description || '');
      }
    }

    // Save updated tasks
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    
    return task;
  } catch (error) {
    console.error('Error updating task alarm:', error);
    throw error;
  }
}

/**
 * Reschedule all future alarms (useful after app restart)
 */
export async function rescheduleAllAlarms() {
  try {
    const tasks = await getAllTasks();
    const now = new Date();
    
    for (const task of tasks) {
      if (task.hasAlarm && task.alarmTime && !task.completed) {
        const alarmDate = new Date(task.alarmTime);
        
        if (alarmDate > now) {
          console.log(`Rescheduling alarm for task: ${task.title}`);
          await scheduleTaskAlarm(task.id, task.title, alarmDate, task.description || '');
        }
      }
    }
    
    return { scheduled: tasks.filter(t => t.hasAlarm && !t.completed).length };
  } catch (error) {
    console.error('Error rescheduling alarms:', error);
    return { scheduled: 0, error };
  }
}

/**
 * Cancel alarm for a task
 */
export async function cancelTaskAlarmHelper(taskId) {
  try {
    const tasks = await getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.hasAlarm) {
      await cancelTaskAlarm(taskId);
      task.hasAlarm = false;
      task.alarmTime = null;
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
    
    return true;
  } catch (error) {
    console.error('Error canceling task alarm:', error);
    return false;
  }
}

/**
 * Get tasks with alarms scheduled
 */
export async function getTasksWithAlarms() {
  try {
    const tasks = await getAllTasks();
    const now = new Date();
    
    return tasks.filter(task => {
      if (!task.hasAlarm || !task.alarmTime || task.completed) {
        return false;
      }
      return new Date(task.alarmTime) > now;
    });
  } catch (error) {
    console.error('Error getting tasks with alarms:', error);
    return [];
  }
}

/**
 * Format alarm time for display
 */
export { formatAlarmTime };

/**
 * Check if alarm time is valid (in the future)
 */
export function isValidAlarmTime(alarmTime) {
  if (!alarmTime) return false;
  const alarmDate = new Date(alarmTime);
  const now = new Date();
  return alarmDate > now;
}

/**
 * Get time until alarm in minutes
 */
export function getMinutesUntilAlarm(alarmTime) {
  if (!alarmTime) return null;
  const alarmDate = new Date(alarmTime);
  const now = new Date();
  const diff = alarmDate.getTime() - now.getTime();
  return Math.floor(diff / 60000); // Convert to minutes
}

