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

export default function HomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('Analysis');
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
            Visual Analysis for Black Pepper Health{'\n'}and Post-Harvest Grading
          </Text>
          <Text style={styles.heroSubtitle}>
            An integrated AI-powered system for automated black pepper berry analysis,
            combining computer vision and machine learning for quality assessment,
            defect detection, and intelligent curing prediction
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🚀 Start Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>95%+</Text>
            <Text style={styles.statLabel}>Classification Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3000+</Text>
            <Text style={styles.statLabel}>Training Images</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Defect Types</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Real-time</Text>
            <Text style={styles.statLabel}>Curing Prediction</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Integrated System Components</Text>
        <Text style={styles.sectionSubtitle}>
          Four specialized components working together to provide comprehensive
          black pepper analysis and post-harvest optimization
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🤖</Text>
          <Text style={styles.featureTitle}>Automated Grading & Curing Prediction</Text>
          <Text style={styles.featureDescription}>
            AI-powered quality grading (A-D), multi-label defect detection (4 types),
            and intelligent curing time prediction using environmental parameters
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🔬</Text>
          <Text style={styles.featureTitle}>Disease Detection & Classification</Text>
          <Text style={styles.featureDescription}>
            Computer vision-based disease identification system for black pepper
            plants and berries with early detection capabilities
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🌱</Text>
          <Text style={styles.featureTitle}>Maturity Assessment</Text>
          <Text style={styles.featureDescription}>
            Visual analysis system to determine optimal harvest time by assessing
            berry ripeness and maturity stages
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>📦</Text>
          <Text style={styles.featureTitle}>Storage & Preservation Monitoring</Text>
          <Text style={styles.featureDescription}>
            IoT-enabled monitoring system for tracking storage conditions and ensuring
            optimal preservation of processed black pepper
          </Text>
        </View>
      </View>

      {/* AI Models Section */}
      <View style={styles.modelsSection}>
        <Text style={styles.sectionTitle}>Three Powerful AI Models</Text>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>⭐</Text>
          <Text style={styles.modelTitle}>Quality Grading</Text>
          <Text style={styles.modelDescription}>
            Automatically classify black pepper berries into quality grades (A, B, C, D)
            using MobileNetV2 deep learning architecture.
          </Text>
        </View>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>🔍</Text>
          <Text style={styles.modelTitle}>Defect Detection</Text>
          <Text style={styles.modelDescription}>
            Identify multiple defect types including shriveled, broken, immature, and
            discolored berries using EfficientNetB0.
          </Text>
        </View>

        <View style={styles.modelCard}>
          <Text style={styles.modelEmoji}>⏱️</Text>
          <Text style={styles.modelTitle}>Curing Time Prediction</Text>
          <Text style={styles.modelDescription}>
            Predict remaining curing time based on moisture content, environmental
            conditions, and berry characteristics.
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
            <Text style={styles.stepTitle}>1. Upload Image</Text>
            <Text style={styles.stepDescription}>Upload clear images of black pepper berries</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>📝</Text>
            </View>
            <Text style={styles.stepTitle}>2. Enter Details</Text>
            <Text style={styles.stepDescription}>Provide moisture content and environmental data</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>🤖</Text>
            </View>
            <Text style={styles.stepTitle}>3. AI Analysis</Text>
            <Text style={styles.stepDescription}>Our models process and analyze your data</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepEmoji}>📊</Text>
            </View>
            <Text style={styles.stepTitle}>4. Get Results</Text>
            <Text style={styles.stepDescription}>Receive comprehensive analysis and recommendations</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CTA Section */}
      <LinearGradient
        colors={['#3d6b1f', '#1a3409']}
        style={styles.ctaSection}
      >
        <Text style={styles.ctaTitle}>
          Ready to Optimize Your Black Pepper Quality Control?
        </Text>
        <Text style={styles.ctaSubtitle}>
          Start using our AI-powered system today
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Begin Analysis Now →</Text>
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
  secondaryButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(139, 195, 74, 0.8)',
  },
  secondaryButtonText: {
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
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
