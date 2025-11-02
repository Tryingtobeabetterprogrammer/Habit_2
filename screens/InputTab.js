import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from './HabitContext'; // --- NEW: Import the useHabits hook ---

// --- Main Component ---
const InputTab = () => {
  // --- NEW: Get logging functions from Context ---
  const { logProductivity, logFitness, logWater, logMeal } = useHabits();

  // --- Local state for inputs is still needed ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [totalTasks, setTotalTasks] = useState("");
  const [workoutHours, setWorkoutHours] = useState("");
  const [waterLiters, setWaterLiters] = useState("");
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snacks, setSnacks] = useState("");

  const habitCategories = [
    { name: 'Meal Plan', icon: 'food-fork-drink', component: MaterialCommunityIcons, color: '#FFD166' },
    { name: 'Fitness', icon: 'dumbbell', component: MaterialCommunityIcons, color: '#EF4444' },
    { name: 'Productivity', icon: 'briefcase', component: Feather, color: '#00BFFF' },
    { name: 'Water Intake', icon: 'droplet', component: Feather, color: '#3B82F6' },
  ];

  const handleCardPress = (categoryName) => {
    setSelectedCategory(categoryName);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setTasksCompleted("");
    setTotalTasks("");
    setWorkoutHours("");
    setWaterLiters("");
    setBreakfast("");
    setLunch("");
    setDinner("");
    setSnacks("");
  };

  // --- UPDATED Save Handlers ---

  const handleSaveProductivity = () => {
    if (!tasksCompleted || !totalTasks) {
      Alert.alert("Missing Info", "Please fill out both fields.");
      return;
    }
    // --- NEW: Call context function ---
    logProductivity(parseFloat(tasksCompleted), parseFloat(totalTasks));
    Alert.alert("Progress Logged", `You completed ${tasksCompleted} out of ${totalTasks} tasks!`);
    handleCloseModal();
  };

  const handleSaveFitness = () => {
    if (!workoutHours) {
      Alert.alert("Missing Info", "Please enter your workout hours.");
      return;
    }
    // --- NEW: Call context function ---
    logFitness(parseFloat(workoutHours));
    Alert.alert("Progress Logged", `You logged ${workoutHours} hours of fitness!`);
    handleCloseModal();
  };

  const handleSaveWater = () => {
    if (!waterLiters) {
      Alert.alert("Missing Info", "Please enter your water intake in liters.");
      return;
    }
    // --- NEW: Call context function ---
    logWater(parseFloat(waterLiters));
    Alert.alert("Progress Logged", `You logged ${waterLiters} liters of water!`);
    handleCloseModal();
  };

  const handleSaveMealPlan = () => {
    if (!breakfast && !lunch && !dinner && !snacks) {
      Alert.alert("Missing Info", "Please log at least one meal.");
      return;
    }
    // --- NEW: Call context function ---
    logMeal({ breakfast, lunch, dinner, snacks });
    Alert.alert("Progress Logged", "Your meals have been logged!");
    handleCloseModal();
  };


  // --- Modal Content (Unchanged, but now calls new save handlers) ---
  const renderModalContent = () => {
    switch (selectedCategory) {
      case 'Productivity':
        return (
          <>
            <Text style={styles.modalTitle}>Log Productivity</Text>
            <TextInput
              style={styles.input}
              placeholder="Tasks Completed"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              value={tasksCompleted}
              onChangeText={setTasksCompleted}
            />
            <TextInput
              style={styles.input}
              placeholder="Total Tasks"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              value={totalTasks}
              onChangeText={setTotalTasks}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveProductivity}>
              <Text style={styles.modalButtonText}>Log Progress</Text>
            </TouchableOpacity>
          </>
        );

      case 'Fitness':
        return (
          <>
            <Text style={styles.modalTitle}>Log Fitness</Text>
            <TextInput
              style={styles.input}
              placeholder="How many hours did you work out?"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              value={workoutHours}
              onChangeText={setWorkoutHours}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveFitness}>
              <Text style={styles.modalButtonText}>Log Progress</Text>
            </TouchableOpacity>
          </>
        );

      case 'Water Intake':
        return (
          <>
            <Text style={styles.modalTitle}>Log Water Intake</Text>
            <TextInput
              style={styles.input}
              placeholder="How many liters?"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              value={waterLiters}
              onChangeText={setWaterLiters}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveWater}>
              <Text style={styles.modalButtonText}>Log Progress</Text>
            </TouchableOpacity>
          </>
        );

      case 'Meal Plan':
        return (
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.modalTitle}>Log Meal Plan</Text>
            <TextInput
              style={styles.input}
              placeholder="Breakfast"
              placeholderTextColor="#A0AEC0"
              value={breakfast}
              onChangeText={setBreakfast}
            />
            <TextInput
              style={styles.input}
              placeholder="Lunch"
              placeholderTextColor="#A0AEC0"
              value={lunch}
              onChangeText={setLunch}
            />
            <TextInput
              style={styles.input}
              placeholder="Dinner"
              placeholderTextColor="#A0AEC0"
              value={dinner}
              onChangeText={setDinner}
            />
            <TextInput
              style={styles.input}
              placeholder="Snacks"
              placeholderTextColor="#A0AEC0"
              value={snacks}
              onChangeText={setSnacks}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveMealPlan}>
              <Text style={styles.modalButtonText}>Log Progress</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };


  // --- Card Component (Unchanged) ---
  const renderCategoryCard = ({ name, icon, component: IconComponent, color }) => (
    <TouchableOpacity
      key={name}
      style={styles.card}
      onPress={() => handleCardPress(name)}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '30' }]}>
        <IconComponent name={icon} size={36} color={color} />
      </View>
      <Text style={styles.cardText}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#2D3748', 'rgba(26, 32, 44, 0.8)']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Track New Input</Text>
        </View>
        <ScrollView style={styles.container}>
          <Text style={styles.subHeader}>Select a habit to log your progress</Text>
          <View style={styles.cardsGrid}>
            {habitCategories.map(renderCategoryCard)}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* --- Modal (Unchanged) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalCenteredView}
        >
          <View style={styles.modalView}>
            {renderModalContent()}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
};

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2D3748' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  subHeader: { fontSize: 16, color: '#A0AEC0', marginBottom: 30, textAlign: 'center' },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  card: {
    width: '45%',
    backgroundColor: '#2D3748',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
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
    maxHeight: '80%',
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
    textAlign: 'center',
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

export default InputTab;