import { db } from '../config/firebase';
import { collection, addDoc, GeoPoint, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

// Seed — remplir les points de secours
export async function seedPointsSecours() {
  const points = [
    {
      nom: 'Hôpital Central',
      type: 'hopital',
      position: new GeoPoint(4.0511, 9.7679),
      geohash: geohashForLocation([4.0511, 9.7679]),
      telephone: '+237 123 456 789',
      disponible: true
    },
    {
      nom: 'Caserne Pompiers',
      type: 'pompier',
      position: new GeoPoint(4.0480, 9.7620),
      geohash: geohashForLocation([4.0480, 9.7620]),
      telephone: '+237 18',
      disponible: true
    },
    {
      nom: 'Commissariat Central',
      type: 'police',
      position: new GeoPoint(4.0530, 9.7700),
      geohash: geohashForLocation([4.0530, 9.7700]),
      telephone: '+237 17',
      disponible: true
    },
  ];

  for (const point of points) {
    await addDoc(collection(db, 'points_secours'), point);
    console.log('Ajouté :', point.nom);
  }
}

// Trouver les secours proches
export async function getPointsSecoursProches(lat: number, lng: number, radiusKm = 5) {
  const center: [number, number] = [lat, lng];
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  const results: any[] = [];

  for (const b of bounds) {
    const q = query(
      collection(db, 'points_secours'),
      where('geohash', '>=', b[0]),
      where('geohash', '<=', b[1])
    );
    const snap = await getDocs(q);
    snap.forEach(document => {
      const data = document.data();
      const pos = data.position;
      const dist = distanceBetween([pos.latitude, pos.longitude], center);
      if (dist <= radiusKm) {
        results.push({ id: document.id, ...data, distance: dist.toFixed(2) });
      }
    });
  }
  return results.sort((a, b) => a.distance - b.distance);
}

// Mettre à jour position utilisateur
export async function updateUserPosition(uid: string, lat: number, lng: number) {
  await updateDoc(doc(db, 'utilisateurs', uid), {
    position: new GeoPoint(lat, lng),
    positionUpdatedAt: new Date()
  });
}