import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAALV9z1m7RJi_u9woClN-bPBRy0dpPx4w",
  authDomain: "yango-f3967.firebaseapp.com",
  projectId: "yango-f3967",
  storageBucket: "yango-f3967.firebasestorage.app",
  messagingSenderId: "35529929970",
  appId: "1:35529929970:web:e2d9de1a6e05dd355d4c6b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;