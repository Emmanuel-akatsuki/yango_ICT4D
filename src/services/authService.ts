import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

import {auth, db} from '../firebase/firebaseConfig';

export const registerUser = async (
  name,
  email,
  password,
  phone,
  role
) => {

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = result.user.uid;

  await setDoc(doc(db, 'users', uid), {
    uid,
    name,
    email,
    phone,
    role
  });

  return result;
};

export const loginUser = async (
  email,
  password
) => {

  const result =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return result;
};

export const getUserData = async uid => {

  const userRef =
    await getDoc(doc(db, 'users', uid));

  return userRef.data();
};