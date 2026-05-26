import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as geolocation from '@react-native-community/geolocation';
import {
  subscribeToCurrentRide,
  RideRequest,
  RideStatus,
  markAsArrived,
  startRide,
  completeRide,
} from '../services/rideService';

const WINDOW_WIDTH = Dimensions.get('window').width;

interface RideNavigationScreenProps {
  driverId: string;
}

interface RideStep {
  type: 'pickup' | 'dropoff';
  name: string;
  address: string;
  position: { lat: number; lng: number };
  completed: boolean;
}

export default function RideNavigationScreen({ driverId }: RideNavigationScreenProps) {
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const mapRef = useRef<MapView>(null);
  const watchId = useRef<number | null>(null);

  // Écouter la course actuelle
  useEffect(() => {
    const unsubscribe = subscribeToCurrentRide(driverId, (ride) => {
      setCurrentRide(ride);
    });

    return () => unsubscribe();
  }, [driverId]);

  // Surveiller la position du chauffeur
  useEffect(() => {
    setIsLoadingMap(true);
    geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDriverPosition(newPosition);
        setIsLoadingMap(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLoadingMap(false);
      },
      { enableHighAccuracy: true }
    );

    // Surveiller les changements de position
    watchId.current = geolocation.watchPosition(
      (position) => {
        setDriverPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error('Erreur de suivi:', error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => {
      if (watchId.current !== null) {
        geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // Animer la carte pour afficher le trajet
  const handleMapReady = () => {
    if (!driverPosition || !currentRide) return;

    const targetPosition = isArrivingAtPickup()
      ? currentRide.pickupLocation
      : currentRide.dropoffLocation;

    mapRef.current?.fitToCoordinates(
      [
        { latitude: driverPosition.lat, longitude: driverPosition.lng },
        { latitude: targetPosition.lat, longitude: targetPosition.lng },
      ],
      {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      }
    );
  };

  const isArrivingAtPickup = () => {
    return (
      currentRide?.status === RideStatus.ACCEPTED ||
      currentRide?.status === RideStatus.ARRIVING
    );
  };

  const isArrivedAtPickup = () => {
    return currentRide?.status === RideStatus.ARRIVED;
  };

  const isInProgress = () => {
    return currentRide?.status === RideStatus.IN_PROGRESS;
  };

  const handleArrivedAtPickup = async () => {
    if (!currentRide?.id) return;
    
    setIsProcessing(true);
    try {
      await markAsArrived(currentRide.id);
      Alert.alert('Succès', 'Arrivée confirmée chez le client');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de confirmer l\'arrivée');
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRide = async () => {
    if (!currentRide?.id) return;
    
    setIsProcessing(true);
    try {
      await startRide(currentRide.id);
      Alert.alert('Succès', 'Course commencée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de commencer la course');
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!currentRide?.id) return;
    
    setIsProcessing(true);
    try {
      await completeRide(currentRide.id);
      Alert.alert('Succès', 'Course terminée');
      setCurrentRide(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de terminer la course');
      console.error('Erreur:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentRide || !driverPosition) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>Pas de course active</Text>
          <Text style={styles.emptyStateText}>
            En attente d'une nouvelle course...
          </Text>
          <ActivityIndicator size="large" color="#FFC107" style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  const targetPosition = isArrivingAtPickup()
    ? currentRide.pickupLocation
    : currentRide.dropoffLocation;

  const targetAddress = isArrivingAtPickup()
    ? currentRide.pickupAddress
    : currentRide.dropoffAddress;

  const estDistance = (currentRide.distance / 1000).toFixed(1);
  const estTime = Math.ceil(currentRide.duration / 60);

  return (
    <SafeAreaView style={styles.container}>
      {/* Carte */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: driverPosition.lat,
          longitude: driverPosition.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={handleMapReady}
      >
        {/* Marqueur chauffeur */}
        <Marker
          coordinate={{
            latitude: driverPosition.lat,
            longitude: driverPosition.lng,
          }}
          title="Vous"
          pinColor="#4CAF50"
          flat
        />

        {/* Marqueur client (lieu d'attente) */}
        {isArrivingAtPickup() && (
          <Marker
            coordinate={{
              latitude: currentRide.pickupLocation.lat,
              longitude: currentRide.pickupLocation.lng,
            }}
            title="Client (Attente)"
            pinColor="#2196F3"
          />
        )}

        {/* Marqueur destination */}
        {(isArrivedAtPickup() || isInProgress()) && (
          <Marker
            coordinate={{
              latitude: currentRide.dropoffLocation.lat,
              longitude: currentRide.dropoffLocation.lng,
            }}
            title="Destination"
            pinColor="#f44336"
          />
        )}

        {/* Ligne de trajet */}
        {driverPosition && targetPosition && (
          <Polyline
            coordinates={[
              {
                latitude: driverPosition.lat,
                longitude: driverPosition.lng,
              },
              {
                latitude: targetPosition.lat,
                longitude: targetPosition.lng,
              },
            ]}
            strokeColor="#FFC107"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Panneau d'information */}
      <View style={styles.infoPanel}>
        <View style={styles.infoPanelContent}>
          {/* Destination actuelle */}
          <View style={styles.currentTarget}>
            <Text style={styles.stepLabel}>
              {isArrivingAtPickup() ? '📍 Allez chercher le client' : '📍 Direction la destination'}
            </Text>
            <Text style={styles.targetAddress} numberOfLines={2}>
              {targetAddress}
            </Text>
          </View>

          {/* Statistiques */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📏</Text>
              <View>
                <Text style={styles.statValue}>{estDistance} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <View>
                <Text style={styles.statValue}>~{estTime} min</Text>
                <Text style={styles.statLabel}>Durée</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💰</Text>
              <View>
                <Text style={styles.statValue}>{currentRide.fare} F</Text>
                <Text style={styles.statLabel}>Tarif</Text>
              </View>
            </View>
          </View>

          {/* Statut de la course */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Étape en cours:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {isArrivingAtPickup() && '🚗 En route vers le client'}
                {isArrivedAtPickup() && '🛑 Arrivé chez le client'}
                {isInProgress() && '🚕 Course en cours'}
              </Text>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtonsContainer}>
            {isArrivingAtPickup() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.arrivedButton]}
                onPress={handleArrivedAtPickup}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.arrivedButtonText}>Arrivé</Text>
                )}
              </TouchableOpacity>
            )}

            {isArrivedAtPickup() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartRide}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startButtonText}>Commencer la course</Text>
                )}
              </TouchableOpacity>
            )}

            {isInProgress() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleCompleteRide}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.completeButtonText}>Terminer la course</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  infoPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 0,
  },
  infoPanelContent: {
    padding: 16,
    maxHeight: Dimensions.get('window').height * 0.4,
  },
  currentTarget: {
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  targetAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  statusText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedButton: {
    backgroundColor: '#2196F3',
  },
  arrivedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#FF9800',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
