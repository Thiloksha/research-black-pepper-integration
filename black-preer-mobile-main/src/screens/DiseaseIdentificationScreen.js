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

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>94%+</Text>
            <Text style={styles.statLabel}>Detection Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3+</Text>
            <Text style={styles.statLabel}>Disease Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Fast</Text>
            <Text style={styles.statLabel}>Prediction Speed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Image Analysis</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Disease Detection Capabilities</Text>
        <Text style={styles.sectionSubtitle}>
          Intelligent leaf disease identification for early diagnosis and better
          crop management
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🍃</Text>
          <Text style={styles.featureTitle}>Leaf Disease Classification</Text>
          <Text style={styles.featureDescription}>
            Analyze black pepper leaf images and classify visible symptoms into
            disease categories using trained deep learning models.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>⚠️</Text>
          <Text style={styles.featureTitle}>Early Disease Detection</Text>
          <Text style={styles.featureDescription}>
            Identify possible disease conditions at an early stage to help reduce
            spread and support timely treatment decisions.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>📷</Text>
          <Text style={styles.featureTitle}>Image-Based Analysis</Text>
          <Text style={styles.featureDescription}>
            Use captured or uploaded leaf images for fast automated analysis without
            requiring manual expert inspection.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>💡</Text>
          <Text style={styles.featureTitle}>Treatment Guidance</Text>
          <Text style={styles.featureDescription}>
            Provide disease prediction results together with confidence levels and
            basic recommendations for further action.
          </Text>
        </View>
      </View>

      {/* AI Model Section */}
      <View style={styles.modelsSection}>
        <Text style={styles.sectionTitle}>Detection Workflow</Text>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>🖼️</Text>
          <Text style={styles.modelTitle}>Image Upload</Text>
          <Text style={styles.modelDescription}>
            Upload or capture a black pepper leaf image using your mobile device.
          </Text>
        </View>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>🤖</Text>
          <Text style={styles.modelTitle}>AI Processing</Text>
          <Text style={styles.modelDescription}>
            The trained model extracts visual features from the image and predicts
            the most likely disease class.
          </Text>
        </View>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>📊</Text>
          <Text style={styles.modelTitle}>Prediction Result</Text>
          <Text style={styles.modelDescription}>
            Display the identified disease, confidence score, and useful next-step
            recommendations for the farmer or user.
          </Text>
        </View>
      </View>

      {/* How It Works Section */}
      <LinearGradient
        colors={['#e8f5e9', '#c8e6c9']}
        style={styles.howItWorksSection}
      >
        <Text style={styles.sectionTitle}>How It Works</Text>

        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>📸</Text>
            </View>
            <Text style={styles.stepTitle}>1. Capture Leaf Image</Text>
            <Text style={styles.stepDescription}>
              Take a clear photo of the black pepper leaf
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>🧠</Text>
            </View>
            <Text style={styles.stepTitle}>2. AI Disease Analysis</Text>
            <Text style={styles.stepDescription}>
              The model analyzes patterns, color changes, and leaf symptoms
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>📋</Text>
            </View>
            <Text style={styles.stepTitle}>3. Get Prediction</Text>
            <Text style={styles.stepDescription}>
              View predicted disease type and confidence score
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>🌱</Text>
            </View>
            <Text style={styles.stepTitle}>4. Take Action</Text>
            <Text style={styles.stepDescription}>
              Use the result to support treatment and crop management decisions
            </Text>
          </View>
        </View>
      </LinearGradient>

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
    minHeight: 600,
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
    marginBottom: 40,
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 30,
    gap: 15,
  },
  statCard: {
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: (width - 60) / 2,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8bc34a',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modelsSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  modelCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  modelEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 10,
    textAlign: 'center',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  howItWorksSection: {
    padding: 30,
  },
  stepContainer: {
    marginTop: 20,
  },
  step: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepEmoji: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
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