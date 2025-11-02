import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLogin = () => {
    Alert.alert("Login Success", "Welcome back!", [
      { text: "OK", onPress: () => navigation.navigate('Dashboard') }
    ]);
  };

  return (
    <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.wrapper}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#E2E8F0" />
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue your journey</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            color="#FFFFFF"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={true}
            color="#FFFFFF"
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={['#63FFD1', '#00BFFF']} // Vibrant Mint to Blue gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              <Text style={styles.loginText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0AEC0', // Muted gray
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#2D3748', // Lighter dark color
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderColor: '#4A5568', // Subtle border
    borderWidth: 1,
  },
  loginButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: "#00BFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#1A202C', // Dark text on bright button
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#A0AEC0',
    marginTop: 20,
    fontSize: 15,
  }
});

export default LoginScreen;