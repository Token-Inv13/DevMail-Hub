import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';
import { Message } from '../types/message';
import { createSimulatedMessage, markMessageAsRead, subscribeMailboxMessages } from '../repositories/messages.repository';

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
    const unsubscribe = subscribeMailboxMessages(
      auth.currentUser.uid,
      mailboxId,
      (nextMessages) => {
        setMessages(nextMessages);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error (Messages):", err);
        setError(err.message);
        setLoading(false);
        if (err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.LIST, 'messages');
        }
      },
    );

    return () => unsubscribe();
  }, [mailboxId]);

  const simulateMessage = async (from: string, subject: string, body: string) => {
    if (!mailboxId || !auth.currentUser) return;

    try {
      await createSimulatedMessage(auth.currentUser.uid, mailboxId, from, subject, body);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
    }
  };

  return { messages, loading, error, simulateMessage, markAsRead };
}
