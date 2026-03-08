import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const shadowCard = Platform.select({
  ios: { shadowColor: '#1a3a2a', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28 },
  android: { elevation: 8 },
  web: { boxShadow: '0px 12px 48px rgba(26,58,42,0.13)' },
});

const shadowBtn = Platform.select({
  ios: { shadowColor: '#2d7a4f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  android: { elevation: 6 },
  web: { boxShadow: '0px 6px 24px rgba(45,122,79,0.32)' },
});

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const { width } = useWindowDimensions();
  const isLarge = width >= 768;
  const isSmall = width < 380;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignIn = () => {
    console.log('Signing in with:', email, password);
    navigation.navigate('Landing');
  };

  const cardWidth = isLarge ? Math.min(460, width * 0.45) : Math.min(width - 40, 420);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <LinearGradient
        colors={['#f0f7f2', '#e2f0e8', '#d4ead9']}
        style={styles.gradient}
      >
        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isLarge && styles.scrollContentLarge,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLarge ? (
            // ── DESKTOP: Side-by-side layout ──
            <View style={styles.desktopWrap}>
              {/* Left panel - branding */}
              <Animated.View
                style={[
                  styles.leftPanel,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }] }]}>
                  <Text style={styles.logoEmoji}>🌿</Text>
                </Animated.View>

                <Text style={styles.brandName}>PepperSense AI</Text>
                <Text style={styles.brandTagline}>
                  Smart crop intelligence{'\n'}for black pepper farmers
                </Text>

                <View style={styles.featureList}>
                  {[
                    { icon: 'leaf', text: 'Variety Identification' },
                    { icon: 'bug', text: 'Disease Detection' },
                    { icon: 'heart-circle', text: 'Health Monitoring' },
                    { icon: 'flask', text: 'Fertilizer Advisor' },
                  ].map((f) => (
                    <View key={f.icon} style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <Ionicons name={f.icon} size={15} color="#2d7a4f" />
                      </View>
                      <Text style={styles.featureText}>{f.text}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.statsBadge}>
                  <Text style={styles.statsBadgeVal}>97%</Text>
                  <Text style={styles.statsBadgeLabel}>Model Accuracy</Text>
                </View>
              </Animated.View>

              {/* Divider */}
              <View style={styles.dividerVertical} />

              {/* Right panel - form */}
              <Animated.View
                style={[
                  styles.formCard,
                  { width: cardWidth, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                  shadowCard,
                ]}
              >
                <SignInForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  emailFocused={emailFocused}
                  setEmailFocused={setEmailFocused}
                  passFocused={passFocused}
                  setPassFocused={setPassFocused}
                  handleSignIn={handleSignIn}
                  isSmall={isSmall}
                />
              </Animated.View>
            </View>
          ) : (
            // ── MOBILE: Stacked layout ──
            <Animated.View
              style={[
                styles.mobileWrap,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Brand header */}
              <View style={styles.mobileBrand}>
                <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }] }]}>
                  <Text style={styles.logoEmoji}>🌿</Text>
                </Animated.View>
                <Text style={styles.brandName}>PepperSense AI</Text>
                <Text style={[styles.brandTagline, { textAlign: 'center', fontSize: 14 }]}>
                  Smart crop intelligence for black pepper farmers
                </Text>
              </View>

              {/* Form card */}
              <View style={[styles.formCard, { width: cardWidth }, shadowCard]}>
                <SignInForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  emailFocused={emailFocused}
                  setEmailFocused={setEmailFocused}
                  passFocused={passFocused}
                  setPassFocused={setPassFocused}
                  handleSignIn={handleSignIn}
                  isSmall={isSmall}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function SignInForm({
  email, setEmail, password, setPassword,
  showPassword, setShowPassword,
  emailFocused, setEmailFocused,
  passFocused, setPassFocused,
  handleSignIn, isSmall,
}) {
  return (
    <View>
      {/* Form header */}
      <View style={styles.formHeader}>
        <Text style={[styles.formTitle, isSmall && { fontSize: 22 }]}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Sign in to your account to continue</Text>
      </View>

      {/* Email field */}
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email address</Text>
        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
          <View style={styles.inputIconWrap}>
            <Ionicons name="mail-outline" size={18} color={emailFocused ? '#2d7a4f' : '#9ab0a2'} />
          </View>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#b0c4b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
      </View>

      {/* Password field */}
      <View style={styles.fieldWrap}>
        <View style={styles.labelRow}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
          <View style={styles.inputIconWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={passFocused ? '#2d7a4f' : '#9ab0a2'} />
          </View>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#b0c4b8"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#9ab0a2"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign In button */}
      <TouchableOpacity
        style={[styles.signInBtn, shadowBtn]}
        onPress={handleSignIn}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#38a169', '#2d7a4f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.signInBtnGradient}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or continue with</Text>
        <View style={styles.orLine} />
      </View>

      {/* Guest button */}
      <TouchableOpacity style={styles.guestBtn} activeOpacity={0.8}>
        <Ionicons name="person-outline" size={17} color="#4a6857" style={{ marginRight: 8 }} />
        <Text style={styles.guestBtnText}>Continue as Guest</Text>
      </TouchableOpacity>

      {/* Sign up link */}
      <View style={styles.signUpRow}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  gradient: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  scrollContentLarge: {
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  // Background blobs
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 300, height: 300, backgroundColor: '#72c18e', opacity: 0.15, top: -80, right: -60 },
  blob2: { width: 200, height: 200, backgroundColor: '#a8d5b5', opacity: 0.18, bottom: 60, left: -50 },
  blob3: { width: 150, height: 150, backgroundColor: '#5db87a', opacity: 0.1, top: '40%', left: '60%' },

  // Desktop layout
  desktopWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    width: '100%',
    maxWidth: 920,
  },
  leftPanel: {
    flex: 1,
    maxWidth: 360,
    alignItems: 'flex-start',
    paddingRight: 48,
    paddingVertical: 20,
  },
  dividerVertical: {
    width: 1,
    height: 480,
    backgroundColor: '#d0e8d8',
    marginRight: 48,
    opacity: 0.7,
  },

  // Mobile layout
  mobileWrap: {
    width: '100%',
    alignItems: 'center',
  },
  mobileBrand: {
    alignItems: 'center',
    marginBottom: 28,
  },

  // Logo
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#d0e8d8',
    ...Platform.select({
      ios: { shadowColor: '#1a3a2a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 6px 20px rgba(26,58,42,0.1)' },
    }),
  },
  logoEmoji: { fontSize: 36 },

  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f2618',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 15,
    color: '#4a6857',
    lineHeight: 23,
    marginBottom: 32,
  },

  // Feature list (desktop only)
  featureList: { gap: 14, marginBottom: 32 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#e8f5ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { fontSize: 14, color: '#2a4a38', fontWeight: '600' },

  statsBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#1a3a2a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 14px rgba(26,58,42,0.07)' },
    }),
  },
  statsBadgeVal: { fontSize: 28, fontWeight: '900', color: '#2d7a4f' },
  statsBadgeLabel: { fontSize: 12, color: '#6b8c78', fontWeight: '600', marginTop: 2 },

  // Form card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: '#e0ede5',
  },

  formHeader: { marginBottom: 28 },
  formTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f2618',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  formSubtitle: { fontSize: 14, color: '#6b8c78', lineHeight: 20 },

  // Fields
  fieldWrap: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2a4a38', marginBottom: 8, letterSpacing: 0.2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  forgotLink: { fontSize: 13, color: '#2d7a4f', fontWeight: '600' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4faf6',
    borderWidth: 1.5,
    borderColor: '#d8ede0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: '#2d7a4f',
    backgroundColor: '#f0faf4',
  },
  inputIconWrap: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a2e22',
    paddingVertical: 0,
  },
  eyeBtn: { padding: 4, marginLeft: 8 },

  // Sign in button
  signInBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  signInBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // OR divider
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: '#ddeee5' },
  orText: { fontSize: 12, color: '#8aab97', fontWeight: '600' },

  // Guest button
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#c8e0d2',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#f8fdf9',
    marginBottom: 24,
  },
  guestBtnText: { fontSize: 15, color: '#3a5e4a', fontWeight: '700' },

  // Sign up
  signUpRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { fontSize: 14, color: '#7a9985' },
  signUpLink: { fontSize: 14, color: '#2d7a4f', fontWeight: '800' },
});