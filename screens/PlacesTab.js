import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PlacesTab = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Request foreground location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in settings.');
        setLoading(false);
        return;
      }

      // 2. Get current location
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      } catch (err) {
        setErrorMsg('Could not get your current location.');
        setLoading(false);
      }
    })();
  }, []);

  const getNearbyPlaces = () => {
      // In a real application, you would use Google Places API or similar service here
      // to fetch nearby restaurants, cafes, gyms, etc. based on the 'location' state.
      Alert.alert("Feature Placeholder", "Fetching nearby places (Restaurants, Gyms, Cafes) would happen here using a Places API.");
  };

  if (loading) {
    return (
      <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#63FFD1" />
        <Text style={styles.loadingText}>Fetching Location...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Places Near You</Text>
        </View>
        {errorMsg ? (
            <View style={styles.errorContainer}>
                <Feather name="alert-triangle" size={30} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        ) : (
            <View style={styles.mapContainer}>
                {/* Map View */}
                {location && (
                    <MapView
                        style={styles.map}
                        initialRegion={location}
                        onLayout={getNearbyPlaces} // Trigger the search on map load
                    >
                        {/* User Location Marker */}
                        <Marker 
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                            title={"You are here"}
                            pinColor="#63FFD1"
                        />
                        {/* More Markers for nearby places would go here */}
                    </MapView>
                )}
            </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2D3748' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E2E8F0', marginTop: 15, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#E2E8F0', textAlign: 'center', marginTop: 10, fontSize: 16 },
  mapContainer: { flex: 1, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
});

export default PlacesTab;