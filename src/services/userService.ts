import firestore from '@react-native-firebase/firestore';

export async function createUser(uid: string, data: any) {
  if (data.role === 'driver') {
    await firestore().collection('drivers').doc(uid).set({
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      role: 'driver',
      isOnline: false,
      currentPosition: null,
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      note: 5.0,
      totalCourses: 0,
      totalEarnings: 0,
      acceptanceRate: 1.0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }
  await firestore().collection('utilisateurs').doc(uid).set({
    uid,
    nom: data.nom,
    telephone: data.telephone,
    email: data.email,
    role: data.role,
    position: null,
    actif: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function getUser(uid: string) {
  const snap = await firestore().collection('utilisateurs').doc(uid).get();
  return snap.exists ? snap.data() : null;
}

export async function getDriver(uid: string) {
  const snap = await firestore().collection('drivers').doc(uid).get();
  return snap.exists ? snap.data() : null;
}

export async function updateUser(uid: string, data: any) {
  await firestore().collection('utilisateurs').doc(uid).set(data, { merge: true });
}

export async function updateDriver(uid: string, data: any) {
  await firestore().collection('drivers').doc(uid).set(data, { merge: true });
}
