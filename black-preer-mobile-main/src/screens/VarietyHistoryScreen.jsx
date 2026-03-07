import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyHistoryScreen() {
  const [history, setHistory] = useState([]);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;
  const [selectedItem, setSelectedItem] = useState(null);

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

  const deleteItem = async (id) => {
    Alert.alert(
      "Delete Record",
      "Do you want to remove this scan from history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = history.filter((item) => item.id !== id);
            setHistory(updated);
            await AsyncStorage.setItem("scanHistory", JSON.stringify(updated));
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
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#dbeadf', '#c7ddce', '#b4cfbc']}
          style={styles.gradient}
        >
          <View style={styles.page}>
            <View style={styles.heroSection}>
              <View style={styles.heroBadge}>
                <Ionicons name="time-outline" size={16} color="#1f6f43" />
                <Text style={styles.heroBadgeText}>Prediction Records</Text>
              </View>

              <View style={styles.heroIconCircle}>
                <Ionicons name="document-text-outline" size={32} color="#1c5636" />
              </View>

              <Text style={styles.title}>Scan History</Text>
              <Text style={styles.subtitle}>
                Review previously identified black pepper leaf scans, including
                prediction confidence, stage details, and scan timestamps.
              </Text>
            </View>

            <View style={styles.contentWrapper}>
              <View style={styles.topCard}>
                <View style={styles.topCardLeft}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                      <Ionicons name="albums-outline" size={18} color="#1f6f43" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Stored Scan Records</Text>
                      <Text style={styles.sectionSubtitle}>
                        Total scans: {history.length}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearHistory}
                  activeOpacity={0.88}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#fff"
                    style={styles.clearButtonIcon}
                  />
                  <Text style={styles.clearButtonText}>Clear History</Text>
                </TouchableOpacity>
              </View>

              {history.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="folder-open-outline" size={42} color="#6f8578" />
                  </View>
                  <Text style={styles.emptyTitle}>No scan history yet</Text>
                  <Text style={styles.emptyText}>
                    Your previous leaf identification results will appear here
                    after you complete a scan.
                  </Text>
                </View>
              ) : (
                <View style={[styles.historyGrid, isLargeScreen && styles.historyGridLarge]}>
                  {history.map((item, index) => (
                    <View key={item.id || `${item.timestamp}-${index}`} style={styles.historyCard}>
                      <View style={styles.historyImageWrap}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.historyImage} />
                        ) : (
                          <View style={styles.historyImageFallback}>
                            <Ionicons name="image-outline" size={28} color="#7b9485" />
                          </View>
                        )}
                      </View>

                      <View style={styles.historyInfo}>
                        <View style={styles.historyHeaderRow}>
                          <View style={styles.resultBadge}>
                            <Ionicons name="leaf-outline" size={14} color="#fff" />
                            <Text style={styles.resultBadgeText}>Prediction</Text>
                          </View>
                        </View>

                        <Text style={styles.historyResult}>
                          {item.result || 'Unknown Variety'}
                        </Text>

                        <View style={styles.metricsRow}>
                          <View style={styles.metricChip}>
                            <Text style={styles.metricChipLabel}>Confidence</Text>
                            <Text style={styles.metricChipValue}>
                              {item.confidence ?? '--'}%
                            </Text>
                          </View>

                          <View style={styles.metricChip}>
                            <Text style={styles.metricChipLabel}>Stage</Text>
                            <Text style={styles.metricChipValue}>
                              {item.stage || '--'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.timestampRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#6f8578"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.historyDate}>
                            {item.timestamp || 'No timestamp'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteItem(item.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#b3261e" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
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
  topCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  topCardLeft: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clearButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#be1a11',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  clearButtonIcon: {
    marginRight: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 54,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eaf3ed',
    ...shadowStyle,
  },
  emptyIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: '#eef7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c3f2b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14.5,
    color: '#73877c',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 420,
  },
  historyGrid: {
    gap: 14,
  },
  historyGridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8f1ea',
    ...shadowStyle,
  },
  historyCardLarge: {
    width: '49%',
    marginBottom: 14,
  },
  historyImageWrap: {
    marginBottom: 14,
  },
  historyImage: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: '#edf3ee',
  },
  historyImageFallback: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    backgroundColor: '#f4f8f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2ece5',
  },
  historyInfo: {
    flex: 1,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d4f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  historyResult: {
    fontSize: 22,
    fontWeight: '800',
    color: '#173725',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricChip: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f8fbf9',
    borderWidth: 1,
    borderColor: '#e5efe8',
    borderRadius: 14,
    padding: 12,
  },
  metricChipLabel: {
    fontSize: 12,
    color: '#6f8578',
    marginBottom: 4,
    fontWeight: '700',
  },
  metricChipValue: {
    fontSize: 15,
    color: '#1f6f43',
    fontWeight: '800',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12.5,
    color: '#708579',
    lineHeight: 18,
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 5,
    right: 12,
    backgroundColor: '#fdecea',
    borderRadius: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: '#f5c2c0',
  },
});