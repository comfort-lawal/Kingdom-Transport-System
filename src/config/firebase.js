import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for Kingdom Collaboration
const firebaseConfig = {
  apiKey: "AIzaSyD5RSTMP0X-uI70_YhPRRmh0-QJnPConP4",
  authDomain: "kingdom-collaboration.firebaseapp.com",
  projectId: "kingdom-collaboration",
  storageBucket: "kingdom-collaboration.firebasestorage.app",
  messagingSenderId: "935462436464",
  appId: "1:935462436464:web:1bb449b3ee0212e9d63eb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
