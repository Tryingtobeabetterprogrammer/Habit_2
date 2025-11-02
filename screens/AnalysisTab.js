import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from './HabitContext'; // --- NEW: Get the data ---
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'; // --- NEW: Import charts ---

// Get the width of the phone screen for the charts
const screenWidth = Dimensions.get('window').width;

// --- Chart Configuration ---
const chartConfig = {
  backgroundColor: '#2D3748',
  backgroundGradientFrom: '#2D3748',
  backgroundGradientTo: '#1A202C',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#00BFFF',
  },
};

// --- Helper component for empty charts ---
const EmptyChart = ({ title, icon }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Feather name={icon} size={24} color="#A0AEC0" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.graphPlaceholder}>
      <Text style={styles.placeholderText}>Log some data to see your chart!</Text>
    </View>
  </View>
);

// --- Main Analysis Component ---
const AnalysisTab = () => {
  // --- NEW: Get all data logs from the Context ---
  const { productivityLog, fitnessLog, waterLog, mealLog, isLoading } = useHabits();

  // --- 1. Process Productivity Data (Line Chart) ---
  const getProductivityData = () => {
    // We'll just show the last 7 entries for simplicity
    const dataPoints = productivityLog.slice(-7).map(log => (log.completed / log.total) * 100);
    const labels = productivityLog.slice(-7).map((_, i) => `Day ${i + 1}`);

    if (dataPoints.length === 0) return null;

    return {
      labels: labels.length > 1 ? labels : ['Start'], // Chart needs at least 1 label
      datasets: [
        {
          data: dataPoints.length > 1 ? dataPoints : [0, ...dataPoints], // Chart needs at least 2 points
        },
      ],
    };
  };
  const productivityData = getProductivityData();
  

  // --- 2. Process Fitness Data (Bar Chart) ---
  const getFitnessData = () => {
    const dataPoints = fitnessLog.slice(-7).map(log => log.hours);
    const labels = fitnessLog.slice(-7).map((_, i) => `Day ${i + 1}`);

    if (dataPoints.length === 0) return null;
    
    return {
      labels: labels.length > 1 ? labels : ['Start'],
      datasets: [{ data: dataPoints.length > 1 ? dataPoints : [0, ...dataPoints] }],
    };
  };
  const fitnessData = getFitnessData();
  

  // --- 3. Process Water Data (Bar Chart) ---
  const getWaterData = () => {
    const dataPoints = waterLog.slice(-7).map(log => log.liters);
    const labels = waterLog.slice(-7).map((_, i) => `Day ${i + 1}`);

    if (dataPoints.length === 0) return null;
    
    return {
      labels: labels.length > 1 ? labels : ['Start'],
      datasets: [{ data: dataPoints.length > 1 ? dataPoints : [0, ...dataPoints] }],
    };
  };
  const waterData = getWaterData();

  // --- 4. Process Meal Data (Pie Chart) ---
  // This is a simple version, just counting how many meals were logged.
  const getMealData = () => {
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;
    let snacksCount = 0;

    mealLog.forEach(log => {
      if (log.breakfast) breakfastCount++;
      if (log.lunch) lunchCount++;
      if (log.dinner) dinnerCount++;
      if (log.snacks) snacksCount++;
    });

    if (breakfastCount + lunchCount + dinnerCount + snacksCount === 0) return null;

    return [
      { name: 'Breakfast', count: breakfastCount, color: '#FFD166', legendFontColor: '#E2E8F0', legendFontSize: 14 },
      { name: 'Lunch', count: lunchCount, color: '#F97316', legendFontColor: '#E2E8F0', legendFontSize: 14 },
      { name: 'Dinner', count: dinnerCount, color: '#3B82F6', legendFontColor: '#E2E8F0', legendFontSize: 14 },
      { name: 'Snacks', count: snacksCount, color: '#10B981', legendFontColor: '#E2E8F0', legendFontSize: 14 },
    ];
  };
  const mealData = getMealData();

  // Show a loading spinner while data is read from AsyncStorage
  if (isLoading) {
    return (
      <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#63FFD1" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#2D3748', '#1A202C']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Analytics</Text>
        </View>
        <ScrollView style={styles.container}>
          <Text style={styles.subHeader}>Visualize your progress over the last week.</Text>

          {/* Productivity Chart */}
          {productivityData ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="trending-up" size={24} color="#63FFD1" />
                <Text style={styles.cardTitle}>Productivity (Last 7 Logs)</Text>
              </View>
              <LineChart
                data={productivityData}
                width={screenWidth - 60} // card padding
                height={220}
                chartConfig={chartConfig}
                bezier // Makes it curvy
                style={styles.chart}
                yAxisSuffix="%"
              />
            </View>
          ) : (
            <EmptyChart title="Productivity" icon="trending-up" />
          )}

          {/* Fitness Chart */}
          {fitnessData ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="activity" size={24} color="#EF4444" />
                <Text style={styles.cardTitle}>Fitness (Last 7 Logs)</Text>
              </View>
              <BarChart
                data={fitnessData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisSuffix="h"
                fromZero={true}
              />
            </View>
          ) : (
            <EmptyChart title="Fitness" icon="activity" />
          )}

          {/* Water Chart */}
          {waterData ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="droplet" size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>Water Intake (Last 7 Logs)</Text>
              </View>
              <BarChart
                data={waterData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisSuffix="L"
                fromZero={true}
              />
            </View>
          ) : (
            <EmptyChart title="Water Intake" icon="droplet" />
          )}

          {/* Meal Chart */}
          {mealData ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="food-fork-drink" size={24} color="#FFD166" />
                <Text style={styles.cardTitle}>Meal Log Distribution</Text>
              </View>
              <PieChart
                data={mealData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </View>
          ) : (
            <EmptyChart title="Meal Plan" icon="list" />
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#2D3748' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  subHeader: { fontSize: 16, color: '#A0AEC0', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  cardTitle: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
  },
  graphPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 32, 44, 0.5)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A5568',
    marginTop: 10,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A0AEC0',
    textAlign: 'center',
    padding: 10,
  },
});

export default AnalysisTab;