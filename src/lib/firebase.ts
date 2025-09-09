// Import the functions you need from the SDKs you need
import {initializeApp, getApp, getApps} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZk7rpc6YjpR9qhZ_8SRO7jLBu5-xJN4A",
  authDomain: "roleplai-7540e.firebaseapp.com",
  projectId: "roleplai-7540e",
  storageBucket: "roleplai-7540e.appspot.com",
  messagingSenderId: "767539080123",
  appId: "1:767539080123:web:52a45ab2a009ee9543329e",
  measurementId: "G-YSMH24EJYK"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export {app, db, auth};
