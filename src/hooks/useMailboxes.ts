import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';

export interface Mailbox {
  id: string;
  userId: string;
  address: string;
  label: string;
  project: string;
  notes?: string;
  targetUrl?: string;
  playStoreUrl?: string;
  packageName?: string;
  webhookUrl?: string;
  status: 'active' | 'inactive';
  appStatus: 'idle' | 'installing' | 'installed' | 'active';
  isAutoPilotEnabled?: boolean;
  createdAt: any;
  lastMessageAt?: any;
}

export function useMailboxes(user: any) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMailboxes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'mailboxes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mailbox[];
      
      const sortedList = list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setMailboxes(sortedList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError(err.message);
      setLoading(false);
      
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'mailboxes');
      }
    });

    return () => unsubscribe();
  }, [user]);

  const createMailbox = async (
    label: string, 
    project: string, 
    notes: string = '', 
    targetUrl: string = '', 
    webhookUrl: string = '',
    playStoreUrl: string = '',
    packageName: string = '',
    count: number = 1,
    domain?: string
  ) => {
    if (!auth.currentUser) return;

    const domains = ['tech-solutions.pro', 'global-corp.net', 'service-desk.io', 'staff-mail.org', 'verify-account.me', 'gmail-verify.com'];
    const firstNames = ['john', 'jane', 'alex', 'sarah', 'mike', 'emma', 'david', 'lisa', 'tom', 'anna'];
    const lastNames = ['smith', 'jones', 'doe', 'brown', 'wilson', 'taylor', 'clark', 'lewis', 'walker', 'hall'];
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      const randomStr = Math.random().toString(36).substring(2, 6);
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const randomDomain = domain || domains[Math.floor(Math.random() * domains.length)];
      
      // Create a more human-like address: john.doe.a1b2@domain.com
      const address = `${firstName}.${lastName}.${randomStr}@${randomDomain}`;
      const finalLabel = count > 1 ? `${label} #${i + 1}` : label;

      promises.push(
        addDoc(collection(db, 'mailboxes'), {
          userId: auth.currentUser.uid,
          address,
          label: finalLabel,
          project,
          notes,
          targetUrl,
          playStoreUrl,
          packageName,
          webhookUrl,
          status: 'active',
          appStatus: 'idle',
          isAutoPilotEnabled: false,
          createdAt: serverTimestamp(),
        })
      );
    }

    try {
      await Promise.all(promises);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'mailboxes');
    }
  };

  const updateAppStatus = async (id: string, status: Mailbox['appStatus']) => {
    try {
      await updateDoc(doc(db, 'mailboxes', id), { appStatus: status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      const docRef = doc(db, 'mailboxes', id);
      await updateDoc(docRef, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const toggleAutoPilot = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'mailboxes', id), { isAutoPilotEnabled: !current });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const removeMailbox = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mailboxes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `mailboxes/${id}`);
    }
  };

  return { mailboxes, loading, error, createMailbox, toggleStatus, removeMailbox, updateAppStatus, toggleAutoPilot };
}
