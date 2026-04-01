import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';

export interface Activity {
  id: string;
  mailboxId: string;
  userId: string;
  type: 'install' | 'login' | 'action' | 'uninstall';
  actionName?: string;
  details?: string;
  timestamp: any;
}

export function useActivities(mailboxId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setActivities([]);
      return;
    }

    setLoading(true);
    let q = query(
      collection(db, 'activities'),
      where('userId', '==', auth.currentUser.uid),
      limit(100)
    );

    if (mailboxId) {
      q = query(
        collection(db, 'activities'),
        where('mailboxId', '==', mailboxId),
        where('userId', '==', auth.currentUser.uid),
        limit(100)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      
      const sortedList = list.sort((a, b) => {
        const dateA = a.timestamp?.seconds || 0;
        const dateB = b.timestamp?.seconds || 0;
        return dateB - dateA;
      });

      setActivities(sortedList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Activities):", err);
      setLoading(false);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'activities');
      }
    });

    return () => unsubscribe();
  }, [mailboxId]);

  const logActivity = async (type: Activity['type'], actionName?: string, details?: string) => {
    if (!mailboxId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'activities'), {
        mailboxId,
        userId: auth.currentUser.uid,
        type,
        actionName,
        details,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'activities');
    }
  };

  return { activities, loading, logActivity };
}
