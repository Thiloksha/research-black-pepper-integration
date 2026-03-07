import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function VarietyHistoryScreen() {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('scanHistory');
      const parsed = stored ? JSON.parse(stored) : [];
      setHistory(parsed);
    } catch (e) {
      console.log('Error loading history:', e);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('scanHistory');
            setHistory([]);
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>🕘 Scan History</Text>
          <Text style={styles.subtitle}>
            View previously identified black pepper leaf scans
          </Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>

            {history.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>📂</Text>
                <Text style={styles.emptyText}>No scan history yet.</Text>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.historyImage} />
                  )}
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyResult}>{item.result}</Text>
                    <Text style={styles.historyText}>Confidence: {item.confidence}%</Text>
                    <Text style={styles.historyText}>Stage: {item.stage}</Text>
                    <Text style={styles.historyDate}>{item.timestamp}</Text>
                  </View>
                </View>
              ))
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: '#c62828',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  historyResult: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 4,
  },
  historyText: {
    fontSize: 14,
    color: '#555',
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
});