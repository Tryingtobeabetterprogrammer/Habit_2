import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Import the four tab screens
import InputTab from './InputTab';
import ToDoTab from './ToDoTab';
import AnalysisTab from './AnalysisTab';
import PlacesTab from './PlacesTab';

const Tab = createBottomTabNavigator();

const DashboardScreen = () => {
  // Define the common theme styles for the tab bar
  const darkTheme = {
    backgroundColor: '#1A202C', // Dark background for the tab bar
    inactiveColor: '#A0AEC0', // Muted gray for inactive icons
    activeColor: '#63FFD1', // Vibrant mint for active icon
  };

  return (
    <Tab.Navigator
      initialRouteName="Input"
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header on tab screens
        tabBarActiveTintColor: darkTheme.activeColor,
        tabBarInactiveTintColor: darkTheme.inactiveColor,
        tabBarStyle: {
          backgroundColor: darkTheme.backgroundColor,
          borderTopColor: '#2D3748', // Subtle separator line
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Input') {
            iconName = 'edit-3'; // Pencil/Edit icon
          } else if (route.name === 'ToDo') {
            iconName = 'check-square'; // Checkbox/To-do icon
          } else if (route.name === 'Analysis') {
            iconName = 'bar-chart-2'; // Bar chart icon for analysis
          } else if (route.name === 'Places') {
            iconName = 'map-pin'; // Location/Map icon
          }

          // You can return any component that you like here!
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Input" component={InputTab} />
      <Tab.Screen name="ToDo" component={ToDoTab} />
      <Tab.Screen name="Analysis" component={AnalysisTab} />
      <Tab.Screen name="Places" component={PlacesTab} />
    </Tab.Navigator>
  );
};

export default DashboardScreen;