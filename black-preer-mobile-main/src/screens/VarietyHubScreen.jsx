import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VarietyHubScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#e8f5e9', '#c8e6c9']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>🍃 Black Pepper Variety Module</Text>
        <Text style={styles.subtitle}>
          Choose an option to identify leaf variety, view variety information, or see scan history.
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('VarietyIdentify')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.primaryButtonText}>Identify Leaf</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('VarietyInfo')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>📘</Text>
            <Text style={styles.primaryButtonText}>Variety Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('VarietyHistory')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>🕘</Text>
            <Text style={styles.primaryButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, paddingBottom: 40 },
  content: { paddingHorizontal: 20, flex: 1, justifyContent: 'center' },
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
  primaryButton: {
    backgroundColor: '#2d5016',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});