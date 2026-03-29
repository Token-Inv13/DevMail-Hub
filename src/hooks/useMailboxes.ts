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

export interface Mailbox {
  id: string;
  userId: string;
  address: string;
  label: string;
  project: string;
  status: 'active' | 'inactive';
  createdAt: any;
  lastMessageAt?: any;
}

export function useMailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'mailboxes'),
      where('userId', '==', auth.currentUser.uid)
      // Removed orderBy temporarily to avoid index requirement issues
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mailbox[];
      
      // Sort manually in memory for now
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
      
      // If index is missing, provide helpful info
      if (err.message.includes('index')) {
        console.warn("Firestore Index Required: Check the console for the index creation link.");
      }
    });

    return () => unsubscribe();
  }, []);

  const createMailbox = async (label: string, project: string) => {
    if (!auth.currentUser) return;

    // Generate a random test email address
    const randomStr = Math.random().toString(36).substring(2, 10);
    const address = `test-${randomStr}@devmail.hub`;

    try {
      await addDoc(collection(db, 'mailboxes'), {
        userId: auth.currentUser.uid,
        address,
        label,
        project,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error creating mailbox:", err);
      throw err;
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      const docRef = doc(db, 'mailboxes', id);
      await updateDoc(docRef, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
    } catch (err) {
      console.error("Error updating status:", err);
      throw err;
    }
  };

  const removeMailbox = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mailboxes', id));
    } catch (err) {
      console.error("Error deleting mailbox:", err);
      throw err;
    }
  };

  return { mailboxes, loading, error, createMailbox, toggleStatus, removeMailbox };
}
