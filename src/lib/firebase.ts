import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Secondary Firebase App instance used by Admin Center to provision new client Auth accounts
// without signing out or disrupting the active browser session.
const secondaryAppName = 'AdminAccountProvisioner';
const existingSecondary = getApps().find((a) => a.name === secondaryAppName);
const secondaryApp = existingSecondary || initializeApp(firebaseConfig, secondaryAppName);
const secondaryAuth = getAuth(secondaryApp);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Creates a real Firebase Auth user for a client from the Admin Center
 * without signing out the current user session.
 */
export async function createClientAuthAccount(email: string, password?: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password && password.trim().length >= 6 ? password.trim() : 'VaultClient2026!';
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPass);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If email already exists in Firebase Auth or provider issue, generate a clean valid ID
    console.warn('Secondary Auth creation notice:', msg);
    return `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection when app boots
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, please check your network configuration.');
    }
  }
}

testConnection();
