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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { predictImage } from '../api/predict';

export default function VarietyIdentifyScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access.');
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!response.canceled && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!response.canceled && response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        setResult(null);
        setError(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const saveToHistory = async (predictionData, uri) => {
    try {
      const existing = await AsyncStorage.getItem('scanHistory');
      const history = existing ? JSON.parse(existing) : [];

      const newItem = {
        id: Date.now().toString(),
        image: uri,
        result: predictionData.result,
        confidence: predictionData.confidence,
        stage: predictionData.stage,
        timestamp: new Date().toLocaleString(),
      };

      history.unshift(newItem);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(history));
    } catch (e) {
      console.log('History save error:', e);
    }
  };

  const handlePredict = async () => {
    if (!imageUri) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictImage(imageUri);
      setResult(data);
      await saveToHistory(data, imageUri);
    } catch (e) {
      console.log('Prediction error:', e);
      setError('Prediction failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>🍃 Black Pepper Leaf Identification</Text>
          <Text style={styles.subtitle}>
            Upload a leaf image to identify the black pepper variety
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>📸 Leaf Image</Text>

            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Identify Variety</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>📊 Prediction Result</Text>

            {!result && !loading && (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsEmoji}>🌿</Text>
                <Text style={styles.emptyResultsText}>
                  Select an image and tap "Identify Variety"
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2d5016" />
                <Text style={styles.loadingText}>Processing image...</Text>
              </View>
            )}

            {result && (
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Prediction</Text>
                <Text style={styles.resultMain}>{result.result}</Text>
                <Text style={styles.resultText}>Confidence: {result.confidence}%</Text>
                <Text style={styles.resultText}>Stage: {result.stage}</Text>

                {result.variety_probs && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.resultCardTitle}>Variety Probabilities</Text>
                    {Object.entries(result.variety_probs).map(([key, value]) => (
                      <Text key={key} style={styles.resultText}>
                        {key}: {value}%
                      </Text>
                    ))}
                  </View>
                )}

                {result.stageA_probs && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.resultCardTitle}>Stage A Probabilities</Text>
                    {Object.entries(result.stageA_probs).map(([key, value]) => (
                      <Text key={key} style={styles.resultText}>
                        {key}: {value}%
                      </Text>
                    ))}
                  </View>
                )}

                <Text style={styles.resultDescription}>{result.message}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingTop: 20, paddingBottom: 40 },
  content: { paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  resultsSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    minHeight: 300,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#2d5016',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#2d5016',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  emptyResults: {
    alignItems: 'center',
    padding: 40,
  },
  emptyResultsEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2d5016',
  },
  resultCard: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 10,
  },
  resultMain: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    lineHeight: 20,
  },
});