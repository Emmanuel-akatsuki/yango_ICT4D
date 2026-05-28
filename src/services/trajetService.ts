import firestore from '@react-native-firebase/firestore';

export async function createTrajet(clientId: string, depart: any, arrivee: any, vehiculeType: string) {
  const ref = await firestore().collection('trajets').add({
    clientId,
    chauffeurId: null,
    depart: new firestore.GeoPoint(depart.lat, depart.lng),
    arrivee: new firestore.GeoPoint(arrivee.lat, arrivee.lng),
    departAdresse: depart.adresse,
    arriveeAdresse: arrivee.adresse,
    statut: 'en_attente',
    vehiculeType,
    prix: null,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateStatutTrajet(trajetId: string, statut: string, extra = {}) {
  await firestore().collection('trajets').doc(trajetId).update({
    statut, updatedAt: firestore.FieldValue.serverTimestamp(), ...extra
  });
}

export const commanderCourse = async (clientId: string, depart: any, destination: any) => {
  const ref = await firestore().collection('trajets').add({
    id_client: clientId,
    id_chauffeur: null,
    depart,
    destination,
    statut: 'en_attente',
    timestamp: firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};
