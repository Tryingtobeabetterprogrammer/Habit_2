import { NavigationContainer } from '@react-navigation/native';
// Import the stack navigator
import { createStackNavigator } from '@react-navigation/stack';

// --- Step 1: Import your screens ---
// We add the .js at the end to be explicit for the bundler
import NearbyPlaces from './screens/NearbyPlaces.js'; 
import SiriRedesignScreen from './screens/SiriRedesignScreen.js';


// Create the stack
const Stack = createStackNavigator();

// Define the navigator function
function HomeStack() {
  return (
    <Stack.Navigator>
      {/* This was your original screen */}
      <Stack.Screen 
        name="NearbyPlaces" 
        component={NearbyPlaces} 
      />

      {/* --- Step 2: Add your new screen --- */}
      <Stack.Screen 
        name="SiriRedesign" 
        component={SiriRedesignScreen} 
      />

    </Stack.Navigator>
  );
}

// Define your main App component
export default function App() {
  return (
    // Wrap your navigator in the NavigationContainer
    <NavigationContainer>
      <HomeStack />
    </NavigationContainer>
  );
}
