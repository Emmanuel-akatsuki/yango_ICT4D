import firestore from '@react-native-firebase/firestore';

export async function updateDriverStatus(driverId: string, isOnline: boolean, position?: { lat: number; lng: number }) {
  const updateData: any = { isOnline, lastUpdated: firestore.FieldValue.serverTimestamp() };
  if (position) {
    updateData.currentPosition = new firestore.GeoPoint(position.lat, position.lng);
  }
  await firestore().collection('drivers').doc(driverId).update(updateData);
}

export function subscribeToDriverPosition(driverId: string, callback: (position: { lat: number; lng: number }) => void) {
  return firestore().collection('drivers').doc(driverId).onSnapshot(snap => {
    if (snap.exists && snap.data()?.currentPosition) {
      const pos = snap.data()!.currentPosition;
      callback({ lat: pos.latitude, lng: pos.longitude });
    }
  });
}

export async function getDriverInfo(driverId: string) {
  const snap = await firestore().collection('drivers').doc(driverId).get();
  return snap.exists ? snap.data() : null;
}
