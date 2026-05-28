import firestore from '@react-native-firebase/firestore';

export async function createIncident(userId: string, position: any, message: string) {
  const ref = await firestore().collection('incidents_secours').add({
    userId,
    position: new firestore.GeoPoint(position.lat, position.lng),
    message,
    timestamp: firestore.FieldValue.serverTimestamp(),
    secoursAlerte: false,
    statut: 'nouveau',
  });
  return ref.id;
}
