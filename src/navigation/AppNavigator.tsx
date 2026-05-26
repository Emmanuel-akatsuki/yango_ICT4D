import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importation de tous les écrans de votre équipe
import ClientHomeScreen from '../screens/ClientHomeScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';
import DriverMainScreen from '../screens/DriverMainScreen';
import RideNavigationScreen from '../screens/RideNavigationScreen';
import RideCompletionScreen from '../screens/RideCompletionScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="ClientHome" // L'application démarre sur la vue Client
      screenOptions={{ headerShown: false }} // Cache la barre de navigation du haut style Yango
    >
      {/* 👤 Écrans du flux Client */}
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} />

      {/* 🚖 Écrans du flux Chauffeur */}
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
      <Stack.Screen name="DriverMain" component={DriverMainScreen} />
      <Stack.Screen name="RideNavigation" component={RideNavigationScreen} />
      <Stack.Screen name="RideCompletion" component={RideCompletionScreen} />
    </Stack.Navigator>
  );
}
