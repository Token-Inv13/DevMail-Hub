import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';

export interface Message {
  id: string;
  mailboxId: string;
  userId: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  links: string[];
  receivedAt: any;
  isRead: boolean;
}

export function useMessages(mailboxId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mailboxId || !auth.currentUser) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'messages'),
      where('mailboxId', '==', mailboxId),
      where('userId', '==', auth.currentUser.uid),
      orderBy('receivedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error (Messages):", err);
      setError(err.message);
      setLoading(false);
      if (err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, 'messages');
      }
    });

    return () => unsubscribe();
  }, [mailboxId]);

  const simulateMessage = async (from: string, subject: string, body: string) => {
    if (!mailboxId || !auth.currentUser) return;

    // Extract links from body
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = body.match(urlRegex) || [];

    try {
      await addDoc(collection(db, 'messages'), {
        mailboxId,
        userId: auth.currentUser.uid,
        from,
        subject,
        body,
        links,
        receivedAt: serverTimestamp(),
        isRead: false
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        isRead: true
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
    }
  };

  return { messages, loading, error, simulateMessage, markAsRead };
}
