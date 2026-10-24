import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalBalance: number;
  investedAmount: number;
  cashBalance: number;
  returnsAmount: number;
  role: 'client' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserBalance: (delta: { totalBalance?: number; investedAmount?: number; cashBalance?: number; returnsAmount?: number }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateUserBalance: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            const isDefaultAdmin = currentUser.email?.toLowerCase() === 'adereraadenike@gmail.com';
            const nameParts = currentUser.displayName?.split(' ') || [];
            const initialProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              firstName: nameParts[0] || 'Investor',
              lastName: nameParts.slice(1).join(' ') || '',
              totalBalance: 145000,
              investedAmount: 95000,
              cashBalance: 50000,
              returnsAmount: 14200,
              role: isDefaultAdmin ? 'admin' : 'client',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }

          // Realtime listener for balance / profile updates
          unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
          }, (err) => {
            console.warn('Profile sync snapshot error:', err);
          });
        } catch (error) {
          console.error('Error synchronizing user profile:', error);
          // Fallback profile if offline
          setProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            firstName: currentUser.displayName?.split(' ')[0] || 'Investor',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            totalBalance: 145000,
            investedAmount: 95000,
            cashBalance: 50000,
            returnsAmount: 14200,
            role: currentUser.email?.toLowerCase() === 'adereraadenike@gmail.com' ? 'admin' : 'client',
          });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, firstName?: string, lastName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const isDefaultAdmin = email.toLowerCase() === 'adereraadenike@gmail.com';
    
    const initialProfile: UserProfile = {
      userId: cred.user.uid,
      email: cred.user.email || email,
      firstName: firstName || 'Investor',
      lastName: lastName || '',
      totalBalance: 145000,
      investedAmount: 95000,
      cashBalance: 50000,
      returnsAmount: 14200,
      role: isDefaultAdmin ? 'admin' : 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(userDocRef, initialProfile);
      setProfile(initialProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const updateUserBalance = async (updates: { totalBalance?: number; investedAmount?: number; cashBalance?: number; returnsAmount?: number }) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'adereraadenike@gmail.com';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateUserBalance,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
