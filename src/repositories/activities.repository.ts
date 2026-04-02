import { addDoc, collection, limit, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Activity } from '../types/activity';

type ActivityInsert = {
  mailboxId: string;
  userId?: string;
  type: Activity['type'];
  actionName?: string;
  details?: string;
};

export function subscribeActivities(
  userId: string,
  mailboxId: string | null,
  onData: (activities: Activity[]) => void,
  onError: (error: Error) => void,
) {
  const constraints = [where('userId', '==', userId), limit(100)];
  if (mailboxId) {
    constraints.unshift(where('mailboxId', '==', mailboxId));
  }

  return onSnapshot(
    query(collection(db, 'activities'), ...constraints),
    (snapshot) => {
      const activities = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Activity[];

      onData(sortActivitiesByTimestampDesc(activities));
    },
    (error) => onError(error),
  );
}

export function sortActivitiesByTimestampDesc(activities: Activity[]) {
  return [...activities].sort((left, right) => {
    const leftDate = left.timestamp?.seconds || 0;
    const rightDate = right.timestamp?.seconds || 0;
    return rightDate - leftDate;
  });
}

export async function createActivity({ mailboxId, userId, type, actionName, details }: ActivityInsert) {
  return addDoc(collection(db, 'activities'), {
    mailboxId,
    userId,
    type,
    actionName,
    details,
    timestamp: serverTimestamp(),
  });
}
