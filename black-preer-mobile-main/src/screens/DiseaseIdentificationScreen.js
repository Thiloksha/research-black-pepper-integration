import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

function AnimatedCard({ style, children, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DiseaseIdentificationScreen({ navigation }) {
  const [selectedDisease, setSelectedDisease] = useState(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartDetection = () => {
    navigation.navigate('DiseaseUpload');
  };

  const diseases = [
    {
      key: 'healthy',
      name: 'Healthy Leaf',
      short: 'Normal black pepper leaf condition without visible disease symptoms.',
      icon: 'checkmark-circle-outline',
      symptoms:
        '• Leaf surface appears fresh and green\n• No visible brown patches or yellowing\n• No wilting, drying, or fungal spots\n• Leaf veins and edges look normal',
      causes:
        'Healthy leaves usually indicate good crop condition, suitable watering, balanced nutrients, and low disease pressure.',
      treatment:
        '• Continue regular monitoring\n• Maintain proper irrigation\n• Use organic matter and balanced fertilizer\n• Keep the growing area clean\n• Inspect leaves weekly for early symptoms',
      summary:
        'A healthy prediction means the leaf does not show clear disease symptoms. Farmers should continue good crop management and regular inspection.',
    },
    {
      key: 'leaf_blight',
      name: 'Leaf Blight',
      short: 'A common disease condition that causes dark patches and damaged leaf tissue.',
      icon: 'bug-outline',
      symptoms:
        '• Brown or black spots on leaves\n• Dry patches spreading from edges or center\n• Yellowing around infected areas\n• Leaf tissue may become weak or brittle\n• Severe infection can reduce plant growth',
      causes:
        'Leaf blight may occur due to fungal infection, high humidity, poor air circulation, infected plant debris, and wet leaf surfaces for long periods.',
      treatment:
        '• Remove severely infected leaves\n• Avoid overhead watering\n• Improve air circulation around vines\n• Keep the field clean from infected debris\n• Apply recommended fungicide with agricultural guidance\n• Monitor nearby plants for spread',
      summary:
        'Leaf blight should be managed early because it can spread and reduce black pepper leaf health and productivity.',
    },
    {
      key: 'slow_wilt',
      name: 'Slow Wilt',
      short: 'A serious condition where the plant gradually loses strength and wilts over time.',
      icon: 'warning-outline',
      symptoms:
        '• Gradual yellowing of leaves\n• Leaves may droop or wilt slowly\n• Weak plant growth\n• Drying of branches or vines\n• Root zone may show poor health\n• Symptoms usually develop slowly',
      causes:
        'Slow wilt can be related to root damage, poor drainage, soil-borne pathogens, nutrient imbalance, or long-term stress conditions.',
      treatment:
        '• Improve soil drainage\n• Avoid waterlogging around roots\n• Remove badly affected plant parts\n• Apply organic matter to improve soil condition\n• Check root health regularly\n• Consult an agricultural officer for severe infections',
      summary:
        'Slow wilt is important to detect early because it may affect the whole vine gradually and reduce long-term crop productivity.',
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
          style={styles.gradient}
        >
          <View style={styles.page}>
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.heroBadge}>
                <Ionicons name="medkit-outline" size={16} color="#1f6f43" />
                <Text style={styles.heroBadgeText}>AI Disease Knowledge Base</Text>
              </View>

              <View style={styles.heroIconCircle}>
                <Ionicons name="bug-outline" size={32} color="#1c5636" />
              </View>

              <Text style={styles.title}>Black Pepper Disease Information</Text>

              <Text style={styles.subtitle}>
                Learn about black pepper leaf health conditions, disease symptoms,
                possible causes, and treatment guidance before starting AI-based
                disease detection.
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.contentWrapper,
                {
                  opacity: cardFadeAnim,
                  transform: [{ translateY: cardSlideAnim }],
                },
              ]}
            >
              <View style={styles.infoCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#1f6f43"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>
                      About Disease Identification
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      AI-supported black pepper leaf disease analysis
                    </Text>
                  </View>
                </View>

                <Text style={styles.text}>
                  This module helps identify black pepper leaf conditions using
                  image-based artificial intelligence. The system analyzes uploaded
                  or captured leaf images and predicts whether the leaf is healthy,
                  affected by leaf blight, or showing slow wilt symptoms. The result
                  includes confidence level, description, treatment advice, and class
                  probabilities.
                </Text>
              </View>

              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Disease Categories</Text>
                <Text style={styles.listSubtitle}>
                  Select a category to view symptoms, causes, and treatment guidance
                </Text>
              </View>

              <View
                style={[
                  styles.diseaseGrid,
                  isLargeScreen && styles.diseaseGridLarge,
                ]}
              >
                {diseases.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.diseaseCard,
                      isLargeScreen && styles.diseaseCardLarge,
                    ]}
                    onPress={() => setSelectedDisease(item)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.diseaseTopRow}>
                      <View style={styles.diseaseIconWrap}>
                        <Ionicons name={item.icon} size={26} color="#1f6f43" />
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#6d8277"
                      />
                    </View>

                    <Text style={styles.diseaseName}>{item.name}</Text>
                    <Text style={styles.diseaseShort}>{item.short}</Text>

                    <View style={styles.diseaseFooter}>
                      <Text style={styles.diseaseFooterText}>
                        View disease details
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <AnimatedCard
                  style={[
                    styles.startDetectionCard,
                    isLargeScreen && styles.diseaseCardLarge,
                  ]}
                  onPress={handleStartDetection}
                >
                  <View style={styles.diseaseTopRow}>
                    <View style={styles.startIconWrap}>
                      <Ionicons name="camera-outline" size={26} color="#ffffff" />
                    </View>

                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={22}
                      color="#ffffff"
                    />
                  </View>

                  <Text style={styles.startCardName}>Start Detection</Text>
                  <Text style={styles.startCardShort}>
                    Upload or capture a black pepper leaf image and get AI-based
                    disease prediction.
                  </Text>

                  <View style={styles.startCardFooter}>
                    <Text style={styles.startCardFooterText}>
                      Open disease detection
                    </Text>
                  </View>
                </AnimatedCard>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={!!selectedDisease}
        onRequestClose={() => setSelectedDisease(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDisease && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleWrap}>
                    <View style={styles.modalTitleIcon}>
                      <Ionicons
                        name={selectedDisease.icon}
                        size={22}
                        color="#1f6f43"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedDisease.name}</Text>
                      <Text style={styles.modalSubtitle}>
                        Disease profile and management guidance
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedDisease(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={22} color="#4f6659" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons name="eye-outline" size={18} color="#1f6f43" />
                      <Text style={styles.modalSectionTitle}>Visible Symptoms</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedDisease.symptoms}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons
                        name="analytics-outline"
                        size={18}
                        color="#1f6f43"
                      />
                      <Text style={styles.modalSectionTitle}>Possible Causes</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedDisease.causes}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailTitleRow}>
                      <Ionicons
                        name="medkit-outline"
                        size={18}
                        color="#1f6f43"
                      />
                      <Text style={styles.modalSectionTitle}>
                        Treatment & Management
                      </Text>
                    </View>
                    <Text style={styles.modalText}>{selectedDisease.treatment}</Text>
                  </View>

                  <View style={styles.summaryBox}>
                    <View style={styles.summaryHeader}>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color="#1f6f43"
                      />
                      <Text style={styles.summaryTitle}>Summary Insight</Text>
                    </View>
                    <Text style={styles.summaryText}>{selectedDisease.summary}</Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#10231a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
  android: {
    elevation: 5,
  },
  web: {
    boxShadow: '0px 12px 28px rgba(16, 35, 26, 0.08)',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dbeadf',
  },

  container: {
    flex: 1,
    backgroundColor: '#dbeadf',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  gradient: {
    flex: 1,
    minHeight: '100%',
  },

  page: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },

  heroSection: {
    width: '100%',
    maxWidth: 1180,
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf8f0',
    borderWidth: 1,
    borderColor: '#d8ebdd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },

  heroBadgeText: {
    marginLeft: 8,
    color: '#1f6f43',
    fontSize: 13,
    fontWeight: '700',
  },

  heroIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e6f1e9',
    ...shadowStyle,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#143b27',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: '#5b7666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 760,
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 1180,
  },

  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef8f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#163a28',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13.5,
    color: '#6f8578',
    lineHeight: 20,
  },

  text: {
    fontSize: 15,
    lineHeight: 26,
    color: '#44574c',
  },

  listHeader: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#163a28',
    marginBottom: 4,
  },

  listSubtitle: {
    fontSize: 14,
    color: '#6f8578',
  },

  diseaseGrid: {
    gap: 14,
  },

  diseaseGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  diseaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },

  diseaseCardLarge: {
    width: '32%',
    minWidth: 280,
    marginBottom: 16,
  },

  startDetectionCard: {
    backgroundColor: '#1f6f43',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f6f43',
    ...shadowStyle,
  },

  diseaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  diseaseIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8ebdd',
  },

  startIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  diseaseName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 10,
  },

  diseaseShort: {
    fontSize: 14,
    color: '#6f8478',
    lineHeight: 22,
    marginBottom: 18,
  },

  startCardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },

  startCardShort: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 22,
    marginBottom: 18,
  },

  diseaseFooter: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef4f0',
  },

  diseaseFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f6f43',
  },

  startCardFooter: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
  },

  startCardFooterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 11, 0.55)',
    justifyContent: 'center',
    padding: 18,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3ef',
  },

  modalTitleWrap: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },

  modalTitleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#edf8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#143b27',
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13.5,
    color: '#708579',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f4f8f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalScrollContent: {
    paddingBottom: 20,
  },

  detailSection: {
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e8f1ea',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#163a28',
    marginLeft: 8,
  },

  modalText: {
    fontSize: 14.5,
    lineHeight: 24,
    color: '#44574c',
  },

  summaryBox: {
    backgroundColor: '#edf8f0',
    padding: 16,
    borderRadius: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#dcecdf',
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  summaryTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#163a28',
  },

  summaryText: {
    color: '#29523c',
    fontSize: 14.5,
    lineHeight: 24,
  },
});