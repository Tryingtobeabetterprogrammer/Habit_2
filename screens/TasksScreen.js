import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function MyTasksScreen() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Read a book", description: "30 minutes before bed", color: "#FFF6E5" },
    { id: "2", title: "Exercise", description: "Go for a 30-min run", color: "#E5F1FF" },
    { id: "3", title: "Meditate", description: "10 minutes of calm", color: "#FFE5EC" },
  ]);

  const deleteTask = (id) => setTasks(tasks.filter((task) => task.id !== id));

  const renderItem = ({ item }) => (
    <View style={[styles.taskCard, { backgroundColor: item.color }]}>
      <View>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDesc}>{item.description}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#ff5c5c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#9D7BFF", "#FF89B5"]}
        style={styles.header}
      >
        <Text style={styles.headerText}>My Tasks</Text>
      </LinearGradient>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.addButton}>
        <LinearGradient colors={["#9D7BFF", "#FF89B5"]} style={styles.gradientButton}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={24} color="#b1b1b1" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="list" size={26} color="#9D7BFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="chatbubble-outline" size={24} color="#b1b1b1" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="location-outline" size={24} color="#b1b1b1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    height: 120,
    justifyContent: "flex-end",
    paddingHorizontal: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
  },
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  list: {
    padding: 20,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  taskDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    shadowColor: "#9D7BFF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
  },
});