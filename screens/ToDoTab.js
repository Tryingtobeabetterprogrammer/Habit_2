import React, { useState } from 'react'; // Import useState
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList, // Import FlatList to render items
  Modal, // Import Modal for the pop-up
  TextInput, // Import TextInput for user input
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// This is a new component for rendering each to-do item
const TodoItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
    <Feather 
      name={item.completed ? "check-square" : "square"} 
      size={24} 
      color={item.completed ? "#63FFD1" : "#A0AEC0"} 
    />
    <Text 
      style={[
        styles.itemText, 
        item.completed && styles.itemTextCompleted
      ]}
    >
      {item.text}
    </Text>
  </TouchableOpacity>
);

// --- Main Component ---
const ToDoTab = () => {
  // --- New State Variables ---
  const [todos, setTodos] = useState([]); // Holds the list of tasks
  const [modalVisible, setModalVisible] = useState(false); // Controls the pop-up
  const [newTodoText, setNewTodoText] = useState(""); // Holds text from the input

  // --- New Function: Handles adding a task ---
  const handleAddNewTodo = () => {
    if (newTodoText.trim() === "") {
      Alert.alert("Empty Task", "Please enter a task description.");
      return;
    }
    // Add the new task to the 'todos' array
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: newTodoText, completed: false }
    ]);
    setNewTodoText(""); // Clear the input
    setModalVisible(false); // Close the modal
  };

  // --- New Function: Toggles a task's completed status ---
  const toggleTodoCompleted = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Focus List</Text>
        </View>

        {/* --- Updated List Area --- */}
        <View style={styles.container}>
          {todos.length === 0 ? (
            // Show this if the list is empty
            <View style={styles.emptyState}>
              <Feather name="list" size={50} color="#A0AEC0" style={{ marginBottom: 15 }} />
              <Text style={styles.emptyText}>Tap the '+' button to add a new task!</Text>
            </View>
          ) : (
            // Show the list if it has items
            <FlatList
              data={todos}
              renderItem={({ item }) => (
                <TodoItem 
                  item={item} 
                  onPress={() => toggleTodoCompleted(item.id)} 
                />
              )}
              keyExtractor={item => item.id}
              style={styles.list}
            />
          )}
        </View>

        {/* --- Floating Action Button (Now functional) --- */}
        

<TouchableOpacity
  style={styles.addButton}
  onPress={() => {
    console.log("--- TAPPED THE PLUS BUTTON ---"); // <-- LOG 1
    console.log("Modal visible BEFORE tap:", modalVisible); // <-- LOG 2
    setModalVisible(true);
  }}
>
  <Feather name="plus" size={30} color="#1A202C" />
</TouchableOpacity>

        {/* --- New Modal Pop-up --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalCenteredView}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Complete coding assignment"
                placeholderTextColor="#A0AEC0"
                value={newTodoText}
                onChangeText={setNewTodoText} // Updates state as you type
              />
              <TouchableOpacity style={styles.modalButton} onPress={handleAddNewTodo}>
                <Text style={styles.modalButtonText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2D3748' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  list: {
    flex: 1,
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyText: {
    color: '#A0AEC0',
    fontSize: 16,
    textAlign: 'center'
  },
  addButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#63FFD1', // Vibrant mint color
    borderRadius: 30,
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },

  // --- Styles for each to-do item ---
  itemContainer: {
    backgroundColor: '#2D3748',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemText: {
    color: '#E2E8F0',
    fontSize: 16,
    marginLeft: 15,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },

  // --- Styles for the new Modal ---
  modalCenteredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2D3748',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
    borderColor: '#4A5568',
    borderWidth: 1,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#63FFD1',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#1A202C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  modalButtonCancelText: {
    color: '#A0AEC0',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default ToDoTab;