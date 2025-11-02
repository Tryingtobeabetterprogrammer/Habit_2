import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import all your screen components
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen'; // New
import { HabitProvider } from './HabitContext'; // Import the HabitProvider

// Create the main stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <HabitProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false, // Hide the default header for all screens
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} /> 
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </HabitProvider>
  );
};

export default App;
