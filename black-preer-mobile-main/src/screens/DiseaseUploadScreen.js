import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width } = Dimensions.get('window');

const isSmallScreen = width < 480;
const isWideScreen = width >= 768;
const isLargeScreen = width >= 1024;

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5001'
    : 'http://192.168.8.110:5001';

export default function DiseaseUploadScreen({ navigation }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [result, setResult] = useState(null);

  const pickFromCamera = async () => {
    try {
      setWarningMessage('');
      setResult(null);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take a photo.'
        );
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setSelectedAsset(response.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const pickFromGallery = async () => {
    try {
      setWarningMessage('');
      setResult(null);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is needed to select an image.'
        );
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setSelectedAsset(response.assets[0]);
      }
    } catch (error) {
      console.log('Gallery error:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const handleDetectDisease = async () => {
    if (!selectedAsset) {
      setWarningMessage('Please upload or capture a leaf image first.');
      return;
    }

    try {
      setLoading(true);
      setWarningMessage('');
      setResult(null);

      const formData = new FormData();

      if (Platform.OS === 'web') {
        if (!selectedAsset.file) {
          throw new Error('Web image file not found. Please select the image again.');
        }

        formData.append('file', selectedAsset.file);
      } else {
        formData.append('file', {
          uri: selectedAsset.uri,
          name: selectedAsset.fileName || `leaf_${Date.now()}.jpg`,
          type: selectedAsset.mimeType || 'image/jpeg',
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/predict-image`,
        formData,
        { timeout: 60000 }
      );

      const data = response.data;

      if (!data?.ai_analysis) {
        throw new Error('Invalid response from server.');
      }

      const aiResult = data.ai_analysis;

      if (aiResult.rejected) {
        setWarningMessage(
          aiResult.reject_reason ||
            'The uploaded image is not recognized as a black pepper leaf. Please upload a clear black pepper leaf image.'
        );
        return;
      }

      setResult({
        image: selectedAsset.uri,
        disease: aiResult.prediction || 'Unknown',
        confidence: aiResult.confidence ?? 0,
        treatment: aiResult.advice || 'Consult an agricultural expert.',
        description: aiResult.description || '',
        probabilities: aiResult.all_probabilities || {},
        pepperScore: aiResult.pepper_score || null,
        lowConfidence: aiResult.low_confidence || false,
      });
    } catch (error) {
      console.log('Detection error:', error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.response?.data?.stdout ||
        error?.message ||
        'Failed to process image.';

      setWarningMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAsset(null);
    setWarningMessage('');
    setResult(null);
  };

  const confidenceNumber = Number(result?.confidence || 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
        style={styles.gradient}
      >
        <View style={styles.page}>
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🦠 AI Disease Detection</Text>
            </View>

            <View style={styles.heroIconCircle}>
              <Text style={styles.heroIcon}>🍃</Text>
            </View>

            <Text style={styles.title}>Black Pepper Disease Detection</Text>

            <Text style={styles.subtitle}>
              Upload or capture a black pepper leaf image to detect disease and
              view the result on the same screen.
            </Text>
          </View>

          <View
            style={[
              styles.contentWrapper,
              isLargeScreen && styles.contentWrapperLarge,
            ]}
          >
            <View style={[styles.card, isLargeScreen && styles.leftCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Leaf Image Input</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose camera or gallery and prepare the image for AI analysis
                </Text>
              </View>

              {warningMessage ? (
                <View style={styles.warningCard}>
                  <Text style={styles.warningTitle}>⚠ Warning</Text>
                  <Text style={styles.warningText}>{warningMessage}</Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.imageButtons,
                  isWideScreen && styles.imageButtonsRow,
                ]}
              >
                <TouchableOpacity
                  style={styles.imageOptionCard}
                  onPress={pickFromCamera}
                  activeOpacity={0.9}
                >
                  <Text style={styles.imageOptionIcon}>📷</Text>
                  <Text style={styles.imageOptionTitle}>Camera</Text>
                  <Text style={styles.imageOptionText}>
                    Capture a fresh leaf image using your device camera.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageOptionCard}
                  onPress={pickFromGallery}
                  activeOpacity={0.9}
                >
                  <Text style={styles.imageOptionIcon}>🖼️</Text>
                  <Text style={styles.imageOptionTitle}>Gallery</Text>
                  <Text style={styles.imageOptionText}>
                    Select an existing black pepper leaf image.
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedAsset?.uri ? (
                <View style={styles.previewWrapper}>
                  <Image
                    source={{ uri: selectedAsset.uri }}
                    style={styles.previewImage}
                  />

                  <View style={styles.previewFooter}>
                    <Text style={styles.previewFooterTitle}>Image Ready</Text>
                    <Text style={styles.previewFooterText}>
                      Your selected image is ready for disease analysis.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyPreview}>
                  <Text style={styles.emptyIcon}>🍃</Text>
                  <Text style={styles.emptyPreviewTitle}>No Image Selected</Text>
                  <Text style={styles.emptyPreviewText}>
                    Upload or capture a clear black pepper leaf image.
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.actionButtons,
                  isWideScreen && styles.actionButtonsRow,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleDetectDisease}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>🦠 Detect Disease</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleReset}
                  activeOpacity={0.9}
                >
                  <Text style={styles.secondaryButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>Tips for Better Results</Text>
                <Text style={styles.tipText}>• Use a clear image with good lighting.</Text>
                <Text style={styles.tipText}>• Capture the full leaf inside the frame.</Text>
                <Text style={styles.tipText}>• Avoid blurry or dark photos.</Text>
                <Text style={styles.tipText}>• Upload only black pepper leaf images.</Text>
              </View>
            </View>

            <View style={[styles.card, isLargeScreen && styles.rightCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Disease Result</Text>
                <Text style={styles.sectionSubtitle}>
                  Prediction, confidence, treatment, and class probabilities
                </Text>
              </View>

              {!result && !loading && (
                <View style={styles.emptyResults}>
                  <Text style={styles.emptyResultIcon}>📊</Text>
                  <Text style={styles.emptyResultsTitle}>No prediction yet</Text>
                  <Text style={styles.emptyResultsText}>
                    Select an image and click Detect Disease to view the result here.
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1f6f43" />
                  <Text style={styles.loadingText}>Processing image...</Text>
                  <Text style={styles.loadingSubText}>
                    Running disease classification and confidence scoring.
                  </Text>
                </View>
              )}

              {result && (
                <View style={styles.resultCard}>
                  {result.lowConfidence && (
                    <View style={styles.lowConfidenceBox}>
                      <Text style={styles.lowConfidenceText}>
                        ⚠ Low confidence result. Please upload a clearer image.
                      </Text>
                    </View>
                  )}

                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>Prediction Ready</Text>
                  </View>

                  <Text style={styles.resultLabel}>Detected Disease</Text>
                  <Text style={styles.resultMain}>{result.disease}</Text>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricTitle}>Confidence</Text>
                      <Text style={styles.metricValue}>
                        {confidenceNumber}%
                      </Text>
                    </View>

                    {result.pepperScore !== null && (
                      <View style={styles.metricBox}>
                        <Text style={styles.metricTitle}>Pepper Score</Text>
                        <Text style={styles.metricValue}>
                          {result.pepperScore}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.confidenceSection}>
                    <View style={styles.confidenceHeader}>
                      <Text style={styles.confidenceLabel}>Confidence Level</Text>
                      <Text style={styles.confidencePercent}>
                        {confidenceNumber}%
                      </Text>
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.max(
                              0,
                              Math.min(confidenceNumber, 100)
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {result.description ? (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>
                        {result.description}
                      </Text>
                    </View>
                  ) : null}

                  {result.treatment ? (
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>
                        Recommended Treatment
                      </Text>
                      <Text style={styles.descriptionText}>
                        {result.treatment}
                      </Text>
                    </View>
                  ) : null}

                  {result.probabilities &&
                    Object.keys(result.probabilities).length > 0 && (
                      <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>
                          Class Probabilities
                        </Text>

                        {Object.entries(result.probabilities).map(([key, value]) => (
                          <View key={key} style={styles.infoRow}>
                            <Text style={styles.infoKey}>{key}</Text>
                            <Text style={styles.infoValue}>{value}%</Text>
                          </View>
                        ))}
                      </View>
                    )}

                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('DiseaseHistory')}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.historyButtonText}>📜 View History</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: '#dbeadf',
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
    backgroundColor: '#edf8f0',
    borderWidth: 1,
    borderColor: '#d8ebdd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },

  heroBadgeText: {
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

  heroIcon: {
    fontSize: 34,
  },

  title: {
    fontSize: isSmallScreen ? 25 : 30,
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

  contentWrapperLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },

  leftCard: {
    flex: 1.02,
  },

  rightCard: {
    flex: 0.98,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: isSmallScreen ? 18 : 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },

  cardHeader: {
    marginBottom: 20,
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

  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffe08a',
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 6,
  },

  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },

  imageButtons: {
    gap: 14,
    marginBottom: 22,
  },

  imageButtonsRow: {
    flexDirection: 'row',
  },

  imageOptionCard: {
    flex: 1,
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e5efe8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 125,
  },

  imageOptionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  imageOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 4,
  },

  imageOptionText: {
    fontSize: 12,
    color: '#71867a',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 180,
  },

  previewWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5efe8',
    backgroundColor: '#f7faf8',
    marginBottom: 20,
  },

  previewImage: {
    width: '100%',
    height: Platform.OS === 'web' ? 360 : 300,
    resizeMode: 'cover',
  },

  previewFooter: {
    padding: 16,
    backgroundColor: '#f8fbf7',
  },

  previewFooterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 4,
  },

  previewFooterText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  emptyPreview: {
    minHeight: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#dceadf',
    borderStyle: 'dashed',
    backgroundColor: '#f9fcfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    fontSize: 54,
    marginBottom: 12,
  },

  emptyPreviewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c3f2b',
    marginBottom: 8,
  },

  emptyPreviewText: {
    fontSize: 14,
    color: '#7a9084',
    textAlign: 'center',
    lineHeight: 22,
  },

  actionButtons: {
    gap: 12,
    marginBottom: 18,
  },

  actionButtonsRow: {
    flexDirection: 'row',
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#1f6f43',
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonDisabled: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f9f6',
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9e7dc',
  },

  secondaryButtonText: {
    color: '#355f46',
    fontSize: 16,
    fontWeight: '800',
  },

  tipsCard: {
    backgroundColor: '#fbfdfb',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5efe8',
  },

  tipsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#163a28',
    marginBottom: 10,
  },

  tipText: {
    fontSize: 14,
    color: '#566f60',
    lineHeight: 22,
  },

  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
    minHeight: 420,
  },

  emptyResultIcon: {
    fontSize: 50,
    marginBottom: 16,
  },

  emptyResultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c3f2b',
    marginBottom: 8,
  },

  emptyResultsText: {
    fontSize: 14,
    color: '#73877c',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 420,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    paddingVertical: 42,
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#1f6f43',
  },

  loadingSubText: {
    marginTop: 8,
    fontSize: 13.5,
    color: '#6f8478',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },

  resultCard: {
    backgroundColor: '#fbfdfb',
    borderWidth: 1,
    borderColor: '#e6efe8',
    borderRadius: 20,
    padding: 20,
  },

  lowConfidenceBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffe08a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },

  lowConfidenceText: {
    color: '#856404',
    fontSize: 14,
    lineHeight: 20,
  },

  resultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2e7d4f',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },

  resultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#708579',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  resultMain: {
    fontSize: 30,
    fontWeight: '800',
    color: '#174a2f',
    marginBottom: 18,
  },

  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  },

  metricBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e6efe8',
  },

  metricTitle: {
    fontSize: 13,
    color: '#6d8277',
    marginBottom: 6,
    fontWeight: '700',
  },

  metricValue: {
    fontSize: 18,
    color: '#174a2f',
    fontWeight: '800',
  },

  confidenceSection: {
    marginBottom: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6efe8',
    borderRadius: 16,
    padding: 14,
  },

  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  confidenceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#375845',
  },

  confidencePercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f6f43',
  },

  progressTrack: {
    height: 10,
    backgroundColor: '#e8efe9',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#2e7d4f',
    borderRadius: 999,
  },

  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e7efe9',
    marginBottom: 14,
  },

  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f3e2c',
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 14,
    color: '#4f6659',
    lineHeight: 22,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f2',
  },

  infoKey: {
    fontSize: 14,
    color: '#4f6659',
    flex: 1,
    paddingRight: 10,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f6f43',
  },

  historyButton: {
    marginTop: 18,
    backgroundColor: '#f5f9f6',
    borderWidth: 1,
    borderColor: '#cfe3d6',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyButtonText: {
    color: '#1f6f43',
    fontSize: 14,
    fontWeight: '800',
  },
});