import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function Home({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 12.9716,  // Default to a central location (Bangalore)
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showMap, setShowMap] = useState(false);

  const handleLocationPress = () => {
    navigation.navigate('MapScreen');
  };

  const tasks = [
    { id: 1, title: 'Read a book', completed: false },
    { id: 2, title: 'Exercise', completed: true },
    { id: 3, title: 'Meditate', completed: false },
  ];

  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>User Name</Text>
        <Text style={styles.userEmail}>user@example.com</Text>
      </View>

      {/* Location Button */}
      <View style={styles.aiChatContainer}>
        <TouchableOpacity style={styles.aiChatButton} onPress={handleLocationPress}>
          <MaterialIcons name="location-on" size={24} color="#6C63FF" />
          <Text style={styles.aiChatText}>SHOW MY LOCATION</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your Location"
                description="You are here"
              />
            )}
          </MapView>
        </View>
      )}

      {/* Tasks Panel */}
      <TouchableOpacity 
        style={styles.tasksPanel} 
        onPress={() => navigation.navigate('TaskList')}
      >
        <Text style={styles.tasksTitle}>Tasks to Complete</Text>
        {incompleteTasks.map(task => (
          <View key={task.id} style={styles.taskItem}>
            <Text style={styles.taskText}>{task.title}</Text>
          </View>
        ))}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  profileContainer: {
    backgroundColor: '#6C63FF',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  aiChatContainer: {
    backgroundColor: 'white',
    marginHorizontal: 30,
    marginTop: -20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  aiChatText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  tasksPanel: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
});