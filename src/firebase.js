import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Add this import

const firebaseConfig = {
  apiKey: "AIzaSyDllaHFJt9MPs7FsofLWg397DxD6TfwUi8",
  authDomain: "prepstack-1e4df.firebaseapp.com",
  projectId: "prepstack-1e4df",
  storageBucket: "prepstack-1e4df.firebasestorage.app", // ✅ This is correct
  messagingSenderId: "599935095989",
  appId: "1:599935095989:web:8eb61eb1a29acd447c9afc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Add this export