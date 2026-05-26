import { db } from '../config/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Créer un utilisateur après inscription
export async function createUser(uid: string, data: any) {
  // Pour les chauffeurs, créer aussi dans la collection 'drivers'
  if (data.role === 'driver') {
    await setDoc(doc(db, 'drivers', uid), {
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      role: 'driver',
      isOnline: false,
      currentPosition: null,
      lastUpdated: Timestamp.now(),
      note: 5.0,
      totalCourses: 0,
      totalEarnings: 0,
      acceptanceRate: 1.0,
      createdAt: Timestamp.now(),
    });
  }

  // Garder aussi dans 'utilisateurs' pour compatibilité
  await setDoc(doc(db, 'utilisateurs', uid), {
    uid,
    nom: data.nom,
    telephone: data.telephone,
    email: data.email,
    role: data.role,       // 'client' ou 'driver'
    position: null,
    actif: true,
    createdAt: Timestamp.now()
  });
}

// Récupérer un utilisateur
export async function getUser(uid: string) {
  const snap = await getDoc(doc(db, 'utilisateurs', uid));
  return snap.exists() ? snap.data() : null;
}

// Récupérer un chauffeur
export async function getDriver(uid: string) {
  const snap = await getDoc(doc(db, 'drivers', uid));
  return snap.exists() ? snap.data() : null;
}

// Mettre à jour les informations d'un utilisateur
export async function updateUser(uid: string, data: any) {
  await setDoc(doc(db, 'utilisateurs', uid), data, { merge: true });
}

// Mettre à jour les informations d'un chauffeur
export async function updateDriver(uid: string, data: any) {
  await setDoc(doc(db, 'drivers', uid), data, { merge: true });
}