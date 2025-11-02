# Troubleshooting Alarm Not Ringing

## Common Issues and Solutions

### 1. Check Notification Permissions
**Problem**: Alarms won't ring if permissions aren't granted.

**Solution**: 
- Open app settings
- Go to App Permissions → Notifications
- Ensure "Allow notifications" is enabled
- On Android 13+, also check "Show notifications on Lock screen"

### 2. Battery Optimization (Android)
**Problem**: Battery optimization can kill background processes, preventing alarms.

**Solution**:
- Go to Settings → Apps → Habit → Battery
- Set to "Unrestricted" or "Not optimized"
- Some devices: Settings → Battery → Battery optimization → Habit → Don't optimize

### 3. Do Not Disturb Mode
**Problem**: Do Not Disturb can silence alarms.

**Solution**:
- Disable Do Not Disturb when you need alarms
- Or add Habit app to exceptions (device settings)

### 4. Test on Physical Device
**Problem**: Notifications may not work on emulators/simulators.

**Solution**: Always test alarms on a physical device.

### 5. Check Scheduled Notifications
**Solution**: Use this code in your console:
```javascript
import { getAllScheduledNotifications } from './services/alarmService';
const scheduled = await getAllScheduledNotifications();
console.log('Scheduled:', scheduled);
```

### 6. Verify Notification Handler
**Problem**: Notification handler might not be configured correctly.

**Solution**: Check console logs for:
- `📬 Notification handler called` - Should appear when notification arrives
- `⏰ Alarm notification - allowing to show` - Confirms alarm handling

### 7. Device-Specific Issues
**Samsung/OnePlus**: 
- Go to Settings → Battery → Background app limits
- Ensure Habit is not restricted

**Xiaomi/MIUI**:
- Settings → Apps → Habit → Battery saver → No restrictions
- Settings → Notifications → Habit → Allow all notifications

### 8. Test Alarm Immediately
Schedule a test alarm for 1-2 minutes from now to verify it works.

### 9. Check Console Logs
Look for these in console:
- `✅ Alarm scheduled successfully!`
- `✅ Notification verified as scheduled`
- `📱 Alarm notification scheduled successfully`

If you see errors, check:
- Permission errors
- Channel setup errors
- Scheduling errors

### 10. Reinstall App
If nothing works:
1. Uninstall the app
2. Reinstall
3. Grant all permissions again
4. Test alarm scheduling

## Quick Debug Commands

Add this to your TaskList screen temporarily:

```javascript
// Test function - add to TaskList
const testAlarm = async () => {
  const testDate = new Date();
  testDate.setMinutes(testDate.getMinutes() + 1);
  
  const result = await scheduleTaskAlarm(
    'test-' + Date.now(),
    'Test Alarm',
    testDate,
    'Testing alarm - should ring in 1 minute'
  );
  
  if (result) {
    Alert.alert('Success', 'Test alarm scheduled for 1 minute from now');
  } else {
    Alert.alert('Error', 'Failed to schedule test alarm');
  }
};
```

