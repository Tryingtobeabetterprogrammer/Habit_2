# Alarm System Documentation

## Overview
A complete alarm system for the Habit Tracker app that works like a phone clock alarm, triggering notifications at scheduled task times.

## Features

### ✅ Core Functionality
- **Local Notifications**: Uses Expo Notifications for reliable scheduling
- **Background Support**: Works when app is minimized or closed
- **Sound & Vibration**: Plays sound and vibrates when alarm triggers
- **Task Integration**: Automatically schedules when tasks are added/edited
- **Navigation**: Opens task detail when notification is tapped
- **Persistent**: Alarms reschedule after app restart

### 📱 Notification Features
- **Dedicated Alarm Channel**: Android channel with MAX priority
- **Wake Device**: Wakes device even when sleeping
- **Lock Screen Visibility**: Shows on lock screen
- **Rich Content**: Shows task title and description in notification
- **Visual Feedback**: Highlighted animation when opened from notification

## Usage

### Adding a Task with Alarm

```javascript
import { scheduleTaskAlarm } from './services/alarmService';

// When user adds a task with alarm
const newTask = {
  id: '123',
  title: 'Go for a walk',
  description: '30-minute walk in the park',
  hasAlarm: true,
  alarmTime: '2025-02-11T14:30:00.000Z', // ISO string
};

// Alarm is automatically scheduled in TaskList.js handleAddTask
```

### Helper Functions

```javascript
import {
  getAllTasks,
  getTaskById,
  updateTaskAlarm,
  rescheduleAllAlarms,
  cancelTaskAlarmHelper,
  getTasksWithAlarms,
  formatAlarmTime,
  isValidAlarmTime,
  getMinutesUntilAlarm,
} from './services/alarmHelpers';

// Get all tasks
const tasks = await getAllTasks();

// Get specific task
const task = await getTaskById('task-id');

// Update task alarm
await updateTaskAlarm('task-id', newDate, true);

// Reschedule all alarms (useful after app restart)
await rescheduleAllAlarms();

// Cancel alarm
await cancelTaskAlarmHelper('task-id');

// Get tasks with active alarms
const tasksWithAlarms = await getTasksWithAlarms();

// Format alarm time for display
const formatted = formatAlarmTime('2025-02-11T14:30:00.000Z');

// Check if alarm time is valid
const isValid = isValidAlarmTime('2025-02-11T14:30:00.000Z');

// Get minutes until alarm
const minutes = getMinutesUntilAlarm('2025-02-11T14:30:00.000Z');
```

## Architecture

### Files Structure

```
services/
  ├── alarmService.js      # Core alarm scheduling logic
  └── alarmHelpers.js      # Helper functions for task management

screens/
  ├── AddTask.js           # Task creation with alarm picker
  ├── TaskList.js          # Task list with alarm scheduling
  └── TaskDetail.js        # Task detail with highlight on notification open

App.js                     # Notification listeners and navigation
```

### Key Components

1. **alarmService.js**: 
   - `scheduleTaskAlarm()` - Schedules notification
   - `cancelTaskAlarm()` - Cancels notification
   - `requestNotificationPermissions()` - Handles permissions
   - `formatAlarmTime()` - Formats time for display

2. **alarmHelpers.js**:
   - Task management utilities
   - Alarm rescheduling logic
   - Task retrieval functions

3. **App.js**:
   - Notification received listener
   - Notification tap handler (navigates to task)
   - Navigation reference for deep linking

## Android Permissions

The following permissions are required in `app.json`:

```json
{
  "android": {
    "permissions": [
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "WAKE_LOCK",
      "SCHEDULE_EXACT_ALARM",
      "USE_EXACT_ALARM"
    ]
  }
}
```

## Notification Channel Setup

On Android, a dedicated "alarm" channel is created with:
- **MAX Importance**: Wakes device, plays sound, shows on lock screen
- **Long Vibration Pattern**: `[0, 250, 250, 250, 250, 250, 250, 250]`
- **Public Visibility**: Visible on lock screen
- **Sound Enabled**: Plays default notification sound

## Testing

### Test Alarm Flow

1. **Add Task with Alarm**:
   - Go to Tasks tab
   - Tap + button
   - Enter task title and description
   - Enable alarm toggle
   - Select date and time (2-3 minutes in future for testing)
   - Tap "Add Task"

2. **Verify Scheduling**:
   - Check console logs for "✅ Alarm scheduled successfully!"
   - Should see notification ID and expected trigger time

3. **Wait for Alarm**:
   - Put app in background or close it
   - Wait for scheduled time
   - Alarm should trigger with sound and vibration

4. **Tap Notification**:
   - Tap the notification
   - App should open and navigate to TaskDetail
   - Task should be highlighted with blue banner

## Troubleshooting

### Alarm Not Triggering

1. **Check Permissions**:
   ```javascript
   import { requestNotificationPermissions } from './services/alarmService';
   const hasPermission = await requestNotificationPermissions();
   ```

2. **Verify Scheduling**:
   ```javascript
   import { getAllScheduledNotifications } from './services/alarmService';
   const scheduled = await getAllScheduledNotifications();
   console.log('Scheduled:', scheduled);
   ```

3. **Check Console Logs**:
   - Look for "✅ Alarm scheduled successfully!"
   - Check for any error messages
   - Verify trigger time is in the future

### Notification Not Appearing

- Ensure notification permissions are granted
- Check if Do Not Disturb is enabled
- Verify alarm channel is created (Android)
- Check device notification settings

## Future Enhancements

- [ ] Custom alarm sounds using expo-av
- [ ] Recurring alarms (daily, weekly)
- [ ] Snooze functionality
- [ ] Alarm volume control
- [ ] Multiple alarm types per task

