import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config/api';

const { width } = Dimensions.get('window');

// Backend pulls from ThingSpeak → runs ML → returns sensors + ai_analysis
const API_URL = `${API_BASE}/api/soil-analysis`;

const SENSOR_METRICS = [
  { key: 'Nitrogen', label: 'Nitrogen', unit: ' mg/kg', icon: 'leaf-outline', color: '#e53935', bgColor: '#ffebee' },
  { key: 'Phosphorus', label: 'Phosphorus', unit: ' mg/kg', icon: 'flask-outline', color: '#1e88e5', bgColor: '#e3f2fd' },
  { key: 'Potassium', label: 'Potassium', unit: ' mg/kg', icon: 'cellular-outline', color: '#f9a825', bgColor: '#fffde7' },
  { key: 'pH', label: 'pH Level', unit: '', icon: 'analytics-outline', color: '#6d4c41', bgColor: '#efebe9' },
  { key: 'Moisture', label: 'Moisture', unit: '%', icon: 'water-outline', color: '#00acc1', bgColor: '#e0f7fa' },
  { key: 'Temperature', label: 'Temperature', unit: '°C', icon: 'thermometer-outline', color: '#e65100', bgColor: '#fff3e0' },
];

function StatusBadge({ value, metric }) {
  const ranges = {
    Nitrogen: { low: 140, high: 280, lowL: 'Low N', highL: 'Excess N', okL: 'Good N' },
    Phosphorus: { low: 40, high: 120, lowL: 'Low P', highL: 'Excess P', okL: 'Good P' },
    Potassium: { low: 100, high: 250, lowL: 'Low K', highL: 'Excess K', okL: 'Good K' },
    pH: { low: 5.5, high: 7.0, lowL: 'Acidic', highL: 'Alkaline', okL: 'Ideal' },
    Moisture: { low: 35, high: 70, lowL: 'Dry', highL: 'Wet', okL: 'Optimal' },
    Temperature: null,
  };
  const r = ranges[metric.key];
  if (!r || value === null || value === undefined) return null;
  let label, bg, tc;
  if (value < r.low) { label = r.lowL; bg = '#ffebee'; tc = '#e53935'; }
  else if (value > r.high) { label = r.highL; bg = '#fff3e0'; tc = '#e65100'; }
  else { label = r.okL; bg = '#e8f5e9'; tc = '#2e7d32'; }
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: tc }]}>{label}</Text>
    </View>
  );
}

function AnimatedMetricCard({ metric, value, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 420, delay: index * 70, useNativeDriver: true }).start();
  }, [value]);

  return (
    <Animated.View style={[
      styles.metricCard,
      { backgroundColor: metric.bgColor },
      { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
    ]}>
      <View style={[styles.metricIconWrap, { backgroundColor: `${metric.color}22`, borderColor: `${metric.color}44` }]}>
        <Ionicons name={metric.icon} size={20} color={metric.color} />
      </View>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <View style={styles.metricBottom}>
        <Text style={[styles.metricValue, { color: metric.color }]}>
          {value !== undefined && value !== null ? `${value}${metric.unit}` : '--'}
        </Text>
        <StatusBadge value={value} metric={metric} />
      </View>
    </Animated.View>
  );
}

export default function SoilMonitorScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);   // [{label, N, P, K}]

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!currentData) setLoading(true);
    setError(null);

    try {
      const res = await axios.get(API_URL, { timeout: 10000 });
      const d = res.data;
      setCurrentData(d);

      // keep last 6 readings for mini trend display
      const timeStr = new Date(d.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [...prev, {
        label: timeStr,
        N: d.sensors?.Nitrogen,
        P: d.sensors?.Phosphorus,
        K: d.sensors?.Potassium,
      }].slice(-6));

    } catch (err) {
      const msg =
        err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')
          ? 'Cannot reach backend server. Ensure it is running on port 5000.'
          : err.code === 'ECONNABORTED'
            ? 'Request timed out — sensor may be busy.'
            : `Backend error: ${err.response?.data?.error || err.message}`;
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  const ai = currentData?.ai_analysis;
  const sensors = currentData?.sensors || {};
  const isHealthy = ai?.status === 'Healthy' || ai?.prediction === 'Healthy';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={['#2d5016']} />}
    >
      {/* Header Banner */}
      <LinearGradient colors={['#1a3c0d', '#2d5016', '#3d6e22']} style={styles.heroBanner}>
        <View style={styles.heroBg1} />
        <View style={styles.heroBg2} />
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Text style={{ fontSize: 36 }}>🌱</Text>
          </View>
          <Text style={styles.heroTitle}>Live Soil Monitor</Text>
          <Text style={styles.heroSub}>ThingSpeak · Hybrid Ensemble ML</Text>

          <View style={styles.heroPillRow}>
            <View style={styles.heroPill}>
              <View style={styles.liveDot} />
              <Text style={styles.heroPillText}>Live Sensor Data</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="time-outline" size={11} color="#a5d6a7" />
              <Text style={styles.heroPillText}>Auto-refresh 10s</Text>
            </View>
          </View>

          {currentData?.timestamp && (
            <Text style={styles.tsText}>
              Last read: {new Date(currentData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color="#e53935" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* First load spinner */}
        {loading && !currentData ? (
          <ActivityIndicator size="large" color="#2d5016" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* AI Verdict */}
            {ai && (
              <View style={[
                styles.verdictCard,
                { borderLeftColor: isHealthy ? '#43a047' : '#e53935', backgroundColor: isHealthy ? '#e8f5e9' : '#ffebee' },
              ]}>
                <View style={styles.verdictTop}>
                  <Text style={styles.verdictIcon}>{isHealthy ? '✅' : '⚠️'}</Text>
                  <Text style={styles.verdictLabel}>AI Consensus Verdict</Text>
                </View>
                <Text style={[styles.verdictPrediction, { color: isHealthy ? '#2e7d32' : '#c62828' }]}>
                  {ai.prediction || ai.consensus}
                </Text>
                {ai.status && <Text style={styles.verdictStatus}>Status: {ai.status}</Text>}
                {ai.votes && (
                  <View style={styles.votesRow}>
                    {Object.entries(ai.votes).map(([model, pred]) => (
                      <View key={model} style={styles.voteChip}>
                        <Text style={styles.voteModel}>{model}</Text>
                        <Text style={styles.votePred}>{pred}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Sensor Readings */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Sensor Readings</Text>
              {currentData?.timestamp && (
                <Text style={styles.timestampText}>
                  {new Date(currentData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              )}
            </View>

            <View style={styles.metricsGrid}>
              {SENSOR_METRICS.map((metric, idx) => (
                <AnimatedMetricCard
                  key={metric.key}
                  metric={metric}
                  value={sensors[metric.key] ?? null}
                  index={idx}
                />
              ))}
            </View>

            {/* N-P-K mini trend text */}
            {history.length > 1 && (
              <View style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Ionicons name="trending-up-outline" size={18} color="#2d5016" />
                  <Text style={styles.trendTitle}>N-P-K Trend (last {history.length} reads)</Text>
                </View>
                <View style={styles.trendTable}>
                  <View style={styles.trendRow}>
                    <Text style={[styles.trendCol, styles.trendHead]}>Time</Text>
                    <Text style={[styles.trendCol, styles.trendHead, { color: '#e53935' }]}>N</Text>
                    <Text style={[styles.trendCol, styles.trendHead, { color: '#1e88e5' }]}>P</Text>
                    <Text style={[styles.trendCol, styles.trendHead, { color: '#f9a825' }]}>K</Text>
                  </View>
                  {history.slice(-5).map((h, i) => (
                    <View key={i} style={[styles.trendRow, i % 2 === 0 && { backgroundColor: '#f5f5f5' }]}>
                      <Text style={styles.trendCol}>{h.label}</Text>
                      <Text style={[styles.trendCol, { color: '#e53935' }]}>{h.N ?? '--'}</Text>
                      <Text style={[styles.trendCol, { color: '#1e88e5' }]}>{h.P ?? '--'}</Text>
                      <Text style={[styles.trendCol, { color: '#f9a825' }]}>{h.K ?? '--'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Shortcut to Fertilizer Advisor */}
            <TouchableOpacity
              style={styles.fertBtn}
              onPress={() => navigation.navigate('FertilizerAdvisor')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#e65100', '#f57c00']} style={styles.fertGrad}>
                <Text style={styles.fertEmoji}>🧪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fertBtnTitle}>Get Fertilizer Advice</Text>
                  <Text style={styles.fertBtnSub}>AI recommendations based on current readings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* Refresh */}
        <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchData(false)} activeOpacity={0.8}>
          <LinearGradient colors={['#2d5016', '#3d6e22']} style={styles.refreshGrad}>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.refreshText}>{loading ? 'Refreshing...' : 'Force Refresh'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to hub */}
        <TouchableOpacity style={styles.hubBtn} onPress={() => navigation.navigate('SoilHub')} activeOpacity={0.8}>
          <Ionicons name="grid-outline" size={16} color="#2d5016" />
          <Text style={styles.hubBtnText}>Back to Soil Hub</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },

  heroBanner: { paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24, overflow: 'hidden' },
  heroBg1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)', top: -70, right: -50 },
  heroBg2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -30 },
  heroContent: { alignItems: 'center' },
  heroIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14, fontWeight: '600' },
  heroPillRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#69f0ae' },
  heroPillText: { fontSize: 11, color: '#a5d6a7', fontWeight: '700' },
  tsText: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 },

  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginBottom: 14,
  },
  errorText: { color: '#e53935', fontSize: 13, flex: 1 },

  /* AI Verdict */
  verdictCard: {
    borderRadius: 16, padding: 18, marginBottom: 18,
    borderLeftWidth: 5, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  verdictTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  verdictIcon: { fontSize: 20 },
  verdictLabel: { fontSize: 13, fontWeight: '800', color: '#333' },
  verdictPrediction: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginVertical: 6 },
  verdictStatus: { fontSize: 13, textAlign: 'center', color: '#555', marginBottom: 8 },
  votesRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  voteChip: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  voteModel: { fontSize: 10, color: '#555', fontWeight: '700' },
  votePred: { fontSize: 11, color: '#222', fontWeight: '800' },

  /* Metrics */
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a3c0d' },
  timestampText: { fontSize: 11, color: '#6a9e5a', fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  metricCard: {
    width: (width - 52) / 2,
    borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  metricIconWrap: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, marginBottom: 10 },
  metricLabel: { fontSize: 11, color: '#666', fontWeight: '700', marginBottom: 3 },
  metricBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  metricValue: { fontSize: 20, fontWeight: '900' },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' },

  /* Trend */
  trendCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 18,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5,
  },
  trendHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  trendTitle: { fontSize: 14, fontWeight: '800', color: '#2d5016' },
  trendTable: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
  trendRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10 },
  trendCol: { flex: 1, fontSize: 12, color: '#333', fontWeight: '600', textAlign: 'center' },
  trendHead: { fontSize: 11, fontWeight: '800', color: '#555' },

  /* Fertilizer button */
  fertBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, elevation: 4, shadowColor: '#e65100', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  fertGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  fertEmoji: { fontSize: 28 },
  fertBtnTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  fertBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  /* Buttons */
  refreshBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  refreshGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  refreshText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  hubBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, backgroundColor: '#e8f5e9',
    borderRadius: 14, borderWidth: 1, borderColor: '#c8e6c9',
  },
  hubBtnText: { color: '#2d5016', fontSize: 14, fontWeight: '700' },
});
