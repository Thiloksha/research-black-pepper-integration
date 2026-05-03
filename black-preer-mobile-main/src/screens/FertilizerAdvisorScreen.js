import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const SOIL_API_URL = `${API_BASE}/api/soil-analysis`;
const FERT_API_URL = `${API_BASE}/api/fertilizer-recommendation`;

// ── Black-pepper-specific optimal ranges & advice ─────────────────────────────
const FERT_REFERENCE = {
    Nitrogen: {
        ranges: { low: 140, high: 280 },
        unit: 'mg/kg',
        icon: 'leaf-outline',
        color: '#e53935',
        low: { label: 'Deficient', color: '#e53935', advice: 'Apply Urea (46-0-0) at 200–250 kg/ha. Nitrogen is critical for leaf growth and vine development in black pepper.' },
        optimal: { label: 'Optimal', color: '#2e7d32', advice: 'Nitrogen is at a healthy level. Continue with light split applications every 6 weeks to maintain it.' },
        high: { label: 'Excess', color: '#e65100', advice: 'Reduce nitrogen inputs. Excess nitrogen promotes soft growth that is prone to fungal disease attacks.' },
    },
    Phosphorus: {
        ranges: { low: 40, high: 120 },
        unit: 'mg/kg',
        icon: 'flask-outline',
        color: '#1e88e5',
        low: { label: 'Deficient', color: '#e53935', advice: 'Apply Single Super Phosphate (SSP) at 150–200 kg/ha. Phosphorus supports root development and flowering.' },
        optimal: { label: 'Optimal', color: '#2e7d32', advice: 'Phosphorus is adequate. Continue with existing phosphate management program.' },
        high: { label: 'Excess', color: '#e65100', advice: 'Halt phosphate applications. High P can lock out zinc and iron uptake in the soil.' },
    },
    Potassium: {
        ranges: { low: 100, high: 250 },
        unit: 'mg/kg',
        icon: 'cellular-outline',
        color: '#f9a825',
        low: { label: 'Deficient', color: '#e53935', advice: 'Apply Muriate of Potash (MOP) at 150–200 kg/ha. Potassium is vital for berry quality and drought resistance.' },
        optimal: { label: 'Optimal', color: '#2e7d32', advice: 'Potassium is well-balanced. No corrective action is needed at this time.' },
        high: { label: 'Excess', color: '#e65100', advice: 'Avoid additional potassium. Excess K can cause nutrient antagonism with magnesium and calcium.' },
    },
    pH: {
        ranges: { low: 5.5, high: 7.0 },
        unit: '',
        icon: 'analytics-outline',
        color: '#6d4c41',
        low: { label: 'Acidic', color: '#e53935', advice: 'Apply agricultural lime (CaCO₃) at 1–2 t/ha. Black pepper thrives between pH 5.5–7.0.' },
        optimal: { label: 'Ideal pH', color: '#2e7d32', advice: 'Soil pH is in the ideal range for black pepper (5.5–7.0). No pH correction needed.' },
        high: { label: 'Alkaline', color: '#e65100', advice: 'Apply elemental sulphur or acidifying fertilizers to gradually lower pH to the optimal range.' },
    },
    Moisture: {
        ranges: { low: 35, high: 70 },
        unit: '%',
        icon: 'water-outline',
        color: '#00acc1',
        low: { label: 'Dry', color: '#e53935', advice: 'Irrigate immediately. Black pepper requires consistent soil moisture. Drip irrigation is highly recommended.' },
        optimal: { label: 'Optimal', color: '#2e7d32', advice: 'Soil moisture is ideal. Monitor during dry spells and water when it drops below 40%.' },
        high: { label: 'Waterlogged', color: '#1e88e5', advice: 'Improve drainage urgently. Waterlogging causes Phytophthora root rot, which is fatal to black pepper.' },
    },
    Temperature: {
        ranges: { low: 18, high: 35 },
        unit: '°C',
        icon: 'thermometer-outline',
        color: '#e65100',
        low: { label: 'Too Cold', color: '#1e88e5', advice: 'Temperature is below optimal range. Protect vines with organic mulch to retain soil warmth.' },
        optimal: { label: 'Optimal', color: '#2e7d32', advice: 'Soil temperature is ideal for black pepper root activity and nutrient uptake.' },
        high: { label: 'Too Hot', color: '#e53935', advice: 'High temperature stress detected. Increase irrigation frequency and apply shade where possible.' },
    },
};

function getSensorStatus(key, value) {
    const ref = FERT_REFERENCE[key];
    if (!ref || value === null || value === undefined) return null;
    if (value < ref.ranges.low) return 'low';
    if (value > ref.ranges.high) return 'high';
    return 'optimal';
}

function buildOverallSummary(sensors) {
    if (!sensors) return null;
    const issues = [];
    Object.entries(FERT_REFERENCE).forEach(([key, ref]) => {
        const v = sensors[key];
        const status = getSensorStatus(key, v);
        if (status === 'low') issues.push(`Low ${key}`);
        if (status === 'high') issues.push(`Excess ${key}`);
    });
    if (issues.length === 0) return { text: 'All nutrients are within optimal range. Your black pepper soil is in excellent condition! 🎉', good: true };
    return { text: `Action needed: ${issues.join(', ')}. See detailed advice below.`, good: false };
}

function NutrientRow({ sensorKey, value, index }) {
    const ref = FERT_REFERENCE[sensorKey];
    if (!ref) return null;
    const status = getSensorStatus(sensorKey, value);
    const info = status ? ref[status] : null;
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, { toValue: 1, duration: 480, delay: index * 90, useNativeDriver: true }).start();
    }, []);

    return (
        <Animated.View style={[
            styles.nutrientCard,
            { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
        ]}>
            {/* Header row */}
            <View style={styles.nutrientTop}>
                <View style={styles.nutrientLeft}>
                    <View style={[styles.nutrientIconWrap, { backgroundColor: `${ref.color}18`, borderColor: `${ref.color}44` }]}>
                        <Ionicons name={ref.icon} size={18} color={ref.color} />
                    </View>
                    <View>
                        <Text style={styles.nutrientName}>{sensorKey}</Text>
                        <Text style={styles.nutrientUnit}>{ref.unit ? `Optimal: ${ref.ranges.low}–${ref.ranges.high} ${ref.unit}` : `Optimal: ${ref.ranges.low}–${ref.ranges.high}`}</Text>
                    </View>
                </View>
                <View style={styles.nutrientRight}>
                    <Text style={[styles.nutrientValue, { color: ref.color }]}>
                        {value !== null && value !== undefined ? `${value}${ref.unit}` : '--'}
                    </Text>
                    {info && (
                        <View style={[styles.statusTag, { backgroundColor: `${info.color}18`, borderColor: `${info.color}44` }]}>
                            <Text style={[styles.statusTagText, { color: info.color }]}>{info.label}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Advice */}
            {info && (
                <View style={[styles.adviceRow, { borderLeftColor: info.color }]}>
                    <Ionicons name="information-circle-outline" size={15} color={info.color} style={{ marginTop: 1 }} />
                    <Text style={styles.adviceText}>{info.advice}</Text>
                </View>
            )}

            {/* No data */}
            {!info && (
                <View style={styles.noDataRow}>
                    <Text style={styles.noDataText}>Waiting for sensor reading...</Text>
                </View>
            )}
        </Animated.View>
    );
}

export default function FertilizerAdvisorScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [soilData, setSoilData] = useState(null);
    const [aiRec, setAiRec] = useState(null);
    const heroAnim = useRef(new Animated.Value(0)).current;

    const fetchAll = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else if (!soilData) setLoading(true);
        setError(null);

        try {
            const soilRes = await axios.get(SOIL_API_URL, { timeout: 10000 });
            setSoilData(soilRes.data);

            // Optional AI recommendation endpoint
            try {
                const fertRes = await axios.get(FERT_API_URL, { timeout: 6000 });
                setAiRec(fertRes.data);
            } catch {
                setAiRec(null); // graceful — local reference table still works
            }

            Animated.timing(heroAnim, { toValue: 1, duration: 650, useNativeDriver: true }).start();
        } catch (err) {
            const msg =
                err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')
                    ? 'Cannot reach backend. Ensure it is running on port 5000.'
                    : err.code === 'ECONNABORTED'
                        ? 'Request timed out. The sensor backend may be busy.'
                        : `Backend error: ${err.response?.data?.error || err.message}`;
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [heroAnim]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const s = soilData?.sensors || {};

    const NUTRIENT_KEYS = ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Moisture', 'Temperature'];

    // Overall health score
    const statuses = NUTRIENT_KEYS.map(k => getSensorStatus(k, s[k]));
    const optimalCnt = statuses.filter(st => st === 'optimal').length;
    const totalCnt = statuses.filter(st => st !== null).length;
    const healthPct = totalCnt > 0 ? Math.round((optimalCnt / totalCnt) * 100) : null;
    const healthColor = healthPct >= 80 ? '#2e7d32' : healthPct >= 50 ? '#f57c00' : '#c62828';

    const summary = buildOverallSummary(soilData ? s : null);

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} colors={['#f57c00']} />}
        >
            {/* Hero */}
            <LinearGradient colors={['#bf360c', '#e64a19', '#ff7043']} style={styles.hero}>
                <View style={styles.heroBg1} />
                <View style={styles.heroBg2} />
                <Animated.View style={[styles.heroBody, { opacity: heroAnim }]}>
                    <View style={styles.heroIconWrap}>
                        <Text style={{ fontSize: 36 }}>🧪</Text>
                    </View>
                    <Text style={styles.heroTitle}>Fertilizer Advisor</Text>
                    <Text style={styles.heroSub}>
                        AI-powered nutrient recommendations{'\n'}for Black Pepper farming
                    </Text>

                    {healthPct !== null && (
                        <View style={styles.healthScore}>
                            <Text style={[styles.healthPct, { color: healthColor === '#2e7d32' ? '#fff' : '#fff' }]}>{healthPct}%</Text>
                            <Text style={styles.healthLabel}>Soil Health Score</Text>
                            <Text style={styles.healthSub}>{optimalCnt}/{totalCnt} parameters optimal</Text>
                        </View>
                    )}

                    {soilData?.timestamp && (
                        <Text style={styles.tsText}>
                            Sensor data: {new Date(soilData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </Text>
                    )}
                </Animated.View>
            </LinearGradient>

            <View style={styles.body}>
                {/* Error */}
                {error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="warning-outline" size={16} color="#e53935" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {loading && !soilData ? (
                    <ActivityIndicator size="large" color="#e65100" style={{ marginTop: 60 }} />
                ) : (
                    <>
                        {/* Overall Summary */}
                        {summary && (
                            <View style={[styles.summaryCard, { borderLeftColor: summary.good ? '#2e7d32' : '#e65100', backgroundColor: summary.good ? '#e8f5e9' : '#fff3e0' }]}>
                                <Text style={[styles.summaryText, { color: summary.good ? '#1b5e20' : '#bf360c' }]}>
                                    {summary.text}
                                </Text>
                            </View>
                        )}

                        {/* AI Model Recommendation (if backend provides it) */}
                        {aiRec && (
                            <View style={styles.aiCard}>
                                <View style={styles.aiCardTop}>
                                    <Text style={styles.aiCardIcon}>🤖</Text>
                                    <Text style={styles.aiCardTitle}>ML Model Recommendation</Text>
                                </View>
                                <Text style={styles.aiCardText}>
                                    {aiRec.recommendation || aiRec.message || aiRec.prediction}
                                </Text>
                            </View>
                        )}

                        {/* AI consensus from soil analysis */}
                        {soilData?.ai_analysis && (
                            <View style={[styles.verdictCard, {
                                borderLeftColor: soilData.ai_analysis.status === 'Healthy' ? '#43a047' : '#e53935',
                                backgroundColor: soilData.ai_analysis.status === 'Healthy' ? '#e8f5e9' : '#ffebee',
                            }]}>
                                <View style={styles.verdictTop}>
                                    <Text style={styles.verdictIcon}>{soilData.ai_analysis.status === 'Healthy' ? '✅' : '⚠️'}</Text>
                                    <Text style={styles.verdictLabel}>Ensemble ML Verdict</Text>
                                </View>
                                <Text style={[styles.verdictPred, { color: soilData.ai_analysis.status === 'Healthy' ? '#2e7d32' : '#c62828' }]}>
                                    {soilData.ai_analysis.prediction || soilData.ai_analysis.consensus}
                                </Text>
                            </View>
                        )}

                        {/* Section header */}
                        <View style={styles.sectionHead}>
                            <Text style={styles.sectionTitle}>Nutrient Analysis</Text>
                            {soilData?.timestamp && (
                                <Text style={styles.timestamp}>
                                    {new Date(soilData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            )}
                        </View>

                        {/* Per-nutrient rows */}
                        {NUTRIENT_KEYS.map((key, idx) => (
                            <NutrientRow
                                key={key}
                                sensorKey={key}
                                value={s[key] ?? null}
                                index={idx}
                            />
                        ))}

                        {/* Black Pepper Fertilizer Calendar */}
                        <View style={styles.guideCard}>
                            <View style={styles.guideTop}>
                                <Ionicons name="calendar-outline" size={18} color="#4a148c" />
                                <Text style={styles.guideTitle}>Black Pepper Fertilizer Calendar</Text>
                            </View>
                            {[
                                { period: 'March – April', icon: '🌱', action: 'Apply 1/3 of annual NPK dose. Use 20:20:20 compound fertilizer at planting season start.' },
                                { period: 'June – July', icon: '🌿', action: 'Apply second 1/3 dose. Add magnesium sulphate (10 kg/ha) if leaf yellowing is observed.' },
                                { period: 'October – Nov', icon: '🫑', action: 'Final 1/3 dose. Focus on potassium-rich fertilizer to harden berries before harvest.' },
                            ].map(g => (
                                <View key={g.period} style={styles.guideRow}>
                                    <Text style={styles.guideEmoji}>{g.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.guidePeriod}>{g.period}</Text>
                                        <Text style={styles.guideAction}>{g.action}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Refresh */}
                <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchAll(false)} activeOpacity={0.8}>
                    <LinearGradient colors={['#e64a19', '#ff7043']} style={styles.refreshGrad}>
                        <Ionicons name="refresh-outline" size={18} color="#fff" />
                        <Text style={styles.refreshText}>{loading ? 'Analyzing...' : 'Refresh Analysis'}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.soilBtn} onPress={() => navigation.navigate('SoilMonitor')} activeOpacity={0.8}>
                    <Ionicons name="flask-outline" size={16} color="#2d5016" />
                    <Text style={styles.soilBtnText}>View Raw Soil Readings</Text>
                </TouchableOpacity>

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

    hero: { paddingTop: 40, paddingBottom: 36, paddingHorizontal: 24, overflow: 'hidden' },
    heroBg1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)', top: -70, right: -50 },
    heroBg2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -30 },
    heroBody: { alignItems: 'center' },
    heroIconWrap: {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
    heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20, marginBottom: 18 },
    healthScore: {
        backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16,
        paddingHorizontal: 28, paddingVertical: 14, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', marginBottom: 10,
    },
    healthPct: { fontSize: 38, fontWeight: '900', color: '#fff' },
    healthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
    healthSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
    tsText: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 },

    body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },

    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginBottom: 14 },
    errorText: { color: '#e53935', fontSize: 13, flex: 1 },

    summaryCard: { borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 5 },
    summaryText: { fontSize: 14, lineHeight: 21, fontWeight: '600' },

    aiCard: { backgroundColor: '#ede7f6', borderRadius: 14, padding: 14, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#7b1fa2' },
    aiCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    aiCardIcon: { fontSize: 18 },
    aiCardTitle: { fontSize: 13, fontWeight: '800', color: '#4a148c' },
    aiCardText: { fontSize: 13, color: '#311b92', lineHeight: 19 },

    verdictCard: { borderRadius: 14, padding: 14, marginBottom: 14, borderLeftWidth: 4 },
    verdictTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    verdictIcon: { fontSize: 18 },
    verdictLabel: { fontSize: 13, fontWeight: '800', color: '#333' },
    verdictPred: { fontSize: 20, fontWeight: '900', textAlign: 'center' },

    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a3c0d' },
    timestamp: { fontSize: 11, color: '#6a9e5a', fontWeight: '600' },

    /* Nutrient card */
    nutrientCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5,
    },
    nutrientTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    nutrientLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    nutrientIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    nutrientName: { fontSize: 14, fontWeight: '800', color: '#2d3e2d' },
    nutrientUnit: { fontSize: 10, color: '#888', marginTop: 1 },
    nutrientRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nutrientValue: { fontSize: 18, fontWeight: '900', color: '#333' },
    statusTag: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    statusTagText: { fontSize: 10, fontWeight: '800' },
    adviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 4 },
    adviceText: { fontSize: 12.5, color: '#444', lineHeight: 18, flex: 1 },
    noDataRow: { padding: 8 },
    noDataText: { fontSize: 12, color: '#aaa', fontStyle: 'italic' },

    /* Guide card */
    guideCard: { backgroundColor: '#f3e5f5', borderRadius: 16, padding: 16, marginBottom: 18, borderLeftWidth: 5, borderLeftColor: '#7b1fa2' },
    guideTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    guideTitle: { fontSize: 14, fontWeight: '800', color: '#4a148c' },
    guideRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
    guideEmoji: { fontSize: 20, marginTop: 2 },
    guidePeriod: { fontSize: 12, fontWeight: '800', color: '#4a148c', marginBottom: 3 },
    guideAction: { fontSize: 12.5, color: '#311b92', lineHeight: 17 },

    /* Buttons */
    refreshBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
    refreshGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    refreshText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    soilBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 13, backgroundColor: '#e8f5e9',
        borderRadius: 14, borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 10,
    },
    soilBtnText: { color: '#2d5016', fontSize: 14, fontWeight: '700' },

    hubBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 13, backgroundColor: '#fff',
        borderRadius: 14, borderWidth: 1, borderColor: '#ddd',
    },
    hubBtnText: { color: '#2d5016', fontSize: 14, fontWeight: '700' },
});
