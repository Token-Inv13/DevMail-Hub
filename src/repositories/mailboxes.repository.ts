import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Mailbox } from '../types/mailbox';
import { buildMailboxDrafts, CreateMailboxInput } from '../services/mailboxFactory';

export function subscribeUserMailboxes(
  userId: string,
  onData: (mailboxes: Mailbox[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, 'mailboxes'), where('userId', '==', userId)),
    (snapshot) => {
      const mailboxes = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Mailbox[];

      onData(sortMailboxesByCreatedAtDesc(mailboxes));
    },
    (error) => onError(error),
  );
}

export function sortMailboxesByCreatedAtDesc(mailboxes: Mailbox[]) {
  return [...mailboxes].sort((left, right) => {
    const leftDate = left.createdAt?.seconds || 0;
    const rightDate = right.createdAt?.seconds || 0;
    return rightDate - leftDate;
  });
}

export async function createMailboxesForUser(userId: string, input: CreateMailboxInput) {
  const drafts = buildMailboxDrafts(userId, input, serverTimestamp());
  return Promise.all(drafts.map((draft) => addDoc(collection(db, 'mailboxes'), draft)));
}

export async function updateMailboxById(id: string, data: Partial<Mailbox>) {
  return updateDoc(doc(db, 'mailboxes', id), data);
}

export async function deleteMailboxById(id: string) {
  return deleteDoc(doc(db, 'mailboxes', id));
}
