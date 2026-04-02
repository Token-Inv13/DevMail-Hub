import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Domain } from '../types/domain';
import { createDomain, deleteDomainById, subscribeUserDomains, updateDomainById } from '../repositories/domains.repository';

export const useInfrastructure = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setDomains([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeUserDomains(
      auth.currentUser.uid,
      (domainList) => {
        setDomains(domainList);
        setLoading(false);
      },
      (error) => {
        console.error("Infrastructure Hook: Firestore Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const addDomain = async (name: string, isAutomated = false, dnsProvider: 'cloudflare' | 'gandi' | 'route53' | null = null) => {
    if (!auth.currentUser) {
      console.error("Infrastructure Hook: No authenticated user");
      return;
    }

    try {
      const domainId = await createDomain(auth.currentUser.uid, name, isAutomated, dnsProvider);
      return domainId;
    } catch (error) {
      console.error("Infrastructure Hook: Error adding domain:", error);
      throw error;
    }
  };

  const deleteDomain = async (id: string) => {
    await deleteDomainById(id);
  };

  const checkDomainStatus = async (id: string) => {
    // Simulated MX/SPF check
    const random = Math.random();
    
    await updateDomainById(id, {
      mxValid: random > 0.3,
      spfValid: random > 0.5,
      status: random > 0.4 ? 'active' : 'pending',
      reputation: random > 0.7 ? 'High' : random > 0.4 ? 'Medium' : 'Low'
    });
  };

  const automateDNS = async (id: string, provider: 'cloudflare' | 'gandi' | 'route53') => {
    // Simulate API call to DNS provider
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await updateDomainById(id, {
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
