import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const MODULES = [
  {
    key: 'variety',
    icon: 'leaf',
    label: 'Identify Pepper Variety',
    description: 'Classify black pepper cultivars from leaf imagery with high accuracy',
    accent: '#2d7a4f',
    lightAccent: '#e8f5ee',
    borderAccent: '#b8dfc9',
    navigate: 'VarietyHub',
  },
  {
    key: 'disease',
    icon: 'bug',
    label: 'Identify Leaf Diseases',
    description: 'Detect fungal, bacterial & viral infections before they spread',
    accent: '#b05c1a',
    lightAccent: '#fdf0e6',
    borderAccent: '#f0ceaa',
    navigate: 'DiseaseIdentification',
  },
  {
    key: 'health',
    icon: 'heart-circle',
    label: 'Health & Post Harvest',
    description: 'Monitor crop vitality and optimize post-harvest handling',
    accent: '#1a6b8a',
    lightAccent: '#e5f4fa',
    borderAccent: '#a8d8ea',
    navigate: 'Home',
  },
  {
    key: 'fertilizer',
    icon: 'flask',
    label: 'Recommend Fertilizer',
    description: 'AI-powered soil analysis for precision nutrient recommendations',
    accent: '#6b4fa0',
    lightAccent: '#f0eaf8',
    borderAccent: '#c9b8e8',
    navigate: 'SoilAnalysis',
  },
];

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#1a3a2a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
  web: { boxShadow: '0px 8px 32px rgba(26, 58, 42, 0.10)' },
});

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#1a3a2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 4 },
  web: { boxShadow: '0px 4px 20px rgba(26, 58, 42, 0.08)' },
});

function ModuleCard({ module, onPress, cardWidth, animValue, isWide }) {
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={[
        { opacity: animValue, transform: [{ translateY }] },
        isWide ? { width: cardWidth } : { width: '100%', marginBottom: 14 },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { borderColor: module.borderAccent, backgroundColor: '#ffffff' },
          isWide && { marginBottom: 16 },
          cardShadow,
        ]}
        onPress={() => onPress(module.navigate)}
        activeOpacity={0.88}
      >
        {/* Left accent strip */}
        <View style={[styles.accentStrip, { backgroundColor: module.accent }]} />

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: module.lightAccent }]}>
          <Ionicons name={module.icon} size={26} color={module.accent} />
        </View>

        {/* Text */}
        <View style={styles.cardTextWrap}>
          <Text style={[styles.cardLabel, { color: '#1a2e22' }]}>{module.label}</Text>
          <Text style={styles.cardDescription}>{module.description}</Text>
        </View>

        {/* Arrow */}
        <View style={[styles.arrowCircle, { backgroundColor: module.lightAccent }]}>
          <Ionicons name="chevron-forward" size={16} color={module.accent} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LandingScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isSmall = width < 480;
  const isLarge = width >= 900;

  const numCols = isLarge ? 2 : 1;
  const pagePadding = isSmall ? 20 : isLarge ? 60 : 32;
  const maxContent = 900;
  const availableWidth = Math.min(width - pagePadding * 2, maxContent);
  const cardGap = 16;
  const cardWidth = numCols === 2
    ? (availableWidth - cardGap) / 2
    : availableWidth;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(MODULES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.parallel(
      cardAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 300 + i * 110,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const headerTranslate = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f7f2" />
      <LinearGradient
        colors={['#f0f7f2', '#e6f2ea', '#ddeee3']}
        style={styles.fullGradient}
      >
        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: pagePadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ── */}
          <Animated.View
            style={[
              styles.header,
              { opacity: headerAnim, transform: [{ translateY: headerTranslate }] },
              isLarge && styles.headerLarge,
            ]}
          >
            {/* Logo pill */}
            <View style={[styles.logoPill, shadowStyle]}>
              <View style={styles.logoIconWrap}>
                <Text style={styles.logoEmoji}>🌿</Text>
              </View>
              <Text style={styles.logoPillText}>PepperSense AI</Text>
            </View>

            <Text style={[
              styles.heroTitle,
              isSmall && { fontSize: 28, lineHeight: 36 },
              isLarge && { fontSize: 42, lineHeight: 52, textAlign: 'left' },
            ]}>
              Smart Analysis for{'\n'}
              <Text style={styles.heroTitleAccent}>Black Pepper</Text>
            </Text>

            <Text style={[
              styles.heroSubtitle,
              isLarge && { fontSize: 17, maxWidth: 560, textAlign: 'left' },
            ]}>
              Leverage AI to identify varieties, detect diseases, assess crop
              health and get precision fertilizer recommendations — all from your device.
            </Text>

            {/* Stats row */}
            <View style={[styles.statsRow, isLarge && { alignSelf: 'flex-start', gap: 32 }]}>
              {[
                { val: '97%', label: 'Accuracy' },
                { val: '4', label: 'AI Modules' },
                { val: '< 3s', label: 'Analysis' },
              ].map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.val}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* ── SECTION LABEL ── */}
          <Animated.View style={[{ opacity: cardAnims[0] }, styles.sectionLabelWrap]}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>Choose a Module</Text>
            </View>
          </Animated.View>

          {/* ── MODULE CARDS ── */}
          {numCols === 2 ? (
            <View style={styles.gridWrap}>
              <View style={[styles.gridRow, { gap: cardGap }]}>
                {MODULES.slice(0, 2).map((mod, i) => (
                  <ModuleCard
                    key={mod.key}
                    module={mod}
                    onPress={handleNavigate}
                    cardWidth={cardWidth}
                    animValue={cardAnims[i]}
                    isWide
                  />
                ))}
              </View>
              <View style={[styles.gridRow, { gap: cardGap }]}>
                {MODULES.slice(2, 4).map((mod, i) => (
                  <ModuleCard
                    key={mod.key}
                    module={mod}
                    onPress={handleNavigate}
                    cardWidth={cardWidth}
                    animValue={cardAnims[i + 2]}
                    isWide
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={[styles.listWrap, { width: availableWidth }]}>
              {MODULES.map((mod, i) => (
                <ModuleCard
                  key={mod.key}
                  module={mod}
                  onPress={handleNavigate}
                  cardWidth={cardWidth}
                  animValue={cardAnims[i]}
                  isWide={false}
                />
              ))}
            </View>
          )}

          {/* ── FOOTER ── */}
          <Animated.View style={[styles.footer, { opacity: headerAnim }]}>
            <Text style={styles.footerText}>
              🌶️ Powered by deep learning · Built for pepper farmers
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7f2',
  },
  fullGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },

  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  blob1: {
    width: 320,
    height: 320,
    backgroundColor: '#5db87a',
    top: -80,
    right: -80,
  },
  blob2: {
    width: 240,
    height: 240,
    backgroundColor: '#a8d5b5',
    bottom: 100,
    left: -60,
  },

  header: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    marginBottom: 36,
  },
  headerLarge: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },

  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#d0e8d8',
  },
  logoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e8f5ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2d6b45',
    letterSpacing: 0.3,
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f2618',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    color: '#2d7a4f',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#4a6857',
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 480,
    marginBottom: 28,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#d8edde',
    ...Platform.select({
      ios: { shadowColor: '#1a3a2a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 16px rgba(26,58,42,0.07)' },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2d7a4f',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b8c78',
    fontWeight: '600',
    marginTop: 2,
  },

  sectionLabelWrap: {
    width: '100%',
    maxWidth: 900,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d7a4f',
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d7a4f',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  gridWrap: {
    width: '100%',
    maxWidth: 900,
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  listWrap: {
    maxWidth: 900,
  },

  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingVertical: 18,
    paddingRight: 16,
    paddingLeft: 0,
  },
  accentStrip: {
    width: 5,
    alignSelf: 'stretch',
    marginRight: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#6b8270',
    lineHeight: 18,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  footer: {
    marginTop: 36,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#7a9985',
    textAlign: 'center',
    fontWeight: '500',
  },
});