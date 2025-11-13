import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from 'firebase/storage'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyDXVZdf28bwW6yjh1-StKFr1Uhzr9UheDM",
  authDomain: "bexbot-9074e.firebaseapp.com",
  projectId: "bexbot-9074e",
  storageBucket: "bexbot-9074e.firebasestorage.app",
  messagingSenderId: "1084381883211",
  appId: "1:1084381883211:web:8458e813d2d4181ce696ce",
  measurementId: "G-ZPMQTZW1LW"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})
export const timestamp = serverTimestamp;
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized.");
    } else {
      console.log("Firebase Analytics is not supported in this browser environment.");
    }
  });
}
export const storage = getStorage(app) 
export { analytics };