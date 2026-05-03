import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator } from 'react-native';
import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

const PersistLoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <ActivityIndicator size="large" color="#2d7a4f" />
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoadingScreen />} persistor={persistor}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}
