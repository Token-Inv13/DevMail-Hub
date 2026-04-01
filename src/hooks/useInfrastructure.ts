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

export interface Domain {
  id: string;
  userId: string;
  name: string;
  status: 'pending' | 'active' | 'error';
  mxValid: boolean;
  spfValid: boolean;
  dkimValid: boolean;
  reputation: 'High' | 'Medium' | 'Low' | 'None';
  isAutomated: boolean;
  dnsProvider?: 'cloudflare' | 'gandi' | 'route53' | null;
  createdAt: any;
}

export const useInfrastructure = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setDomains([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'domains'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Domain[];
      
      const domainList = list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      console.log("Infrastructure Hook: Loaded domains:", domainList.length);
      setDomains(domainList);
      setLoading(false);
    }, (error) => {
      console.error("Infrastructure Hook: Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addDomain = async (name: string, isAutomated = false, dnsProvider: 'cloudflare' | 'gandi' | 'route53' | null = null) => {
    if (!auth.currentUser) {
      console.error("Infrastructure Hook: No authenticated user");
      return;
    }

    try {
      console.log("Infrastructure Hook: Adding domain:", name);
      const docRef = await addDoc(collection(db, 'domains'), {
        userId: auth.currentUser.uid,
        name,
        status: 'pending',
        mxValid: false,
        spfValid: false,
        dkimValid: false,
        reputation: 'None',
        isAutomated,
        dnsProvider,
        createdAt: serverTimestamp()
      });
      console.log("Infrastructure Hook: Domain added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Infrastructure Hook: Error adding domain:", error);
      throw error;
    }
  };

  const deleteDomain = async (id: string) => {
    await deleteDoc(doc(db, 'domains', id));
  };

  const checkDomainStatus = async (id: string) => {
    // Simulated MX/SPF check
    const domainRef = doc(db, 'domains', id);
    const random = Math.random();
    
    await updateDoc(domainRef, {
      mxValid: random > 0.3,
      spfValid: random > 0.5,
      status: random > 0.4 ? 'active' : 'pending',
      reputation: random > 0.7 ? 'High' : random > 0.4 ? 'Medium' : 'Low'
    });
  };

  const automateDNS = async (id: string, provider: 'cloudflare' | 'gandi' | 'route53') => {
    const domainRef = doc(db, 'domains', id);
    
    // Simulate API call to DNS provider
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await updateDoc(domainRef, {
      isAutomated: true,
      dnsProvider: provider,
      mxValid: true,
      spfValid: true,
      dkimValid: true,
      status: 'active',
      reputation: 'High'
    });
  };

  const searchDomains = async (query: string) => {
    // Simulated domain search (e.g., via Namecheap/Cloudflare API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tlds = ['.com', '.net', '.io', '.pro', '.org'];
    return tlds.map(tld => ({
      name: `${query}${tld}`,
      price: (Math.random() * 20 + 5).toFixed(2),
      available: Math.random() > 0.2
    }));
  };

  const buyDomain = async (name: string) => {
    // Simulated purchase
    await new Promise(resolve => setTimeout(resolve, 2000));
    await addDomain(name);
  };

  return {
    domains,
    loading,
    addDomain,
    deleteDomain,
    checkDomainStatus,
    automateDNS,
    searchDomains,
    buyDomain
  };
};
