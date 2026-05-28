import firestore from '@react-native-firebase/firestore';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

export async function seedPointsSecours() {
  const points = [
    { nom: 'Hôpital Central', type: 'hopital', lat: 4.0511, lng: 9.7679, telephone: '+237 123 456 789' },
    { nom: 'Caserne Pompiers', type: 'pompier', lat: 4.0480, lng: 9.7620, telephone: '+237 18' },
    { nom: 'Commissariat Central', type: 'police', lat: 4.0530, lng: 9.7700, telephone: '+237 17' },
  ];
  for (const p of points) {
    await firestore().collection('points_secours').add({
      nom: p.nom, type: p.type,
      position: new firestore.GeoPoint(p.lat, p.lng),
      geohash: geohashForLocation([p.lat, p.lng]),
      telephone: p.telephone,
      disponible: true,
    });
  }
}

export async function getPointsSecoursProches(lat: number, lng: number, radiusKm = 5) {
  const center: [number, number] = [lat, lng];
  const bounds = geohashQueryBounds(center, radiusKm * 1000);
  const results: any[] = [];
  for (const b of bounds) {
    const snap = await firestore().collection('points_secours')
      .where('geohash', '>=', b[0]).where('geohash', '<=', b[1]).get();
    snap.forEach(d => {
      const data = d.data();
      const dist = distanceBetween([data.position.latitude, data.position.longitude], center);
      if (dist <= radiusKm) results.push({ id: d.id, ...data, distance: dist.toFixed(2) });
    });
  }
  return results.sort((a, b) => a.distance - b.distance);
}

export async function updateUserPosition(uid: string, lat: number, lng: number) {
  await firestore().collection('utilisateurs').doc(uid).update({
    position: new firestore.GeoPoint(lat, lng),
    positionUpdatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
