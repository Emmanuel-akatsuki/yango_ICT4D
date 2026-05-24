import { db } from '../config/firebase';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';

export async function createIncident(userId: string, position: any, message: string) {
  const ref = await addDoc(collection(db, 'incidents_secours'), {
    userId,
    position: new GeoPoint(position.lat, position.lng),
    message,
    timestamp: new Date(),
    secoursAlerte: false,
    statut: 'nouveau'
  });
  return ref.id;
}