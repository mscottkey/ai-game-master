// Import the functions you need from the SDKs you need
import {initializeApp, getApp, getApps} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ8VqQ3KDG9Apk5NfMOTP3KHpbBeB7ifc",
  authDomain: "ai-dungeon-master-3opix.firebaseapp.com",
  projectId: "ai-dungeon-master-3opix",
  storageBucket: "ai-dungeon-master-3opix.firebasestorage.app",
  messagingSenderId: "974007310177",
  appId: "1:974007310177:web:9ba4b687bd6d349a761720"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export {app, db, auth};
