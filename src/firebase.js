import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCS3dQYmEU7JDOLyHZFY3FciwAcqo78qf0",
  authDomain: "job-hunt-hub-e28ba.firebaseapp.com",
  projectId: "job-hunt-hub-e28ba",
  storageBucket: "job-hunt-hub-e28ba.firebasestorage.app",
  messagingSenderId: "882885867857",
  appId: "1:882885867857:web:5eb5669d5fcc783ccc3b70",
  measurementId: "G-HE213BGRN8",
  databaseURL: "https://job-hunt-hub-e28ba-default-rtdb.firebaseio.com"  // ✅ CORRECT URL
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);