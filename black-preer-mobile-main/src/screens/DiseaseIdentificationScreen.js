import React, { useEffect, useRef, useState } from 'react';
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

const howItWorksData = [
  {
    id: 1,
    emoji: '📸',
    title: 'Capture Leaf Image',
    description: 'Take a clear photo of the black pepper leaf',
  },
  {
    id: 2,
    emoji: '🧠',
    title: 'AI Disease Analysis',
    description: 'The model analyzes symptoms, colors, and patterns',
  },
  {
    id: 3,
    emoji: '📋',
    title: 'Get Prediction',
    description: 'View disease type and confidence score',
  },
  {
    id: 4,
    emoji: '🌱',
    title: 'Take Action',
    description: 'Use the result for better treatment decisions',
  },
];

export default function DiseaseIdentificationScreen({ navigation }) {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleStartDetection = () => {
    navigation.navigate('DiseaseUpload');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide =
        currentSlide === howItWorksData.length - 1 ? 0 : currentSlide + 1;

      setCurrentSlide(nextSlide);

      sliderRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleManualScroll = (event) => {
    const slideWidth = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setCurrentSlide(index);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            AI-Powered Black Pepper Leaf{'\n'}Disease Identification
          </Text>

          <Text style={styles.heroSubtitle}>
            Detect diseases in black pepper leaves using computer vision and deep
            learning. Upload a leaf image and receive fast, intelligent predictions
            with confidence levels and treatment guidance.
          </Text>
        </View>
      </View>

      {/* How It Works Slider */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>

        <Text style={styles.sectionSubtitle}>
          Follow these simple steps to identify black pepper leaf diseases
        </Text>

        <View style={styles.sliderWrapper}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleManualScroll}
          >
            {howItWorksData.map((item) => (
              <View key={item.id} style={styles.slidePage}>
                <View style={styles.slideCard}>
                  <Text style={styles.howCardEmoji}>{item.emoji}</Text>
                  <Text style={styles.howCardTitle}>{item.title}</Text>
                  <Text style={styles.howCardDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dotsContainer}>
          {howItWorksData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

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
    backgroundColor: '#f5f9f4',
  },

  heroContent: {
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 36,
  },

  heroSubtitle: {
    fontSize: 16,
    color: '#2d5016',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
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
    marginBottom: 25,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  howItWorksSection: {
    paddingVertical: 25,
    backgroundColor: '#f8f9fa',
  },

  sliderWrapper: {
    height: 260,
  },

  slidePage: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  slideCard: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 35,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  howCardEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },

  howCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 10,
    textAlign: 'center',
  },

  howCardDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },

  activeDot: {
    backgroundColor: '#2d5016',
    width: 22,
  },

  inactiveDot: {
    backgroundColor: '#cfd8dc',
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