import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create the Context
const HabitContext = createContext();

// 2. Create the Provider (the "Brain" component)
export const HabitProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [productivityLog, setProductivityLog] = useState([]);
  const [fitnessLog, setFitnessLog] = useState([]);
  const [waterLog, setWaterLog] = useState([]);
  const [mealLog, setMealLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Loading ---
  // On app start, try to load all data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        if (storedTodos) setTodos(JSON.parse(storedTodos));

        const storedProductivity = await AsyncStorage.getItem('productivityLog');
        if (storedProductivity) setProductivityLog(JSON.parse(storedProductivity));
        
        const storedFitness = await AsyncStorage.getItem('fitnessLog');
        if (storedFitness) setFitnessLog(JSON.parse(storedFitness));

        const storedWater = await AsyncStorage.getItem('waterLog');
        if (storedWater) setWaterLog(JSON.parse(storedWater));

        const storedMeals = await AsyncStorage.getItem('mealLog');
        if (storedMeals) setMealLog(JSON.parse(storedMeals));

      } catch (e) {
        console.error("Failed to load data from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Helper Function to Save Data ---
  // Saves data to both state and AsyncStorage
  const saveData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error("Failed to save data to storage", e);
    }
  };

  // --- Public Functions (what our screens will use) ---

  // ToDo Functions
  const addTodo = (text) => {
    const newTodo = { id: Date.now().toString(), text, completed: false };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveData('todos', updatedTodos);
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveData('todos', updatedTodos);
  };

  // InputTab Functions
  const logProductivity = (completed, total) => {
    const newLog = { id: Date.now().toString(), date: new Date().toISOString(), completed, total };
    const updatedLog = [...productivityLog, newLog];
    setProductivityLog(updatedLog);
    saveData('productivityLog', updatedLog);
  };

  const logFitness = (hours) => {
    const newLog = { id: Date.now().toString(), date: new Date().toISOString(), hours };
    const updatedLog = [...fitnessLog, newLog];
    setFitnessLog(updatedLog);
    saveData('fitnessLog', updatedLog);
  };

  const logWater = (liters) => {
    const newLog = { id: Date.now().toString(), date: new Date().toISOString(), liters };
    const updatedLog = [...waterLog, newLog];
    setWaterLog(updatedLog);
    saveData('waterLog', updatedLog);
  };

  const logMeal = (meals) => { // meals is an object: { breakfast, lunch, dinner, snacks }
    const newLog = { id: Date.now().toString(), date: new Date().toISOString(), ...meals };
    const updatedLog = [...mealLog, newLog];
    setMealLog(updatedLog);
    saveData('mealLog', updatedLog);
  };

  // 3. Define what data and functions to "provide" to the app
  const value = {
    todos,
    productivityLog,
    fitnessLog,
    waterLog,
    mealLog,
    isLoading,
    addTodo,
    toggleTodo,
    logProductivity,
    logFitness,
    logWater,
    logMeal,
  };

  return (
    <HabitContext.Provider value={value}>
      {isLoading ? null : children}
    </HabitContext.Provider>
  );
};

// 4. Create a custom "hook" to easily use the context in other files
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};