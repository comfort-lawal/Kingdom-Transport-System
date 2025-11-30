import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Admin emails - these users will automatically be admins
const ADMIN_EMAILS = [
  'oluwaselawal@gmail.com',
  // Add more admin emails here
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    // Check if this email should be admin
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      role: isAdmin ? 'admin' : 'collaborator',
      createdAt: new Date().toISOString(),
      avatar: displayName.charAt(0).toUpperCase(),
      photoURL: null
    });
    
    return result;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function fetchUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profile = docSnap.data();
        setUserProfile(profile);
        
        // Check if existing user should be upgraded to admin
        if (ADMIN_EMAILS.includes(profile.email?.toLowerCase()) && profile.role !== 'admin') {
          try {
            await updateDoc(docRef, { role: 'admin' });
            setUserProfile({ ...profile, role: 'admin' });
          } catch (e) {
            console.error('Error upgrading to admin:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  async function fetchAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async function updateUserRole(uid, newRole) {
    if (userProfile?.role !== 'admin') {
      throw new Error('Only admins can change roles');
    }
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
    await fetchAllUsers();
  }

  async function updateUserProfile(updates) {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Update Firestore
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    // Update display name in Firebase Auth if provided
    if (updates.displayName) {
      await updateProfile(currentUser, { displayName: updates.displayName });
    }
    
    // Refresh local profile
    await fetchUserProfile(currentUser.uid);
  }

  async function updateProfilePhoto(base64Image) {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    await updateDoc(userRef, {
      photoURL: base64Image,
      updatedAt: new Date().toISOString()
    });
    
    // Refresh local profile
    await fetchUserProfile(currentUser.uid);
  }

  // Check if current user is admin
  function isAdmin() {
    return userProfile?.role === 'admin';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await fetchUserProfile(user.uid);
          await fetchAllUsers();
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Still set loading to false so the app can render
        }
      } else {
        setUserProfile(null);
        setAllUsers([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    allUsers,
    signup,
    login,
    logout,
    loading,
    updateUserProfile,
    updateProfilePhoto,
    updateUserRole,
    fetchUserProfile,
    fetchAllUsers,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
