import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyHubScreen({ navigation }) {
  const menuItems = [
    {
      title: 'Identify Leaf',
      subtitle: 'Scan a black pepper leaf and predict its variety',
      icon: 'camera-outline',
      onPress: () => navigation.navigate('VarietyIdentify'),
    },
    {
      title: 'Variety Info',
      subtitle: 'Explore information about black pepper varieties',
      icon: 'book-outline',
      onPress: () => navigation.navigate('VarietyInfo'),
    },
    {
      title: 'Scan History',
      subtitle: 'Review previous scan results and predictions',
      icon: 'time-outline',
      onPress: () => navigation.navigate('VarietyHistory'),
    },
  ];

  return (
    <LinearGradient
      colors={['#edf7f0', '#dcefe2', '#cfe6d7']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#edf7f0" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.iconWrapper}>
              <Ionicons name="leaf-outline" size={34} color="#1f6f43" />
            </View>

            <Text style={styles.title}>Black Pepper Variety Module</Text>
            <Text style={styles.subtitle}>
              Identify leaf varieties, explore variety details, and keep track
              of previous scan records in one place.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Choose an Option</Text>
            <Text style={styles.sectionSubtitle}>
              Select a feature to continue
            </Text>

            <View style={styles.menuList}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuButton}
                  activeOpacity={0.88}
                  onPress={item.onPress}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={24} color="#1f6f43" />
                    </View>

                    <View style={styles.menuTextWrap}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#7a8f80"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footerNote}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#5f7c69"
            />
            <Text style={styles.footerText}>
              Designed to support quick and easy black pepper variety analysis.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#123222',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#163a28',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5f7667',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#123222',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#173926',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: '#72877a',
    marginBottom: 18,
  },
  menuList: {
    gap: 14,
  },
  menuButton: {
    backgroundColor: '#f7fbf8',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e3eee7',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#eaf6ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  menuTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#183d2a',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#6d8375',
  },
  footerNote: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  footerText: {
    marginLeft: 6,
    fontSize: 12.5,
    color: '#5f7c69',
    textAlign: 'center',
  },
});