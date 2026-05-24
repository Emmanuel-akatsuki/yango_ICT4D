import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Créer un utilisateur après inscription
export async function createUser(uid: string, data: any) {
  await setDoc(doc(db, 'utilisateurs', uid), {
    uid,
    nom: data.nom,
    telephone: data.telephone,
    email: data.email,
    role: data.role,       // 'client' ou 'chauffeur'
    position: null,
    actif: true,
    createdAt: new Date()
  });
}

// Récupérer un utilisateur
export async function getUser(uid: string) {
  const snap = await getDoc(doc(db, 'utilisateurs', uid));
  return snap.exists() ? snap.data() : null;
}