import firestore from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RideRequest, completeRide } from '../services/rideService';



interface RideCompletionScreenProps {
  visible: boolean;
  rideRequest: RideRequest;
  onClose: () => void;
  driverId: string;
}

export default function RideCompletionScreen({
  visible,
  rideRequest,
  onClose,
  driverId,
}: RideCompletionScreenProps) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!rideRequest.id) return;

    setIsSubmitting(true);
    try {
      // Mettre à jour la course avec la note et les commentaires
      const rideRef = firestore().collection('rides').doc(rideRequest.id);
      await rideRef.update( {
        driverRating: rating,
        driverComments: comments,
      });

      Alert.alert('Succès', 'Merci pour votre retour!');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de soumettre le retour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Text style={[styles.star, rating >= star && styles.starActive]}>
              {rating >= star ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎉 Course Terminée!</Text>
        </View>

        {/* Contenu */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Message de completion */}
          <View style={styles.completionCard}>
            <Text style={styles.completionTitle}>Excellent travail!</Text>
            <Text style={styles.completionText}>
              Vous avez complété la course de {rideRequest.dropoffAddress}
            </Text>
          </View>

          {/* Résumé de la course */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>
                {(rideRequest.distance / 1000).toFixed(1)} km
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Durée</Text>
              <Text style={styles.summaryValue}>
                ~{Math.ceil(rideRequest.duration / 60)} min
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gains</Text>
              <Text style={styles.summaryValue}>{rideRequest.fare} F</Text>
            </View>
          </View>

          {/* Note du client */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Vos commentaires</Text>
            <Text style={styles.feedbackSubtitle}>
              Partagez vos impressions sur cette course
            </Text>

            {/* Notation */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Comment s'est déroulée la course?</Text>
              {renderStars()}
              <Text style={[styles.ratingValue, {color: '#D32F2F'}]}>
                {rating === 0
                  ? 'Sélectionnez une note'
                  : `Note: ${rating}/${5}`}
              </Text>
            </View>

            {/* Commentaires */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Commentaires (optionnel)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Partagez vos commentaires..."
                placeholderTextColor="#ccc"
                multiline
                numberOfLines={4}
                value={comments}
                onChangeText={setComments}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Statistiques */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <View>
                <Text style={styles.statValue}>Excellent</Text>
                <Text style={styles.statLabel}>
                  Note moyenne: 4.8/5
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Soumettre (Note: {rating}/5)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Passer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  completionCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  feedbackSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 12,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  star: {
    fontSize: 32,
  },
  starActive: {
    fontSize: 36,
  },
  ratingValue: {
    fontSize: 13,
    color: '#FFC107',
    fontWeight: '600',
  },
  commentSection: {
    gap: 8,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'column',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
