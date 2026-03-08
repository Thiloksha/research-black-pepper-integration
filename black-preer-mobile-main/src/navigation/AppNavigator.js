import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SignInScreen from '../screens/SignInScreen';
import SoilAnalysisScreen from '../screens/SoilAnalysisScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DiseaseIdentificationScreen from '../screens/DiseaseIdentificationScreen';
import DiseaseUploadScreen from '../screens/DiseaseUploadScreen';
import DiseaseResultScreen from '../screens/DiseaseResultScreen';
import VarietyHubScreen from '../screens/VarietyHubScreen';
import VarietyIdentifyScreen from '../screens/VarietyIdentifyScreen';
import VarietyInfoScreen from '../screens/VarietyInfoScreen';
import VarietyHistoryScreen from '../screens/VarietyHistoryScreen';
import DiseaseHistoryScreen from '../screens/DiseaseHistoryScreen';

const Stack = createNativeStackNavigator();

const SCREEN_META = {
  Landing:               { icon: 'home-outline'              },
  SignIn:                { icon: 'person-outline'             },
  Home:                  { icon: 'heart-circle-outline'       },
  Analysis:              { icon: 'stats-chart-outline'        },
  SoilAnalysis:          { icon: 'flask-outline'              },
  Dashboard:             { icon: 'grid-outline'               },
  DiseaseIdentification: { icon: 'bug-outline'                },
  DiseaseUpload:         { icon: 'cloud-upload-outline'       },
  DiseaseResult:         { icon: 'checkmark-circle-outline'   },
  VarietyHub:            { icon: 'leaf-outline'               },
  VarietyIdentify:       { icon: 'scan-outline'               },
  VarietyInfo:           { icon: 'information-circle-outline' },
  VarietyHistory:        { icon: 'time-outline'               },
  DiseaseHistory:        { icon: 'document-text-outline'      },
};

// ── Custom back button ──────────────────────────────────────────
function CustomBackButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.backBtn}
      activeOpacity={0.75}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={20} color="#ffffff" />
    </TouchableOpacity>
  );
}

// ── Custom header title ─────────────────────────────────────────
function CustomHeader({ title, screenName }) {
  const meta = SCREEN_META[screenName] || { icon: 'ellipse-outline' };

  return (
    <LinearGradient
      colors={['#1e5c38', '#2d7a4f', '#3d9960']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientFill}
    >
      {/* Decorative background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.headerWrap}>
        {/* Screen icon badge */}
        <View style={styles.iconOuter}>
          <Ionicons name={meta.icon} size={20} color="#ffffff" />
        </View>

        {/* Title + branding pill */}
        <View style={styles.titleBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.brandPill}>
            <View style={styles.brandDot} />
            <Text style={styles.brandPillText}>PepperSense AI</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// ── Shadow ──────────────────────────────────────────────────────
const headerShadow = Platform.select({
  ios:     { shadowColor: '#0a1f12', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 12 },
  android: { elevation: 8 },
  web:     { boxShadow: '0px 4px 20px rgba(10,31,18,0.22)' },
});

// ── Navigator ───────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={({ navigation, route }) => ({
          headerStyle: {
            backgroundColor: '#2d7a4f',
            height: Platform.OS === 'ios' ? 100 : 72,
            ...headerShadow,
          },

          // ✅ Custom back button — only renders when there's a screen to go back to
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <CustomBackButton onPress={() => navigation.goBack()} />
            ) : null,

          headerTintColor: '#ffffff',
          headerBackTitleVisible: false,
          headerTitleAlign: 'left',

          headerTitle: ({ children }) => (
            <CustomHeader title={children} screenName={route.name} />
          ),

          headerTitleContainerStyle: {
            left: 0,
            right: 0,
            marginLeft: 0,
            paddingLeft: 0,
          },
          headerLeftContainerStyle: {
            paddingLeft: 10,
            zIndex: 10,
          },

          statusBarStyle: 'light',
          statusBarColor: '#1e5c38',
          headerLargeTitle: false,
        })}
      >
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ title: 'Welcome', headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: 'Sign In', headerShown: false }}
        />
        <Stack.Screen name="Home"                  component={HomeScreen}                  options={{ title: 'Health & Post Harvest' }} />
        <Stack.Screen name="Analysis"              component={AnalysisScreen}              options={{ title: 'Berry Analysis' }} />
        <Stack.Screen name="SoilAnalysis"          component={SoilAnalysisScreen}          options={{ title: 'Fertilizer Advisor' }} />
        <Stack.Screen name="Dashboard"             component={DashboardScreen}             options={{ title: 'Regional Dashboard' }} />
        <Stack.Screen name="DiseaseIdentification" component={DiseaseIdentificationScreen} options={{ title: 'Disease Detection' }} />
        <Stack.Screen name="DiseaseUpload"         component={DiseaseUploadScreen}         options={{ title: 'Upload Leaf Image' }} />
        <Stack.Screen name="DiseaseResult"         component={DiseaseResultScreen}         options={{ title: 'Detection Result' }} />
        <Stack.Screen name="VarietyHub"            component={VarietyHubScreen}            options={{ title: 'Variety Module' }} />
        <Stack.Screen name="VarietyIdentify"       component={VarietyIdentifyScreen}       options={{ title: 'Identify Variety' }} />
        <Stack.Screen name="VarietyInfo"           component={VarietyInfoScreen}           options={{ title: 'Variety Info' }} />
        <Stack.Screen name="VarietyHistory"        component={VarietyHistoryScreen}        options={{ title: 'Scan History' }} />
        <Stack.Screen name="DiseaseHistory"        component={DiseaseHistoryScreen}        options={{ title: 'Detection History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Back button — frosted glass pill
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Gradient fills the entire header bar edge to edge
  gradientFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    paddingLeft: 12,
    marginRight: -16,
    paddingRight: 12,
    overflow: 'hidden',
  },

  // Decorative background circles for depth
  bgCircle1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -55,
    right: 10,
  },
  bgCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    right: 90,
  },

  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingVertical: 6,
  },

  // Icon badge — frosted glass style
  iconOuter: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title block
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },

  // Brand pill
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 5,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#a8edbe',
  },
  brandPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.5,
  },
});