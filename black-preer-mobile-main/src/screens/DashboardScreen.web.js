import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Dummy Geospatial Data around Jaffna, Sri Lanka
const MOCK_PINS = [
    {
        id: 1,
        title: "Field A1 - Deficient",
        description: "Low Nitrogen & Phosphorus. Needs immediate fertilizer.",
        status: "needs_attention",
    },
    {
        id: 2,
        title: "Field B3 - Healthy",
        description: "Nutrient levels optimal.",
        status: "healthy",
    },
    {
        id: 3,
        title: "Field C2 - Deficient",
        description: "Low Potassium. Soil pH irregular.",
        status: "needs_attention",
    },
    {
        id: 4,
        title: "Field D4 - Healthy",
        description: "Fertilizer applied. Monitoring stable.",
        status: "healthy",
    },
];

export default function DashboardScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#1a3409', '#2d5016', '#1a3409']}
                style={styles.headerSection}
            >
                <Text style={styles.headerTitle}>Regional AI Dashboard</Text>
                <Text style={styles.headerSubtitle}>Jaffna District Overview</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>124</Text>
                        <Text style={styles.statLabel}>Fields Monitored</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>1,840</Text>
                        <Text style={styles.statLabel}>Predictions Processed</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.mapSection}>
                <Text style={styles.sectionTitle}>Live Geospatial Map</Text>
                <Text style={styles.sectionSubtitle}>Monitoring soil health across local farms.</Text>

                <View style={styles.webMapPlaceholder}>
                    <iframe
                        title="Jaffna Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125745.74852655823!2d79.94821612450531!3d9.664426577884451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe53fd7be66aa5%3A0xc7a1d00dc6f46ce!2sJaffna%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: 15 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </View>

                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                        <Text style={styles.legendText}>Deficient (Needs Fertilizer)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                        <Text style={styles.legendText}>Healthy Soil</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Regional Recommendations</Text>

                <View style={styles.actionCard}>
                    <Text style={styles.actionEmoji}>🔴</Text>
                    <View style={styles.actionTextContent}>
                        <Text style={styles.actionTitle}>High Priority: Nitrogen Boost</Text>
                        <Text style={styles.actionDescription}>
                            45% of monitored fields in South Jaffna showed severe Nitrogen depletion this week. Urea application recommended.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionCard}>
                    <Text style={styles.actionEmoji}>🟠</Text>
                    <View style={styles.actionTextContent}>
                        <Text style={styles.actionTitle}>Monitoring: Potassium Levels</Text>
                        <Text style={styles.actionDescription}>
                            Slight Potassium dip detected near West Jaffna borders. Suggesting MOP (Muriate of Potash) preparation.
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Field Summary</Text>
                {MOCK_PINS.map((pin) => (
                    <View key={pin.id} style={styles.fieldCard}>
                        <Text style={styles.fieldTitle}>{pin.title}</Text>
                        <Text style={styles.fieldDescription}>{pin.description}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerSection: {
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#aed581',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '45%',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#eee',
        textAlign: 'center',
        fontWeight: '600',
    },
    mapSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d5016',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    webMapPlaceholder: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#444',
        fontWeight: '600',
    },
    actionsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    actionCard: {
        flexDirection: 'row',
        backgroundColor: '#f9fbe7',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#8bc34a',
    },
    actionEmoji: {
        fontSize: 24,
        marginRight: 15,
        alignSelf: 'center',
    },
    actionTextContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    actionDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    listSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    fieldCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    fieldTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d5016',
        marginBottom: 5,
    },
    fieldDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});