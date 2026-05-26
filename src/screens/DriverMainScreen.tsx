import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import DriverHomeScreen from './DriverHomeScreen';
import RideNavigationScreen from './RideNavigationScreen';

interface DriverMainScreenProps {
  driverId: string;
  driverName?: string;
}

export default function DriverMainScreen({
  driverId,
  driverName = 'Chauffeur',
}: DriverMainScreenProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'navigation'>('home');

  return (
    <SafeAreaView style={styles.container}>
      {/* Contenu principal */}
      <View style={styles.content}>
        {activeTab === 'home' ? (
          <DriverHomeScreen driverId={driverId} driverName={driverName} />
        ) : (
          <RideNavigationScreen driverId={driverId} />
        )}
      </View>

      {/* Navigation inférieure */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' && styles.navLabelActive,
            ]}
          >
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'navigation' && styles.navButtonActive]}
          onPress={() => setActiveTab('navigation')}
        >
          <Text style={styles.navIcon}>🗺️</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'navigation' && styles.navLabelActive,
            ]}
          >
            Navigation
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#FFC107',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
  },
  navLabelActive: {
    color: '#FFC107',
    fontWeight: '600',
  },
});
