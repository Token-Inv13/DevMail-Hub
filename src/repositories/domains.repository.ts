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
import { Domain } from '../types/domain';

export function subscribeUserDomains(
  userId: string,
  onData: (domains: Domain[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, 'domains'), where('userId', '==', userId)),
    (snapshot) => {
      const domains = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Domain[];

      onData(sortDomainsByCreatedAtDesc(domains));
    },
    (error) => onError(error),
  );
}

export function sortDomainsByCreatedAtDesc(domains: Domain[]) {
  return [...domains].sort((left, right) => {
    const leftDate = left.createdAt?.seconds || 0;
    const rightDate = right.createdAt?.seconds || 0;
    return rightDate - leftDate;
  });
}

export async function createDomain(
  userId: string,
  name: string,
  isAutomated = false,
  dnsProvider: Domain['dnsProvider'] = null,
) {
  const docRef = await addDoc(collection(db, 'domains'), {
    userId,
    name,
    status: 'pending',
    mxValid: false,
    spfValid: false,
    dkimValid: false,
    reputation: 'None',
    isAutomated,
    dnsProvider,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteDomainById(id: string) {
  return deleteDoc(doc(db, 'domains', id));
}

export async function updateDomainById(id: string, data: Partial<Domain>) {
  return updateDoc(doc(db, 'domains', id), data);
}
