import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

// Admin email — Dr. Itunu
const ADMIN_EMAIL = 'oluwaselawal@gmail.com';

// Only these emails can sign up
const ALLOWED_EMAILS = [
  'oluwaselawal@gmail.com',   // Dr. Itunu (Admin)
  'oluseunolubajo@gmail.com', // A.S.O
  'dayoodukoya@gmail.com',    // Dr. Dayo
  'adefade23@gmail.com',      // Dr. Fadeke
  'olakidare1@gmail.com',     // A.S.O's partner
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  async function signup(email, password, displayName) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      throw new Error('This email is not authorized. Please contact the admin.');
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email: normalizedEmail,
      role: normalizedEmail === ADMIN_EMAIL ? 'admin' : 'collaborator',
      createdAt: new Date().toISOString(),
    });
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  async function updateUserProfile(data) {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid);
    await updateDoc(ref, data);
    if (data.displayName) {
      await updateProfile(currentUser, { displayName: data.displayName });
    }
    setUserProfile(prev => ({ ...prev, ...data }));
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUserProfile(snap.data());
        } else {
          const profile = {
            displayName: user.displayName || user.email,
            email: user.email,
            role: user.email === ADMIN_EMAIL ? 'admin' : 'collaborator',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', user.uid), profile);
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
