import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, onSnapshot, GeoPoint } from 'firebase/firestore';

/**
 * Gestion du statut du chauffeur (En ligne / Hors ligne)
 * et position en temps réel
 */

export async function updateDriverStatus(
  driverId: string,
  isOnline: boolean,
  position?: { lat: number; lng: number }
) {
  const driverRef = doc(db, 'drivers', driverId);
  const updateData: any = {
    isOnline,
    lastUpdated: new Date(),
  };

  if (position) {
    updateData.currentPosition = new GeoPoint(position.lat, position.lng);
  }

  await updateDoc(driverRef, updateData);
}

/**
 * Écouter les mises à jour de position du chauffeur
 */
export function subscribeToDriverPosition(
  driverId: string,
  callback: (position: { lat: number; lng: number }) => void
) {
  const driverRef = doc(db, 'drivers', driverId);
  
  return onSnapshot(driverRef, (docSnap) => {
    if (docSnap.exists() && docSnap.data().currentPosition) {
      const pos = docSnap.data().currentPosition;
      callback({ lat: pos.latitude, lng: pos.longitude });
    }
  });
}

/**
 * Obtenir les informations du chauffeur
 */
export async function getDriverInfo(driverId: string) {
  const driverRef = doc(db, 'drivers', driverId);
  const docSnap = await getDoc(driverRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}
