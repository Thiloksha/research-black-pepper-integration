import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DiseaseIdentificationScreen({ navigation }) {
  const handleStartDetection = () => {
    navigation.navigate('DiseaseUpload');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#1a3409', '#2d5016', '#1a3409']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            AI-Powered Black Pepper Leaf{'\n'}Disease Identification
          </Text>

          <Text style={styles.heroSubtitle}>
            Detect diseases in black pepper leaves using computer vision and deep
            learning. Upload a leaf image and receive fast, intelligent predictions
            with confidence levels and treatment guidance.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartDetection}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🦠 Start Detection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionSubtitle}>
          Follow these simple steps to identify black pepper leaf diseases
        </Text>

        <View style={styles.howItWorksGrid}>
          <View style={styles.howCard}>
            <Text style={styles.howCardEmoji}>📸</Text>
            <Text style={styles.howCardTitle}>Capture Leaf Image</Text>
            <Text style={styles.howCardDescription}>
              Take a clear photo of the black pepper leaf
            </Text>
          </View>

          <View style={styles.howCard}>
            <Text style={styles.howCardEmoji}>🧠</Text>
            <Text style={styles.howCardTitle}>AI Disease Analysis</Text>
            <Text style={styles.howCardDescription}>
              The model analyzes symptoms, colors, and patterns
            </Text>
          </View>

          <View style={styles.howCard}>
            <Text style={styles.howCardEmoji}>📋</Text>
            <Text style={styles.howCardTitle}>Get Prediction</Text>
            <Text style={styles.howCardDescription}>
              View disease type and confidence score
            </Text>
          </View>

          <View style={styles.howCard}>
            <Text style={styles.howCardEmoji}>🌱</Text>
            <Text style={styles.howCardTitle}>Take Action</Text>
            <Text style={styles.howCardDescription}>
              Use the result for better treatment decisions
            </Text>
          </View>
        </View>
      </View>

      {/* Statistics Section */}
      {/* <View style={styles.statisticsSection}>
        <Text style={styles.sectionTitle}>System Statistics</Text>
        <Text style={styles.sectionSubtitle}>
          Key performance highlights of the disease detection system
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>94%+</Text>
            <Text style={styles.statLabelGreen}>Detection Accuracy</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3+</Text>
            <Text style={styles.statLabelGreen}>Disease Classes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Fast</Text>
            <Text style={styles.statLabelGreen}>Prediction Speed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabelGreen}>Image Analysis</Text>
          </View>
        </View>
      </View> */}

      {/* CTA Section */}
      <LinearGradient
        colors={['#3d6b1f', '#1a3409']}
        style={styles.ctaSection}
      >
        <Text style={styles.ctaTitle}>
          Ready to Identify Black Pepper Leaf Diseases?
        </Text>
        <Text style={styles.ctaSubtitle}>
          Start your AI-powered disease detection now
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartDetection}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Detect Disease Now →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  heroContent: {
    alignItems: 'center',
    marginTop: 20,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.95,
    paddingHorizontal: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#8bc34a',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 10,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },

  howItWorksSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },

  howItWorksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  howCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  howCardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },

  howCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 8,
  },

  howCardDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  statisticsSection: {
    padding: 20,
    backgroundColor: '#dcefdc',
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },

  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: (width - 60) / 2,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8bc34a',
    marginBottom: 5,
  },

  statLabelGreen: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: '600',
    textAlign: 'center',
  },

  ctaSection: {
    padding: 40,
    alignItems: 'center',
  },

  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },

  ctaSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.9,
  },

  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    elevation: 5,
  },

  ctaButtonText: {
    color: '#2d5016',
    fontSize: 16,
    fontWeight: '600',
  },
});