// In NearbyPlaces.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Linking,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Local fallback data
const LOCAL_PLACES = {
  'restaurant': [
    { id: '1', name: 'Tasty Bites', distance: '250m', type: 'restaurant', lat: 0, lon: 0 },
    { id: '2', name: 'Burger Palace', distance: '500m', type: 'restaurant', lat: 0, lon: 0 }
  ],
  'cafe': [
    { id: '3', name: 'Coffee Corner', distance: '150m', type: 'cafe', lat: 0, lon: 0 }
  ],
  'park': [
    { id: '4', name: 'Central Park', distance: '800m', type: 'park', lat: 0, lon: 0 }
  ]
};

const NearbyPlaces = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeType, setPlaceType] = useState('restaurant');
  const [nearestPlace, setNearestPlace] = useState(null);

  // Show local data immediately
  useEffect(() => {
    const localData = LOCAL_PLACES[placeType] || [];
    setPlaces(localData);
    setNearestPlace(localData[0]);
    fetchLocationAndPlaces();
  }, [placeType]);

  const fetchLocationAndPlaces = async () => {
    try {
      setLoading(true);
      
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low // Faster location with lower accuracy
      });
      
      setLocation(location);
      // Simulate API call with timeout
      setTimeout(() => {
        const localData = LOCAL_PLACES[placeType] || [];
        setPlaces(localData);
        setNearestPlace(localData[0]);
        setLoading(false);
      }, 1000); // Simulated network delay
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const placeTypes = [
    { id: 'restaurant', name: '🍽️ Restaurants' },
    { id: 'cafe', name: '☕ Cafes' },
    { id: 'park', name: '🌳 Parks' }
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : null}
        showsUserLocation
        loadingEnabled
      >
        {places.map(place => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.lat || (location?.coords.latitude + (Math.random() * 0.01 - 0.005)),
              longitude: place.lon || (location?.coords.longitude + (Math.random() * 0.01 - 0.005))
            }}
            title={place.name}
            description={place.distance}
          />
        ))}
      </MapView>

      <View style={styles.placeTypeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {placeTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.placeTypeButton,
                placeType === type.id && styles.selectedPlaceType
              ]}
              onPress={() => setPlaceType(type.id)}
            >
              <Text style={[
                styles.placeTypeText,
                placeType === type.id && styles.selectedPlaceTypeText
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {nearestPlace && (
        <View style={styles.nearestPlaceContainer}>
          <Text style={styles.nearestPlaceTitle}>
            ⭐ Nearest {placeType === 'restaurant' ? 'Restaurant' : placeType === 'cafe' ? 'Cafe' : 'Park'}
          </Text>
          <Text style={styles.placeName}>{nearestPlace.name}</Text>
          <Text style={styles.placeDistance}>{nearestPlace.distance} away</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '50%',
  },
  placeTypeContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  placeTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedPlaceType: {
    backgroundColor: '#6C63FF',
  },
  placeTypeText: {
    color: '#333',
  },
  selectedPlaceTypeText: {
    color: '#fff',
  },
  nearestPlaceContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  nearestPlaceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeDistance: {
    color: '#666',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NearbyPlaces;