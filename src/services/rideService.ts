import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  GeoPoint,
  Timestamp,
  getDocs,
} from 'firebase/firestore';

/**
 * États possibles d'une course
 */
export enum RideStatus {
  PENDING = 'pending',        // En attente d'acceptation
  ACCEPTED = 'accepted',      // Acceptée par le chauffeur
  ARRIVING = 'arriving',      // Chauffeur en route vers le client
  ARRIVED = 'arrived',        // Chauffeur arrivé chez le client
  IN_PROGRESS = 'in_progress', // Course en cours
  COMPLETED = 'completed',    // Course terminée
  CANCELLED = 'cancelled',    // Course annulée
}

export interface RideRequest {
  id?: string;
  clientId: string;
  driverId?: string;
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  pickupAddress: string;
  dropoffAddress: string;
  status: RideStatus;
  fare: number;
  distance: number;
  duration: number; // en secondes
  requestedAt: any; // Timestamp
  acceptedAt?: any;
  startedAt?: any;
  completedAt?: any;
  rating?: number;
  comments?: string;
}

/**
 * Créer une nouvelle demande de course (client)
 */
export async function createRideRequest(
  clientId: string,
  pickupLocation: { lat: number; lng: number },
  dropoffLocation: { lat: number; lng: number },
  pickupAddress: string,
  dropoffAddress: string,
  fare: number,
  distance: number,
  duration: number
): Promise<string> {
  const ride = await addDoc(collection(db, 'rides'), {
    clientId,
    pickupLocation: new GeoPoint(pickupLocation.lat, pickupLocation.lng),
    dropoffLocation: new GeoPoint(dropoffLocation.lat, dropoffLocation.lng),
    pickupAddress,
    dropoffAddress,
    status: RideStatus.PENDING,
    fare,
    distance,
    duration,
    requestedAt: Timestamp.now(),
  });
  return ride.id;
}

/**
 * Accepter une course (chauffeur)
 */
export async function acceptRide(rideId: string, driverId: string) {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    driverId,
    status: RideStatus.ACCEPTED,
    acceptedAt: Timestamp.now(),
  });
}

/**
 * Refuser une course (chauffeur)
 */
export async function rejectRide(rideId: string) {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: RideStatus.CANCELLED,
  });
}

/**
 * Signaler l'arrivée chez le client
 */
export async function markAsArrived(rideId: string) {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: RideStatus.ARRIVED,
    arrivedAt: Timestamp.now(),
  });
}

/**
 * Commencer la course
 */
export async function startRide(rideId: string) {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: RideStatus.IN_PROGRESS,
    startedAt: Timestamp.now(),
  });
}

/**
 * Terminer la course
 */
export async function completeRide(rideId: string) {
  const rideRef = doc(db, 'rides', rideId);
  await updateDoc(rideRef, {
    status: RideStatus.COMPLETED,
    completedAt: Timestamp.now(),
  });
}

/**
 * Écouter les courses en attente pour un zone (pour les chauffeurs)
 */
export function subscribeToPendingRides(
  pickupLat: number,
  pickupLng: number,
  radiusKm: number = 5,
  callback: (rides: RideRequest[]) => void
) {
  // Note: Pour une vraie implémentation avec géoquerying,
  // utiliser geofire-common comme dans geoService.ts
  const q = query(
    collection(db, 'rides'),
    where('status', '==', RideStatus.PENDING)
  );

  return onSnapshot(q, (querySnapshot) => {
    const rides: RideRequest[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rides.push({
        id: doc.id,
        ...data,
      } as RideRequest);
    });
    callback(rides);
  });
}

/**
 * Écouter la course actuelle du chauffeur
 */
export function subscribeToCurrentRide(
  driverId: string,
  callback: (ride: RideRequest | null) => void
) {
  const q = query(
    collection(db, 'rides'),
    where('driverId', '==', driverId),
    where('status', 'in', [
      RideStatus.ACCEPTED,
      RideStatus.ARRIVING,
      RideStatus.ARRIVED,
      RideStatus.IN_PROGRESS,
    ])
  );

  return onSnapshot(q, (querySnapshot) => {
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      callback({
        id: doc.id,
        ...data,
      } as RideRequest);
    } else {
      callback(null);
    }
  });
}

/**
 * Obtenir les détails d'une course
 */
export async function getRideDetails(rideId: string): Promise<RideRequest | null> {
  const rideRef = doc(db, 'rides', rideId);
  const docSnap = await getDocs(collection(db, 'rides'));
  
  for (const d of docSnap.docs) {
    if (d.id === rideId) {
      return { id: d.id, ...d.data() } as RideRequest;
    }
  }
  return null;
}
