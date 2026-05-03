import React from 'react';
import { Platform, useWindowDimensions, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LandingScreen from '../screens/LandingScreen';
import DiseaseIdentificationScreen from '../screens/DiseaseIdentificationScreen';
import VarietyHubScreen from '../screens/VarietyHubScreen';
import SoilHubScreen from '../screens/SoilHubScreen';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 230,
        height: '100%',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: '#dceadf',
        paddingTop: 30,
        paddingHorizontal: 8,
        zIndex: 999,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let iconName = 'home-outline';
          if (route.name === 'HomeTab') iconName = 'home-outline';
          if (route.name === 'DiseaseTab') iconName = 'bug-outline';
          if (route.name === 'VarietyTab') iconName = 'leaf-outline';
          if (route.name === 'SoilTab') iconName = 'flask-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 18,
                paddingVertical: 12,
                marginVertical: 4,
                borderRadius: 12,
                backgroundColor: isFocused ? '#e8f5e9' : 'transparent',
              }}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? '#1f6f43' : '#7a9084'}
              />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  fontWeight: '700',
                  color: isFocused ? '#1f6f43' : '#7a9084',
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function MainTabNavigator() {
  const { width } = useWindowDimensions();
  const isWebSidebar = Platform.OS === 'web' && width >= 768;

  return (
    <Tab.Navigator
      tabBar={isWebSidebar ? CustomTabBar : undefined}
      sceneContainerStyle={isWebSidebar ? { marginLeft: 230 } : {}}
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#1f6f43',
        tabBarInactiveTintColor: '#7a9084',
        tabBarLabelPosition: 'below-icon',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },

        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 64,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: '#dceadf',
        },

        tabBarIcon: ({ color, size }) => {
          let icon = 'home-outline';

          if (route.name === 'HomeTab') icon = 'home-outline';
          if (route.name === 'DiseaseTab') icon = 'bug-outline';
          if (route.name === 'VarietyTab') icon = 'leaf-outline';
          if (route.name === 'SoilTab') icon = 'flask-outline';

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={LandingScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="DiseaseTab" component={DiseaseIdentificationScreen} options={{ title: 'Disease' }} />
      <Tab.Screen name="VarietyTab" component={VarietyHubScreen} options={{ title: 'Variety' }} />
      <Tab.Screen name="SoilTab" component={SoilHubScreen} options={{ title: 'Soil' }} />
    </Tab.Navigator>
  );
}