import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { RideRequest, acceptRide, rejectRide } from '../services/rideService';

const WINDOW_HEIGHT = Dimensions.get('window').height;

interface RideRequestPopupProps {
  visible: boolean;
  rideRequest: RideRequest;
  onAccept: () => void;
  onReject: () => void;
}

export default function RideRequestPopup({
  visible,
  rideRequest,
  onAccept,
  onReject,
}: RideRequestPopupProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      if (rideRequest.id) {
        // TODO: Récupérer le driverId depuis le contexte/Redux
        await acceptRide(rideRequest.id, 'driverId');
        onAccept();
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      Alert.alert('Erreur', 'Impossible d\'accepter la course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      if (rideRequest.id) {
        await rejectRide(rideRequest.id);
        onReject();
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      Alert.alert('Erreur', 'Impossible de refuser la course');
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedTime = Math.ceil(rideRequest.duration / 60); // convertir en minutes
  const distance = (rideRequest.distance / 1000).toFixed(1); // convertir en km

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onReject}
    >
      <View style={styles.container}>
        {/* Fond gris semi-transparent */}
        <View style={styles.backdrop} />

        {/* Pop-up */}
        <View style={styles.popupContainer}>
          {/* Indicateur de haut du modal */}
          <View style={styles.handle} />

          {/* Contenu */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Titre */}
            <Text style={styles.title}>🎉 Nouvelle Course!</Text>

            {/* Détails du trajet */}
            <View style={styles.tripDetails}>
              {/* Lieu de départ */}
              <View style={styles.locationItem}>
                <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Départ</Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {rideRequest.pickupAddress}
                  </Text>
                </View>
              </View>

              {/* Ligne connectrice */}
              <View style={styles.connectorLine} />

              {/* Lieu d'arrivée */}
              <View style={styles.locationItem}>
                <View style={[styles.dot, { backgroundColor: '#f44336' }]} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Destination</Text>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {rideRequest.dropoffAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Informations de la course */}
            <View style={styles.rideInfo}>
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>{distance} km</Text>
                <Text style={styles.infoLabel}>Distance</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>~{estimatedTime} min</Text>
                <Text style={styles.infoLabel}>Durée estimée</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>{rideRequest.fare} F</Text>
                <Text style={styles.infoLabel}>Tarif</Text>
              </View>
            </View>

            {/* Informations client */}
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Client</Text>
              <View style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>Client</Text>
                  <Text style={styles.clientRating}>⭐ Nouveau client</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
              disabled={isProcessing}
            >
              <Text style={styles.rejectButtonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isProcessing}
            >
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: WINDOW_HEIGHT * 0.85,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginVertical: 12,
  },
  content: {
    padding: 20,
    maxHeight: WINDOW_HEIGHT * 0.65,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  tripDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
    flexShrink: 0,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 18,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 5,
  },
  rideInfo: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  clientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  clientRating: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#FFB800',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
