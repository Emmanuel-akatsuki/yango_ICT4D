import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, GeoPoint } from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';

export async function createTrajet(clientId: string, depart: any, arrivee: any, vehiculeType: string) {
  const ref = await addDoc(collection(db, 'trajets'), {
    clientId,
    chauffeurId: null,
    depart: new GeoPoint(depart.lat, depart.lng),
    arrivee: new GeoPoint(arrivee.lat, arrivee.lng),
    departAdresse: depart.adresse,
    arriveeAdresse: arrivee.adresse,
    statut: 'en_attente',
    vehiculeType,
    prix: null,
    createdAt: new Date()
  });
  return ref.id;
}

export async function updateStatutTrajet(trajetId: string, statut: string, extra = {}) {
  await updateDoc(doc(db, 'trajets', trajetId), {
    statut, updatedAt: new Date(), ...extra
  });
}

export const commanderCourse = async (clientId: string, depart: any, destination: any) => {
  try {
    const nouveauTrajet = await firestore().collection('trajets').add({
      id_client: clientId,
      id_chauffeur: null, // Aucun chauffeur au départ
      depart: depart, // { latitude: x, longitude: y }
      destination: destination,
      statut: 'en_attente',
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    return nouveauTrajet.id;
  } catch (error) {
    console.error("Erreur lors de la commande :", error);
    throw error;
  }
};
