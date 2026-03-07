import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function AnalysisScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    moisture_content: '',
    temperature: '',
    humidity: '',
    berry_size: '4.5',
    drying_method: 'Sun',
    batch_id: '',
    target_moisture: '11.5',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant photo library permissions to select images',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to open image gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant camera permissions to take photos',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'Failed to open camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      // Add image
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formDataToSend.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      // Add other fields
      formDataToSend.append('moisture_content', formData.moisture_content || '35.0');
      formDataToSend.append('temperature', formData.temperature || '32.0');
      formDataToSend.append('humidity', formData.humidity || '60.0');
      formDataToSend.append('berry_size', formData.berry_size);
      formDataToSend.append('drying_method', formData.drying_method);
      formDataToSend.append('batch_id', formData.batch_id || `BATCH_${Date.now()}`);
      formDataToSend.append('target_moisture', formData.target_moisture);

      // Note: Update this URL when backend is ready
      const response = await axios.post('http://localhost:5001/api/analyze', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze berry. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setFormData({
      moisture_content: '',
      temperature: '',
      humidity: '',
      berry_size: '4.5',
      drying_method: 'Sun',
      batch_id: '',
      target_moisture: '11.5',
    });
    setResults(null);
    setError(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#e8f5e9', '#c8e6c9']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>🌶️ Black Pepper Berry Analysis</Text>
          <Text style={styles.subtitle}>
            Upload berry image and provide environmental details for comprehensive analysis
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>📸 Input Information</Text>

            {/* Image Upload */}
            <View style={styles.imageUploadContainer}>
              <Text style={styles.label}>Berry Image *</Text>
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  <Text style={styles.imageButtonText}>📷 Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={takePhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.imageButtonText}>📸 Take Photo</Text>
                </TouchableOpacity>
              </View>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Batch ID (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.batch_id}
                onChangeText={(value) => handleInputChange('batch_id', value)}
                placeholder="e.g., BATCH_001"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Moisture Content (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.moisture_content}
                onChangeText={(value) => handleInputChange('moisture_content', value)}
                placeholder="e.g., 35.0"
                keyboardType="decimal-pad"
              />
              <Text style={styles.helperText}>
                Optional - improves curing prediction accuracy
              </Text>
            </View>

            <Text style={styles.sectionSubtitle}>🌡️ Environmental Conditions</Text>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Temperature (°C)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.temperature}
                  onChangeText={(value) => handleInputChange('temperature', value)}
                  placeholder="32.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Humidity (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.humidity}
                  onChangeText={(value) => handleInputChange('humidity', value)}
                  placeholder="60.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Berry Size (mm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.berry_size}
                  onChangeText={(value) => handleInputChange('berry_size', value)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Drying Method</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      const methods = ['Sun', 'Solar', 'Mechanical'];
                      const currentIndex = methods.indexOf(formData.drying_method);
                      const nextIndex = (currentIndex + 1) % methods.length;
                      handleInputChange('drying_method', methods[nextIndex]);
                    }}
                  >
                    <Text style={styles.pickerText}>{formData.drying_method}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Moisture (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.target_moisture}
                onChangeText={(value) => handleInputChange('target_moisture', value)}
                keyboardType="decimal-pad"
              />
              <Text style={styles.helperText}>Standard export: 11-12%</Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>🔍 Analyze Berry</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>📊 Analysis Results</Text>

            {!results && !loading && (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsEmoji}>📈</Text>
                <Text style={styles.emptyResultsText}>
                  Upload an image and click "Analyze Berry" to see results
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2d5016" />
                <Text style={styles.loadingText}>Processing your berry image...</Text>
              </View>
            )}

            {results && (
              <View>
                {/* Quality Grading */}
                <View style={[styles.resultCard, styles.qualityCard]}>
                  <Text style={styles.resultCardTitle}>⭐ Quality Grading</Text>
                  <Text style={styles.gradeText}>Grade {results.quality?.grade}</Text>
                  <Text style={styles.resultDescription}>
                    {results.quality?.description}
                  </Text>
                  <View style={styles.badgeContainer}>
                    <View style={[
                      styles.badge,
                      results.quality?.export_ready ? styles.badgeSuccess : styles.badgeWarning
                    ]}>
                      <Text style={styles.badgeText}>
                        {results.quality?.export_ready ? '✓ Export Ready' : '⚠ Not Export Ready'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Defect Detection */}
                <View style={[styles.resultCard, styles.defectCard]}>
                  <Text style={styles.resultCardTitle}>🔍 Defect Detection</Text>
                  <Text style={styles.defectStatus}>
                    {results.defects?.is_defect_free ? '✓ No Defects' : `${results.defects?.count} Defect(s)`}
                  </Text>
                  {results.defects?.detected?.length > 0 && (
                    <View style={styles.defectTags}>
                      {results.defects.detected.map((defect, idx) => (
                        <View key={idx} style={styles.defectTag}>
                          <Text style={styles.defectTagText}>{defect}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Curing Time Prediction */}
                <View style={[styles.resultCard, styles.curingCard]}>
                  <Text style={styles.resultCardTitle}>⏱️ Curing Time Prediction</Text>
                  <Text style={styles.curingTime}>
                    {results.curing?.time_days?.toFixed(1)} Days
                  </Text>
                  <Text style={styles.resultDescription}>
                    Completion Date: {results.curing?.completion_date}
                  </Text>
                </View>

                {/* Overall Assessment */}
                <View style={[styles.resultCard, styles.overallCard]}>
                  <Text style={styles.resultCardTitle}>📋 Overall Assessment</Text>
                  <View style={[
                    styles.assessmentBadge,
                    results.overall?.export_ready ? styles.badgeSuccess : styles.badgeInfo
                  ]}>
                    <Text style={styles.assessmentText}>
                      {results.overall?.export_ready ? '✓ Ready for Export' : '⚠ Not Ready for Export'}
                    </Text>
                  </View>
                  {results.overall?.recommendations && (
                    <View style={styles.recommendationsContainer}>
                      <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                      {results.overall.recommendations.map((rec, idx) => (
                        <Text key={idx} style={styles.recommendationItem}>• {rec}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
    marginTop: 20,
    marginBottom: 15,
  },
  imageUploadContainer: {
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
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  pickerButton: {
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2d5016',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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
  resultsSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    minHeight: 400,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 15,
  },
  qualityCard: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  defectCard: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  curingCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  overallCard: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 10,
  },
  gradeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  badgeContainer: {
    marginTop: 10,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: '#4caf50',
  },
  badgeWarning: {
    backgroundColor: '#ff9800',
  },
  badgeInfo: {
    backgroundColor: '#2196f3',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  defectStatus: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  defectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  defectTag: {
    backgroundColor: '#f44336',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  defectTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  curingTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2196f3',
    marginBottom: 5,
  },
  assessmentBadge: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  assessmentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

