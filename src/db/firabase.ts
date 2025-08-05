// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCh5je8lACt7dJHYN8AgQwsjb4breM5JtE",
  authDomain: "field-tasks-e9790.firebaseapp.com",
  projectId: "field-tasks-e9790",
  storageBucket: "field-tasks-e9790.firebasestorage.app",
  messagingSenderId: "681053971894",
  appId: "1:681053971894:web:e2b98552965c8f74db4d17",
  measurementId: "G-4V3EJDSLDY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db };
export { auth };
