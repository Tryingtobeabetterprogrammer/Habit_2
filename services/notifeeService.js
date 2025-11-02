import { Platform } from 'react-native';

let notifee = null;

async function loadNotifee() {
  if (notifee) return notifee;
  try {
    // Dynamic import to avoid breaking iOS/Expo Go when not installed
    const mod = await import('@notifee/react-native');
    notifee = mod.default || mod;
    return notifee;
  } catch (e) {
    console.log('Notifee module not available:', e?.message || e);
    return null;
  }
}

export async function initNotifeeAndroid() {
  if (Platform.OS !== 'android') return false;
  const nf = await loadNotifee();
  if (!nf) return false;

  // Create a high-importance channel suitable for alarms
  await nf.createChannel({
    id: 'alarm',
    name: 'Task Alarms',
    importance: 5, // AndroidImportance.HIGH equivalent
    sound: 'default',
    vibration: true,
    bypassDnd: true,
  });

  try {
    // Android 13+ requires runtime notification permission
    await nf.requestPermission();
  } catch (e) {
    console.log('Notifee requestPermission error:', e?.message || e);
  }
  return true;
}

export async function scheduleAndroidFullScreenAlarm({ taskId, title, description = '', date }) {
  if (Platform.OS !== 'android') return null;
  const nf = await loadNotifee();
  if (!nf) return null;

  const fireDate = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!fireDate || fireDate <= Date.now()) return null;

  await initNotifeeAndroid();

  // Ensure heads-up + full-screen intent
  const notificationId = await nf.createTriggerNotification(
    {
      id: `alarm-${taskId}`,
      title: '⏰ Time to Do Your Task!',
      body: description ? `NOW: ${title}\n${description}` : `NOW: ${title}\nIt's time to complete this task!`,
      android: {
        channelId: 'alarm',
        // Highest visibility to show while locked
        importance: 5,
        category: 'alarm',
        visibility: 1,
        sound: 'default',
        vibrationPattern: [0, 500, 500, 500, 500, 500],
        // Full-screen intent forces an activity to open
        fullScreenAction: {
          id: 'default',
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        // Extra to pass task context
        extras: { taskId, taskTitle: title, type: 'alarm' },
      },
      data: { taskId, taskTitle: title, type: 'alarm' },
    },
    {
      type: nf.TriggerType.TIMESTAMP,
      timestamp: fireDate,
      alarmManager: {
        allowWhileIdle: true,
      },
    }
  );

  return notificationId;
}

// Fire an immediate full-screen notification (use when user just locked the device)
export async function triggerAndroidFullScreenNow({ taskId, title, description = '' }) {
  if (Platform.OS !== 'android') return null;
  const nf = await loadNotifee();
  if (!nf) return null;

  await initNotifeeAndroid();
  try {
    const id = await nf.displayNotification({
      id: `alarm-now-${taskId}`,
      title: '⏰ ' + (title || 'Alarm'),
      body: description || 'It\'s time! Opening alarm...',
      android: {
        channelId: 'alarm',
        importance: 5,
        category: 'alarm',
        visibility: 1,
        sound: 'default',
        vibrationPattern: [0, 500, 500, 500, 500, 500],
        fullScreenAction: { id: 'default' },
        pressAction: { id: 'default', launchActivity: 'default' },
        extras: { taskId, taskTitle: title, type: 'alarm' },
      },
      data: { taskId, taskTitle: title, type: 'alarm' },
    });
    return id;
  } catch (e) {
    console.log('triggerAndroidFullScreenNow error:', e?.message || e);
    throw e;
  }
}

export async function wireNotifeeListeners(navigateToPopup) {
  const nf = await loadNotifee();
  if (!nf) return false;

  // Foreground events (press, dismiss, etc.)
  nf.onForegroundEvent(async ({ type, detail }) => {
    if (detail?.notification?.data?.type === 'alarm' && detail?.pressAction) {
      const { taskId, taskTitle } = detail.notification.data || {};
      if (taskId) navigateToPopup({ taskId, taskTitle });
    }
  });

  // App launched by tapping alarm notification or full-screen intent
  const initial = await nf.getInitialNotification();
  if (initial?.notification?.data?.type === 'alarm') {
    const { taskId, taskTitle } = initial.notification.data || {};
    if (taskId) navigateToPopup({ taskId, taskTitle });
  }
  return true;
}
