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
