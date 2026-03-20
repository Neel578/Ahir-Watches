import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✦ NEW: Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCTqOCCapmB4MTJ7jFRiH_m2b6rxI1uARQ",
  authDomain: "ahir-watches.firebaseapp.com",
  projectId: "ahir-watches",
  storageBucket: "ahir-watches.firebasestorage.app",
  messagingSenderId: "221546130703",
  appId: "1:221546130703:web:95f9a2035cabf7a0bd627a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ✦ NEW: Export the database