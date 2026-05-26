/**
 * Yango ICT4D - Driver App
 * Application pour chauffeurs avec suivi en temps réel
 * et gestion des courses
 * 
 * @format
 */

import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { onAuthChange } from './src/services/authService';
import DriverMainScreen from './src/screens/DriverMainScreen';

// TODO: Remplacer par l'authentification réelle
const TEST_DRIVER_ID = 'driver_test_001';
const TEST_DRIVER_NAME = 'Jean Dupont';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Écouter l'état de l'authentification
    const unsub = onAuthChange((user: any) => {
      setCurrentUser(user);
      if (user) {
        console.log('✅ Auth OK — Connecté :', user.email);
      } else {
        console.log('⚠️ Auth OK — Pas encore connecté');
      }
    });

    return () => unsub();
  }, []);

  // Pour le développement, utiliser le TEST_DRIVER_ID
  const driverId = currentUser?.uid || TEST_DRIVER_ID;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <DriverMainScreen driverId={driverId} driverName={TEST_DRIVER_NAME} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;