import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';
import { Activity } from '../types/activity';
import { createActivity, subscribeActivities } from '../repositories/activities.repository';

export function useActivities(mailboxId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setActivities([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeActivities(
      auth.currentUser.uid,
      mailboxId,
      (nextActivities) => {
        setActivities(nextActivities);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error (Activities):", err);
        setLoading(false);
        if (err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.LIST, 'activities');
        }
      },
    );

    return () => unsubscribe();
  }, [mailboxId]);

  const logActivity = async (type: Activity['type'], actionName?: string, details?: string) => {
    if (!mailboxId || !auth.currentUser) return;

    try {
      await createActivity({
        mailboxId,
        userId: auth.currentUser.uid,
        type,
        actionName,
        details,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'activities');
    }
  };

  return { activities, loading, logActivity };
}
