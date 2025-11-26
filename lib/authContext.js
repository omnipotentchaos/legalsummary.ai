// lib/authContext.js - Fixed for SSR/Build compatibility
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import app from './firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CRITICAL FIX: Only get auth if we have a valid app
  // During SSR/build, app is null so we skip auth initialization
  const auth = app ? getAuth(app) : null;

  useEffect(() => {
    // If no auth (SSR/build), just set loading to false
    if (!auth) {
      console.log('⚠️ Auth not available (SSR/build mode)');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
        console.log('✅ User authenticated:', user.email);
      } else {
        setUser(null);
        console.log('❌ No user authenticated');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Authentication not available. Please refresh the page.');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful:', result.user.email);
      
      return result.user;
    } catch (error) {
      console.error('❌ Google sign-in error:', error.code, error.message);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized. Please contact support.');
      } else {
        throw new Error('Failed to sign in. Please try again.');
      }
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Authentication not available.');
    }

    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log('✅ User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};