import firestore from '@react-native-firebase/firestore';

export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ARRIVING = 'arriving',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
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
  duration: number;
  requestedAt: any;
  acceptedAt?: any;
  startedAt?: any;
  completedAt?: any;
  rating?: number;
  comments?: string;
}

export async function createRideRequest(clientId: string, pickupLocation: any, dropoffLocation: any, pickupAddress: string, dropoffAddress: string, fare: number, distance: number, duration: number): Promise<string> {
  const ref = await firestore().collection('rides').add({
    clientId,
    pickupLocation: new firestore.GeoPoint(pickupLocation.lat, pickupLocation.lng),
    dropoffLocation: new firestore.GeoPoint(dropoffLocation.lat, dropoffLocation.lng),
    pickupAddress, dropoffAddress,
    status: RideStatus.PENDING,
    fare, distance, duration,
    requestedAt: firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function acceptRide(rideId: string, driverId: string) {
  await firestore().collection('rides').doc(rideId).update({
    driverId, status: RideStatus.ACCEPTED,
    acceptedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function rejectRide(rideId: string) {
  await firestore().collection('rides').doc(rideId).update({ status: RideStatus.CANCELLED });
}

export async function markAsArrived(rideId: string) {
  await firestore().collection('rides').doc(rideId).update({
    status: RideStatus.ARRIVED,
    arrivedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function startRide(rideId: string) {
  await firestore().collection('rides').doc(rideId).update({
    status: RideStatus.IN_PROGRESS,
    startedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function completeRide(rideId: string) {
  await firestore().collection('rides').doc(rideId).update({
    status: RideStatus.COMPLETED,
    completedAt: firestore.FieldValue.serverTimestamp(),
  });
}

export function subscribeToPendingRides(callback: (rides: RideRequest[]) => void) {
  return firestore().collection('rides')
    .where('status', '==', RideStatus.PENDING)
    .onSnapshot(snap => {
      const rides: RideRequest[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as RideRequest));
      callback(rides);
    });
}

export function subscribeToCurrentRide(driverId: string, callback: (ride: RideRequest | null) => void) {
  return firestore().collection('rides')
    .where('driverId', '==', driverId)
    .where('status', 'in', [RideStatus.ACCEPTED, RideStatus.ARRIVING, RideStatus.ARRIVED, RideStatus.IN_PROGRESS])
    .onSnapshot(snap => {
      if (!snap.empty) {
        const d = snap.docs[0];
        callback({ id: d.id, ...d.data() } as RideRequest);
      } else {
        callback(null);
      }
    });
}

export async function getRideDetails(rideId: string): Promise<RideRequest | null> {
  const snap = await firestore().collection('rides').doc(rideId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } as RideRequest : null;
}
