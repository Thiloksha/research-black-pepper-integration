import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SignInScreen from '../screens/SignInScreen';
import SoilAnalysisScreen from '../screens/SoilAnalysisScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DiseaseIdentificationScreen from '../screens/DiseaseIdentificationScreen';
import DiseaseUploadScreen from '../screens/DiseaseUploadScreen';
import DiseaseResultScreen from '../screens/DiseaseResultScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2d5016',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ title: '🌶️ Welcome' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🌶️ Black Pepper AI' }}
        />
        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{ title: 'Berry Analysis' }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="SoilAnalysis"
          component={SoilAnalysisScreen}
          options={{ title: 'Live Soil Data' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Regional Dashboard' }}
        />
        <Stack.Screen
          name="DiseaseIdentification"
          component={DiseaseIdentificationScreen}
          options={{ title: 'Leaf Disease Detection' }}
        />
        <Stack.Screen
          name="DiseaseUpload"
          component={DiseaseUploadScreen}
          options={{ title: 'Leaf Image Upload' }}
        />
        <Stack.Screen
          name="DiseaseResult"
          component={DiseaseResultScreen}
          options={{ title: 'Detection Result' }}
        /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}