import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Ensure user document exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            return;
          }
          
          if (!userDoc || !userDoc.exists()) {
            const newApiKey = `dm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email || 'no-email@devmail.hub',
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                apiKey: newApiKey,
                createdAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
              return;
            }
            setApiKey(newApiKey);
          } else {
            setApiKey(userDoc.data()?.apiKey || null);
          }
          setUser(firebaseUser);
        } else {
          setUser(null);
          setApiKey(null);
        }
      } catch (err) {
        console.error("Auth Hook Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const rotateApiKey = async () => {
    if (!user) return;
    const newApiKey = `dm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { apiKey: newApiKey }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
    setApiKey(newApiKey);
  };

  return { user, loading, apiKey, rotateApiKey };
}
