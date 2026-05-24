import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { createUser } from './userService';

// Inscription
export async function registerEmail(
  email: string,
  password: string,
  nom: string,
  telephone: string,
  role: string
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await createUser(user.uid, { nom, telephone, email, role });
  return user;
}

// Connexion
export async function loginEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

// Déconnexion
export async function logout() {
  await signOut(auth);
}

// Observer l'état de connexion
export function onAuthChange(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback);
}