import auth from '@react-native-firebase/auth';
import { createUser } from './userService';

export async function registerEmail(email: string, password: string, nom: string, telephone: string, role: string) {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);
  await createUser(user.uid, { nom, telephone, email, role });
  return user;
}

export async function loginEmail(email: string, password: string) {
  const { user } = await auth().signInWithEmailAndPassword(email, password);
  return user;
}

export async function logout() {
  await auth().signOut();
}

export function onAuthChange(callback: (user: any) => void) {
  return auth().onAuthStateChanged(callback);
}
