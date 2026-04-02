import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { handleFirestoreError, OperationType } from './useAuth';
import { Mailbox } from '../types/mailbox';
import { createMailboxesForUser, deleteMailboxById, subscribeUserMailboxes, updateMailboxById } from '../repositories/mailboxes.repository';
import { CreateMailboxInput } from '../services/mailboxFactory';

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

    const unsubscribe = subscribeUserMailboxes(
      user.uid,
      (nextMailboxes) => {
        setMailboxes(nextMailboxes);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setError(err.message);
        setLoading(false);
        
        if (err.message.includes('permission')) {
          handleFirestoreError(err, OperationType.LIST, 'mailboxes');
        }
      },
    );

    return () => unsubscribe();
  }, [user]);

  const createMailbox = async ({
    label,
    project,
    notes = '',
    targetUrl = '',
    webhookUrl = '',
    playStoreUrl = '',
    packageName = '',
    count = 1,
    domain,
  }: CreateMailboxInput) => {
    if (!auth.currentUser) return;

    try {
      await createMailboxesForUser(auth.currentUser.uid, {
        label,
        project,
        notes,
        targetUrl,
        webhookUrl,
        playStoreUrl,
        packageName,
        count,
        domain,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'mailboxes');
    }
  };

  const updateAppStatus = async (id: string, status: Mailbox['appStatus']) => {
    try {
      await updateMailboxById(id, { appStatus: status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      await updateMailboxById(id, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const toggleAutoPilot = async (id: string, current: boolean) => {
    try {
      await updateMailboxById(id, { isAutoPilotEnabled: !current });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `mailboxes/${id}`);
    }
  };

  const removeMailbox = async (id: string) => {
    try {
      await deleteMailboxById(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `mailboxes/${id}`);
    }
  };

  return { mailboxes, loading, error, createMailbox, toggleStatus, removeMailbox, updateAppStatus, toggleAutoPilot };
}
