import React, { useEffect, useState } from 'react'; 
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import { onAuthChange } from './src/services/authService';

const TEST_DRIVER_ID = "driver_test_123";

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthChange((user: any) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  return (
    <SafeAreaProvider style={styles.globalContainer}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* 💡 La View avec flex:1 est obligatoire pour forcer l'affichage de la navigation */}
      <View style={styles.navigationWrapper}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1, // Force le provider à prendre tout l'écran
  },
  navigationWrapper: {
    flex: 1, // Force la navigation à s'étirer et à devenir visible
    backgroundColor: '#FFF', 
  },
});

export default App;
