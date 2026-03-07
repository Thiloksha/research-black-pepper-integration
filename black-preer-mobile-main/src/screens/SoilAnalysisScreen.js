import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// We use 10.0.2.2 so Android Studio Emulator can reach the PC's localhost
const API_URL = 'http://10.0.2.2:5001/api/soil-analysis';

export default function SoilAnalysisScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentData, setCurrentData] = useState(null);

    // History states for the graph
    const [history, setHistory] = useState({
        labels: [],
        nitrogen: [],
        phosphorus: [],
        potassium: []
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            const data = response.data;

            setCurrentData(data);

            // Update Graph History (keep last 6 points for readability)
            setHistory(prev => {
                const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                const newLabels = [...prev.labels, timeStr].slice(-6);
                const newN = [...prev.nitrogen, data.sensors.Nitrogen].slice(-6);
                const newP = [...prev.phosphorus, data.sensors.Phosphorus].slice(-6);
                const newK = [...prev.potassium, data.sensors.Potassium].slice(-6);

                return {
                    labels: newLabels,
                    nitrogen: newN,
                    phosphorus: newP,
                    potassium: newK
                };
            });

        } catch (err) {
            console.error(err);
            setError('Failed to fetch live data. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Auto refresh every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const PredictionCard = () => {
        if (!currentData || !currentData.ai_analysis) return null;

        const isHealthy = currentData.ai_analysis.status === "Healthy";
        const backgroundColor = isHealthy ? '#e8f5e9' : '#ffebee';
        const borderColor = isHealthy ? '#4caf50' : '#f44336';

        return (
            <View style={[styles.card, { backgroundColor, borderLeftColor: borderColor, borderLeftWidth: 5 }]}>
                <Text style={styles.cardTitle}>🤖 AI Consensus Verdict</Text>
                <Text style={[styles.mainPredText, { color: borderColor }]}>
                    {currentData.ai_analysis.prediction}
                </Text>
                <Text style={styles.subtext}>
                    System Status: {currentData.ai_analysis.status}
                </Text>
            </View>
        );
    };

    const SensorsGrid = () => {
        if (!currentData) return null;
        const s = currentData.sensors;

        return (
            <View style={styles.metricsGrid}>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>Moisture</Text><Text style={styles.metricValue}>{s.Temperature}°C</Text></View>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>Temp</Text><Text style={styles.metricValue}>{s.Moisture}%</Text></View>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>Phosphorus</Text><Text style={styles.metricValue}>{s.pH}</Text></View>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>Nitrogen</Text><Text style={styles.metricValue}>{s.Nitrogen}</Text></View>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>pH Level</Text><Text style={styles.metricValue}>{s.Phosphorus}</Text></View>
                <View style={styles.metricBox}><Text style={styles.metricTitle}>Potassium</Text><Text style={styles.metricValue}>{s.Potassium}</Text></View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.gradient}>
                <View style={styles.header}>
                    <Text style={styles.title}>🌱 Live Soil Monitor</Text>
                    <Text style={styles.subtitle}>ThingSpeak + Hybrid Ensemble ML</Text>

                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <Text style={styles.dashboardBtnText}>🗺️ View Regional Dashboard</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {loading && !currentData ? (
                        <ActivityIndicator size="large" color="#2d5016" style={{ marginTop: 50 }} />
                    ) : (
                        <>
                            <SensorsGrid />
                            <PredictionCard />

                            {history.labels.length > 0 && (
                                <View style={styles.chartContainer}>
                                    <Text style={styles.chartTitle}>📊 N-P-K Trends</Text>
                                    <LineChart
                                        data={{
                                            labels: history.labels,
                                            datasets: [
                                                { data: history.nitrogen, color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})` },   // N = Red
                                                { data: history.phosphorus, color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})` }, // P = Blue
                                                { data: history.potassium, color: (opacity = 1) => `rgba(255, 206, 86, ${opacity})` }   // K = Yellow
                                            ],
                                            legend: ["Nitrogen", "Phosphorus", "Potassium"]
                                        }}
                                        width={width - 40}
                                        height={260}
                                        chartConfig={{
                                            backgroundColor: '#fff',
                                            backgroundGradientFrom: '#fff',
                                            backgroundGradientTo: '#fff',
                                            decimalPlaces: 1,
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" }
                                        }}
                                        bezier
                                        style={styles.chart}
                                    />
                                </View>
                            )}
                        </>
                    )}

                    <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
                        <Text style={styles.refreshBtnText}>{loading ? "Refreshing..." : "🔄 Force Refresh"}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1, minHeight: 800 },
    header: { paddingTop: 30, paddingBottom: 20, alignItems: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2d5016' },
    subtitle: { fontSize: 14, color: '#4a7226', marginTop: 5 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 15, backgroundColor: '#ffebee', padding: 10, borderRadius: 8 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    metricBox: { width: '31%', backgroundColor: '#fff', padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10, elevation: 2 },
    metricTitle: { fontSize: 12, color: '#666', fontWeight: 'bold' },
    metricValue: { fontSize: 16, color: '#2d5016', fontWeight: 'bold', marginTop: 5 },
    card: { padding: 20, borderRadius: 12, elevation: 3, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    mainPredText: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
    subtext: { fontSize: 14, textAlign: 'center', color: '#555' },
    chartContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 3, marginTop: 10 },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d5016', marginBottom: 10, marginLeft: 10 },
    chart: { borderRadius: 12 },
    refreshButton: { backgroundColor: '#2d5016', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
    refreshBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    dashboardButton: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    dashboardBtnText: { color: '#2d5016', fontSize: 14, fontWeight: 'bold' }
});
