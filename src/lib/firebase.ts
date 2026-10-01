import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZAZhGeM3C9pgJzBZkqYX3T59WxI5BYsQ",
  authDomain: "jurnal-yuyun-1b44f.firebaseapp.com",
  projectId: "jurnal-yuyun-1b44f",
  storageBucket: "jurnal-yuyun-1b44f.firebasestorage.app",
  messagingSenderId: "470446806419",
  appId: "1:470446806419:web:65432aa34fb510338a0466"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with offline persistence (cache) to save quota
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});
