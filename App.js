// App.js
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from './alarmUtils';
import { requestNotificationPermissions } from './services/alarmService';
import { getTaskById } from './services/alarmHelpers';
import { wireNotifeeListeners } from './services/notifeeService';

// Import screens
import Home from './screens/Home';
import TaskList from './screens/TaskList';
import TaskDetail from './screens/TaskDetail';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';
import AddTask from './screens/AddTask';
import NearbyPlaces from './screens/NearbyPlaces';
import AlarmPopup from './screens/AlarmPopup';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6C63FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{ 
          title: 'Habit Tracker',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ 
          title: 'My Location',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="NearbyPlaces" 
        component={NearbyPlaces} 
        options={{ 
          title: 'Nearby Places',
          headerShown: true,
        }} 
      />
    </Stack.Navigator>
  );
}

// Tasks Stack Navigator
function TasksStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6C63FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskList} 
        options={{ 
          title: 'My Tasks',
        }} 
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTask} 
        options={{ 
          title: 'Add New Task',
        }} 
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetail} 
        options={{ 
          title: 'Task Details',
        }} 
      />
    </Stack.Navigator>
  );
}

// Chat Stack Navigator
function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6C63FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="ChatMain" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat with Habit',
        }} 
      />
      <Stack.Screen 
        name="NearbyPlaces" 
        component={NearbyPlaces} 
        options={{ 
          title: 'Nearby Places',
        }} 
      />
    </Stack.Navigator>
  );
}

// Navigation reference to allow navigation from outside components
export const navigationRef = React.createRef();

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request notification permissions on app start
    requestNotificationPermission(); // Use new utility function
    requestNotificationPermissions(); // Keep existing for compatibility

    // Wire Notifee listeners (Android dev build) to open AlarmPopup
    wireNotifeeListeners(({ taskId, taskTitle }) => {
      if (navigationRef.current && taskId) {
        navigationRef.current?.navigate('AlarmPopup', { taskId, taskTitle });
      }
    });

    // Handle notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('🔔 Notification received:', notification);
      const { taskId, taskTitle, type } = notification.request.content.data || {};
      
      if (type === 'alarm' && taskId && navigationRef.current) {
        console.log(`⏰ Alarm notification received for task: ${taskTitle} (${taskId})`);
        navigationRef.current?.navigate('AlarmPopup', { taskId, taskTitle });
      }
    });

    // Handle notification taps - open alarm popup
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log('👆 Notification tapped:', response);
      const { taskId, taskTitle, type } = response.notification.request.content.data || {};
      
      if (type === 'alarm' && taskId && navigationRef.current) {
        navigationRef.current?.navigate('AlarmPopup', { taskId, taskTitle });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'TasksTab') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'ChatTab') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'PlacesTab') {
              return (
                <MaterialIcons
                  name="location-on"
                  size={size}
                  color={focused ? '#6C63FF' : 'gray'}
                />
              );
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
        <Tab.Screen name="TasksTab" component={TasksStack} options={{ title: 'Tasks' }} />
        <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: 'Chat' }} />
        <Tab.Screen name="PlacesTab" component={NearbyPlaces} options={{ title: 'Places' }} />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" />
      <RootStack.Navigator>
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="AlarmPopup"
          component={AlarmPopup}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            contentStyle: { backgroundColor: 'rgba(0,0,0,0.6)' },
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}