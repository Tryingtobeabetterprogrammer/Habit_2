import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// 2. Define your component. The name MUST match the file name.
const SiriRedesignScreen = () => {
  return (
    // SafeAreaView makes sure your content isn't hidden by the phone's notch
    <SafeAreaView style={styles.wrapper}>
      {/* View is the basic container, like a <div> */}
      <View style={styles.container}>
        {/* This is the placeholder text you will replace later */}
        <Text style={styles.title}>
          This is your new Screen!
        </Text>
        <Text style={styles.body}>
          You will add your UI/UX design code here.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// 3. Create the StyleSheet (this is your CSS for React Native)
const styles = StyleSheet.create({
  wrapper: {
    flex: 1, // Make the screen fill all available space
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // A clean white background
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#333',
  },
});