import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for redirect result on mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Create user document if needed with complete structure
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              role: 'user',
              cart: [],
              wishlist: [],
              orders: [],
              settings: { currency: 'INR' },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    checkRedirectResult();
  }, []);

  // Sign up with email/password
  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    // Create user document in Firestore with complete structure
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        role: 'user',
        cart: [],
        wishlist: [],
        orders: [],
        settings: {
          currency: 'INR'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.warn('Could not save user to Firestore:', firestoreError);
    }
    
    return result;
  }

  // Sign in with email/password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign in with Google
  async function loginWithGoogle() {
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, if not create one with complete structure
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            role: 'user',
            cart: [],
            wishlist: [],
            orders: [],
            settings: {
              currency: 'INR'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (firestoreError) {
        console.warn('Could not save user to Firestore:', firestoreError);
      }
      
      return result;
    } catch (error) {
      // If popup blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw error;
    }
  }

  // Sign out
  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Listen to user document for role changes
        const userRef = doc(db, 'users', authUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserRole(doc.data().role || 'user');
          } else {
            setUserRole('user');
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching user role:', error);
          setUserRole('user');
          setLoading(false);
        });
        
        return () => unsubscribeDoc();
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userRole,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
