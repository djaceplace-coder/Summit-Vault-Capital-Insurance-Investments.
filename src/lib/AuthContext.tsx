import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

export const OFFICIAL_ADMIN_EMAIL = 'admin@summitvaultcapital.online';

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  totalBalance: number;
  investedAmount: number;
  cashBalance: number;
  returnsAmount: number;
  unreadNotificationsCount?: number;
  totalNotificationsCount?: number;
  role: 'client' | 'admin';
  status?: 'active' | 'suspended' | 'pending';
  kycStatus?: 'verified' | 'pending' | 'action_required';
  assignedAgentId?: string;
  assignedAgentName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

function isEmailAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === OFFICIAL_ADMIN_EMAIL || clean === 'adereraadenike@gmail.com';
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
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
  updateUserProfile: async () => {},
});

const EXPLICIT_AUTH_FLAG = 'sv_explicit_auth_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            let preProvisioned: Partial<UserProfile> | null = null;
            if (currentUser.email) {
              const q = query(collection(db, 'users'), where('email', '==', currentUser.email.toLowerCase()));
              const qSnap = await getDocs(q);
              if (!qSnap.empty) {
                const existingDoc = qSnap.docs[0];
                preProvisioned = existingDoc.data() as UserProfile;
                if (existingDoc.id !== currentUser.uid) {
                  await deleteDoc(doc(db, 'users', existingDoc.id));
                }
              }
            }

            const isExplicitAuth = sessionStorage.getItem(EXPLICIT_AUTH_FLAG) === 'true';
            if (!preProvisioned && !isExplicitAuth) {
              await firebaseSignOut(auth);
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }

            const isDefaultAdmin = isEmailAuthorizedAdmin(currentUser.email);
            const nameParts = currentUser.displayName?.split(' ') || [];
            const initialProfile: UserProfile = {
              userId: currentUser.uid,
              email: (currentUser.email || '').toLowerCase(),
              firstName: preProvisioned?.firstName || nameParts[0] || 'Investor',
              lastName: preProvisioned?.lastName || nameParts.slice(1).join(' ') || '',
              phone: preProvisioned?.phone || '+1 (555) 000-0000',
              totalBalance: preProvisioned?.totalBalance ?? 0,
              investedAmount: preProvisioned?.investedAmount ?? 0,
              cashBalance: preProvisioned?.cashBalance ?? 0,
              returnsAmount: preProvisioned?.returnsAmount ?? 0,
              unreadNotificationsCount: preProvisioned?.unreadNotificationsCount ?? 0,
              totalNotificationsCount: preProvisioned?.totalNotificationsCount ?? 0,
              role: preProvisioned?.role || (isDefaultAdmin ? 'admin' : 'client'),
              status: preProvisioned?.status || 'active',
              kycStatus: preProvisioned?.kycStatus || 'verified',
              assignedAgentId: preProvisioned?.assignedAgentId || 'AG-001',
              assignedAgentName: preProvisioned?.assignedAgentName || 'Sarah Jenkins',
              createdAt: preProvisioned?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialProfile);
            setUser(currentUser);
            setProfile(initialProfile);
          } else {
            setUser(currentUser);
            setProfile(userSnap.data() as UserProfile);
          }

          unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              sessionStorage.removeItem(EXPLICIT_AUTH_FLAG);
              firebaseSignOut(auth).catch(() => {});
              setUser(null);
              setProfile(null);
            }
          }, (err) => {
            console.warn('Profile sync snapshot error:', err);
          });
        } catch (error) {
          console.error('Error synchronizing user profile:', error);
          setUser(currentUser);
          setProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            firstName: currentUser.displayName?.split(' ')[0] || 'Investor',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            totalBalance: 0,
            investedAmount: 0,
            cashBalance: 0,
            returnsAmount: 0,
            unreadNotificationsCount: 0,
            totalNotificationsCount: 0,
            role: isEmailAuthorizedAdmin(currentUser.email) ? 'admin' : 'client',
            status: 'active',
            kycStatus: 'verified',
            assignedAgentId: 'AG-001',
            assignedAgentName: 'Sarah Jenkins',
          });
        }
      } else {
        setUser(null);
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
      sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const qSnap = await getDocs(q);
      let preProvisioned: Partial<UserProfile> | null = null;
      if (!qSnap.empty) {
        const existingDoc = qSnap.docs[0];
        preProvisioned = existingDoc.data() as UserProfile;
        if (existingDoc.id !== cred.user.uid) {
          await deleteDoc(doc(db, 'users', existingDoc.id));
        }
      }
      const isDefaultAdmin = isEmailAuthorizedAdmin(cleanEmail);
      const initialProfile: UserProfile = {
        userId: cred.user.uid,
        email: cleanEmail,
        firstName: preProvisioned?.firstName || 'Investor',
        lastName: preProvisioned?.lastName || '',
        phone: preProvisioned?.phone || '+1 (555) 000-0000',
        totalBalance: preProvisioned?.totalBalance ?? 0,
        investedAmount: preProvisioned?.investedAmount ?? 0,
        cashBalance: preProvisioned?.cashBalance ?? 0,
        returnsAmount: preProvisioned?.returnsAmount ?? 0,
        unreadNotificationsCount: preProvisioned?.unreadNotificationsCount ?? 0,
        totalNotificationsCount: preProvisioned?.totalNotificationsCount ?? 0,
        role: preProvisioned?.role || (isDefaultAdmin ? 'admin' : 'client'),
        status: preProvisioned?.status || 'active',
        kycStatus: preProvisioned?.kycStatus || 'verified',
        assignedAgentId: preProvisioned?.assignedAgentId || 'AG-001',
        assignedAgentName: preProvisioned?.assignedAgentName || 'Sarah Jenkins',
        createdAt: preProvisioned?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, initialProfile);
      setProfile(initialProfile);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, firstName?: string, lastName?: string) => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const isDefaultAdmin = isEmailAuthorizedAdmin(cleanEmail);
    
    const initialProfile: UserProfile = {
      userId: cred.user.uid,
      email: cleanEmail,
      firstName: firstName || 'Investor',
      lastName: lastName || '',
      phone: '+1 (555) 000-0000',
      totalBalance: 0,
      investedAmount: 0,
      cashBalance: 0,
      returnsAmount: 0,
      unreadNotificationsCount: 0,
      totalNotificationsCount: 0,
      role: isDefaultAdmin ? 'admin' : 'client',
      status: 'active',
      kycStatus: 'verified',
      assignedAgentId: 'AG-001',
      assignedAgentName: 'Sarah Jenkins',
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
    sessionStorage.removeItem(EXPLICIT_AUTH_FLAG);
    await firebaseSignOut(auth);
    setUser(null);
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

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        ...updates,
        userId: user.uid,
        email: profile?.email || user.email || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isAdmin = profile?.role === 'admin' || isEmailAuthorizedAdmin(user?.email);

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
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
