import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.wrapper}>
        {/* Top Bar with Login Button */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Login</Text>
            <Feather name="log-in" size={18} color="#E2E8F0" style={{ marginLeft: 8 }} /> 
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.container}>
          {/* A simple, clean logo element */}
          <View style={styles.logoCircle}>
            <Feather name="target" size={60} color="#63FFD1" />
          </View>
          
          <Text style={styles.title}>Habit Tracker</Text>
          <Text style={styles.subtitle}>
            Welcome to your new, focused self.
          </Text>

          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#63FFD1', '#00BFFF']} // Vibrant Mint to Blue gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedButtonGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Adjusted for status bar
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle highlight
  },
  loginText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0', // Light gray-white
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -50,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', // Very subtle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(99, 255, 209, 0.3)', // Faint accent border
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0AEC0', // Muted gray
    textAlign: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    borderRadius: 30,
    width: 220,
    overflow: 'hidden', // Needed for gradient
    shadowColor: "#00BFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  getStartedButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#1A202C', // Dark text on bright button
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default HomeScreen;