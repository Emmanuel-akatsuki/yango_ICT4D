import firestore from '@react-native-firebase/firestore';

/**
 * Gestion du statut du chauffeur (En ligne / Hors ligne)
 * et position en temps réel
 */

export async function updateDriverStatus(
  driverId: string,
  isOnline: boolean,
  position?: { lat: number; lng: number }
) {
  try {
    const updateData: any = {
      isOnline,
      lastUpdated: firestore.FieldValue.serverTimestamp(),
    };

    if (position) {
      updateData.currentPosition = new firestore.GeoPoint(position.lat, position.lng);
    }

    await firestore().collection('drivers').doc(driverId).set(updateData, { merge: true });
    console.log(`Statut du chauffeur ${driverId} mis à jour: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du chauffeur:', error);
    throw error;
  }
}

export function subscribeToDriverPosition(
  driverId: string,
  callback: (position: { lat: number; lng: number } | null) => void
) {
  return firestore().collection('drivers').doc(driverId).onSnapshot(
    (docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data?.currentPosition) {
          const pos = data.currentPosition;
          callback({ lat: pos.latitude, lng: pos.longitude });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Erreur lors de l\'écoute de la position du chauffeur:', error);
      callback(null);
    }
  );
}

export async function getDriverInfo(driverId: string) {
  try {
    const docSnap = await firestore().collection('drivers').doc(driverId).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations du chauffeur:', error);
    return null;
  }
}

export async function isDriverOnline(driverId: string): Promise<boolean> {
  try {
    const driverInfo = await getDriverInfo(driverId);
    return driverInfo?.isOnline ?? false;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return false;
  }
}

export async function setDriverOffline(driverId: string) {
  try {
    await updateDriverStatus(driverId, false);
  } catch (error) {
    console.error('Erreur lors de la mise du chauffeur hors ligne:', error);
    throw error;
  }
}
