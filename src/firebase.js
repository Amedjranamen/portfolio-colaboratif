import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOvUj3afZodGZ280dojZNkLhBW0bus_nI",
  authDomain: "portfolio-collaboratif.firebaseapp.com",
  projectId: "portfolio-collaboratif",
  storageBucket: "portfolio-collaboratif.firebasestorage.app",
  messagingSenderId: "800187211529",
  appId: "1:800187211529:web:a2e4bee6d873ccf17abdd8",
  measurementId: "G-FJ693F8MVJ",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
