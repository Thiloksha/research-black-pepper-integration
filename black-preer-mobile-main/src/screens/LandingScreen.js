import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingScreen({ navigation }) {
    const handleHealth = () => {
        navigation.navigate('Home');
    };

    const handleFertilizer = () => {
        navigation.navigate('SoilAnalysis');
    };

    const handleDiseaseIdentification = () => {
        navigation.navigate('DiseaseIdentification');
    };

    return (
        <LinearGradient
            colors={['#1a3409', '#2d5016', '#1a3409']}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.emoji}>🌶️</Text>
                    <Text style={styles.title}>Black Pepper AI</Text>
                </View>

                <Text style={styles.subtitle}>
                    Select an analysis module to begin
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleHealth}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonIcon}>🔍</Text>
                        <Text style={styles.primaryButtonText}>Health & Post Harvest</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleFertilizer}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonIcon}>🌱</Text>
                        <Text style={styles.primaryButtonText}>Recommend Fertilizer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleDiseaseIdentification}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonIcon}>🦠</Text>
                        <Text style={styles.primaryButtonText}>
                            Identify Diseases in Leaves
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 50,
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    primaryButton: {
        backgroundColor: '#8bc34a',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 25,
        borderRadius: 15,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});