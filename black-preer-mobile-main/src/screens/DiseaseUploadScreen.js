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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5001'
    : 'http://192.168.8.110:5001';

export default function DiseaseUploadScreen({ navigation }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const pickFromCamera = async () => {
    try {
      setWarningMessage('');

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedAsset(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const pickFromGallery = async () => {
    try {
      setWarningMessage('');

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is needed to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedAsset(result.assets[0]);
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

      console.log('Uploading asset:', selectedAsset);

      const response = await axios.post(
        `${API_BASE_URL}/api/predict-image`,
        formData,
        {
          timeout: 60000,
        }
      );

      console.log(
        'FULL BACKEND RESPONSE:',
        JSON.stringify(response.data, null, 2)
      );

      const data = response.data;

      if (!data?.ai_analysis) {
        throw new Error('Invalid response from server.');
      }

      const result = data.ai_analysis;

      // Only show warning box for truly rejected images
      if (result.rejected) {
        setWarningMessage(
          result.reject_reason ||
            'The uploaded image is not recognized as a black pepper leaf. Please upload a clear black pepper leaf image.'
        );
        return;
      }

      // Navigate for both normal and low-confidence accepted results
      navigation.navigate('DiseaseResult', {
        image: selectedAsset.uri,
        disease: result.prediction || 'Unknown',
        confidence: `${result.confidence ?? 0}%`,
        treatment: result.advice || 'Consult an agricultural expert.',
        description: result.description || '',
        probabilities: result.all_probabilities || {},
        pepperScore: result.pepper_score || null,
        lowConfidence: result.low_confidence || false,
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a3409', '#2d5016', '#1a3409']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Upload Black Pepper Leaf{'\n'}for Disease Detection
          </Text>
          <Text style={styles.heroSubtitle}>
            Capture or upload a clear image of a black pepper leaf to identify
            possible diseases using AI-powered analysis.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Leaf Image Upload</Text>
        <Text style={styles.sectionSubtitle}>
          Use a clear and well-lit image for better prediction accuracy
        </Text>

        {warningMessage ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠ Warning</Text>
            <Text style={styles.warningText}>{warningMessage}</Text>
          </View>
        ) : null}

        <View style={styles.uploadCard}>
          {selectedAsset?.uri ? (
            <Image source={{ uri: selectedAsset.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Text style={styles.uploadIcon}>🍃</Text>
              <Text style={styles.uploadTitle}>No Image Selected</Text>
              <Text style={styles.uploadText}>
                Upload or capture a black pepper leaf image
              </Text>
            </>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={pickFromCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📷 Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={pickFromGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>🖼 Open Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleDetectDisease}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>🦠 Detect Disease</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tips for Better Results</Text>
          <Text style={styles.infoText}>• Use a clear image with good lighting</Text>
          <Text style={styles.infoText}>• Capture the full leaf in the frame</Text>
          <Text style={styles.infoText}>• Avoid blurry or dark images</Text>
          <Text style={styles.infoText}>• Keep the background simple if possible</Text>
          <Text style={styles.infoText}>• Upload only black pepper leaf images</Text>
        </View>
      </View>
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
    lineHeight: 24,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
  contentSection: {
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
    marginBottom: 25,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffe08a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
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
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#dceccf',
    borderStyle: 'dashed',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  buttonRow: {
    gap: 15,
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8bc34a',
  },
  secondaryButtonText: {
    color: '#2d5016',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#8bc34a',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
});