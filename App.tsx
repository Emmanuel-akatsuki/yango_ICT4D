/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { onAuthChange } from './src/services/authService';
import { seedPointsSecours } from './src/services/geoService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Test 1 — Auth
    const unsub = onAuthChange((user: any) => {
      if (user) {
        console.log('✅ Auth OK — Connecté :', user.email);
      } else {
        console.log('⚠️ Auth OK — Pas encore connecté');
      }
    });

    // Test 2 — Seed points de secours (décommente une seule fois)
    // seedPointsSecours().then(() => console.log('✅ Points de secours ajoutés'));

    return () => unsub();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;