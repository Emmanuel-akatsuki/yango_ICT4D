import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD94Z800e0e6CGmOpOIRcJYaBCHRsWHBhc",
  authDomain: "yango-f3967.firebaseapp.com",
  projectId: "yango-f3967",
  storageBucket: "yango-f3967.firebasestorage.app",
  messagingSenderId: "35529929970",
  appId: "1:35529929970:android:597b148da4e70f9e5d4c6b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;