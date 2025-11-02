import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Read a book" },
    { id: "2", title: "Meditate" },
  ]);

  const glowAnim = useRef(new Animated.Value(1)).current;

  // 🔆 Glow animation for button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const handleLocation = () => {
    alert("Fetching your location...");
  };

  return (
    <LinearGradient
      colors={["#E0C3FC", "#8EC5FC"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Habit Tracker</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <LinearGradient colors={["#705CFF", "#F883DD"]} style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>User Name</Text>
        <Text style={styles.userEmail}>user@example.com</Text>

        {/* Animated Glowing Button */}
        <Animated.View
          style={[
            styles.glowWrapper,
            {
              transform: [{ scale: glowAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.locationButton} onPress={handleLocation}>
            <LinearGradient
              colors={["#705CFF", "#F883DD"]}
              style={styles.locationGradient}
            >
              <Text style={styles.locationButtonText}>SHOW MY LOCATION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Tasks Section */}
      <View style={styles.taskSection}>
        <Text style={styles.taskHeader}>Today's Habits</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#705CFF" />
              <Text style={styles.taskText}>{item.title}</Text>
            </View>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileCard: {
    borderRadius: 25,
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#705CFF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#705CFF",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    color: "#f5e4ff",
    fontSize: 14,
    marginBottom: 20,
  },
  glowWrapper: {
    shadowColor: "#F883DD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  locationButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  locationGradient: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  taskSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
  },
  taskHeader: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  taskText: {
    color: "#555",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "500",
  },
});