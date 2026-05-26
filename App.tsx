import React, { useEffect, useState } from 'react'; // 💡 Correction : Ajout de useState ici
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

// Importation de vos services d'infrastructure (D1)
import { onAuthChange } from './src/services/authService';
import { seedPointsSecours } from './src/services/geoService';

// Importation de votre écran de cartographie (D2)
import ClientHomeScreen from './src/screens/ClientHomeScreen';

// Variable de secours requise par le code de D1 pour éviter le crash
const TEST_DRIVER_ID = "driver_test_123";

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentUser, setCurrentUser] = useState<any>(null); // Ligne 19 corrigée

  useEffect(() => {
    // Test 1 — Auth (D1)
    const unsub = onAuthChange((user: any) => {
      setCurrentUser(user);
      if (user) {
        console.log('✅ Auth OK — Connecté :', user.email);
      } else {
        console.log('⚠️ Auth OK — Pas encore connecté');
      }
    });

    // Test 2 — Seed points de secours (D1)
    // seedPointsSecours().then(() => console.log('✅ Points de secours ajoutés'));

    return () => unsub();
  }, []);

  // Logique de secours pour le développement (D1)
  const driverId = currentUser?.uid || TEST_DRIVER_ID;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* 🌐 Conteneur obligatoire pour faire fonctionner les routes */}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );

}

export default App;
