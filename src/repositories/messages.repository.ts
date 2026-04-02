import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Message } from '../types/message';

export function subscribeMailboxMessages(
  userId: string,
  mailboxId: string,
  onData: (messages: Message[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(
      collection(db, 'messages'),
      where('mailboxId', '==', mailboxId),
      where('userId', '==', userId),
    ),
    (snapshot) => {
      const messages = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Message[];

      onData(sortMessagesByReceivedAtDesc(messages));
    },
    (error) => onError(error),
  );
}

export function sortMessagesByReceivedAtDesc(messages: Message[]) {
  return [...messages].sort((left, right) => {
    const leftDate = left.receivedAt?.seconds || 0;
    const rightDate = right.receivedAt?.seconds || 0;
    return rightDate - leftDate;
  });
}

export async function createSimulatedMessage(userId: string, mailboxId: string, from: string, subject: string, body: string) {
  const links = body.match(/(https?:\/\/[^\s]+)/g) || [];

  return addDoc(collection(db, 'messages'), {
    mailboxId,
    userId,
    from,
    subject,
    body,
    links,
    receivedAt: serverTimestamp(),
    isRead: false,
  });
}

export async function markMessageAsRead(messageId: string) {
  return updateDoc(doc(db, 'messages', messageId), { isRead: true });
}
