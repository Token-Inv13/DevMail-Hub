import { FormEvent, useState } from 'react';
import { Domain } from '../types/domain';
import { updateDomainById } from '../repositories/domains.repository';
import { listCloudflareZones, setupCloudflareDns, verifyCloudflareDns } from '../services/cloudflare.service';

type CloudflareZone = {
  id: string;
  name: string;
};

type DomainSearchResult = {
  name: string;
  price: string;
  available: boolean;
};

type UseInfrastructureActionsOptions = {
  addDomain: (name: string, isAutomated?: boolean, dnsProvider?: 'cloudflare' | 'gandi' | 'route53' | null) => Promise<string | void>;
  automateDNS: (id: string, provider: 'cloudflare' | 'gandi' | 'route53') => Promise<void>;
  buyDomain: (name: string) => Promise<void>;
  checkDomainStatus: (id: string) => Promise<void>;
  domains: Domain[];
  notify: (input: { message: string; tone?: 'success' | 'error' | 'info' }) => void;
  searchDomains: (query: string) => Promise<DomainSearchResult[]>;
};

export function useInfrastructureActions({
  addDomain,
  automateDNS,
  buyDomain,
  checkDomainStatus,
  domains,
  notify,
  searchDomains,
}: UseInfrastructureActionsOptions) {
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DomainSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [isAutomating, setIsAutomating] = useState<string | null>(null);
  const [cfZones, setCfZones] = useState<CloudflareZone[]>([]);
  const [isCFLoading, setIsCFLoading] = useState(false);
  const [cfError, setCfError] = useState<string | null>(null);
  const [selectedCfZoneId, setSelectedCfZoneId] = useState('');
  const [isConfiguringDNS, setIsConfiguringDNS] = useState<string | null>(null);
  const [isCfConnected, setIsCfConnected] = useState(false);

  const performDomainSearch = async () => {
    if (!domainSearchQuery) return;
    setIsSearching(true);
    const results = await searchDomains(domainSearchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleDomainSearch = async (event: FormEvent) => {
    event.preventDefault();
    await performDomainSearch();
  };

  const handleBuyDomain = async (name: string) => {
    setIsBuying(name);
    await buyDomain(name);
    setIsBuying(null);
    setSearchResults([]);
    setDomainSearchQuery('');
  };

  const fetchCloudflareZones = async () => {
    setIsCFLoading(true);
    setCfError(null);
    try {
      setCfZones(await listCloudflareZones());
      setIsCfConnected(true);
    } catch (error: any) {
      setCfError(error.message);
      setIsCfConnected(false);
    } finally {
      setIsCFLoading(false);
    }
  };

  const handleSetupCloudflareDNS = async (domainId: string, domainName: string) => {
    if (!selectedCfZoneId) {
      notify({ message: "Veuillez sélectionner une zone Cloudflare d'abord.", tone: 'info' });
      return;
    }

    setIsConfiguringDNS(domainId);
    try {
      await setupCloudflareDns(selectedCfZoneId, domainName);
      await automateDNS(domainId, 'cloudflare');
      notify({ message: `DNS configuré avec succès pour ${domainName} !`, tone: 'success' });
    } catch (error: any) {
      notify({ message: `Erreur DNS: ${error.message}`, tone: 'error' });
    } finally {
      setIsConfiguringDNS(null);
    }
  };

  const handleAutomateDNS = async (id: string, domainName: string) => {
    if (isCfConnected && selectedCfZoneId) {
      await handleSetupCloudflareDNS(id, domainName);
      return;
    }

    setIsAutomating(id);
    await automateDNS(id, 'cloudflare');
    setIsAutomating(null);
  };

  const handleCheckDomainStatus = async (domain: Domain) => {
    if (domain.isAutomated && domain.dnsProvider === 'cloudflare' && isCfConnected && selectedCfZoneId) {
      try {
        const data = await verifyCloudflareDns(selectedCfZoneId);

        await updateDomainById(domain.id, {
          mxValid: data.mxValid,
          spfValid: data.spfValid,
          status: data.mxValid && data.spfValid ? 'active' : 'pending',
        });
        notify({ message: `Vérification Cloudflare terminée : MX=${data.mxValid}, SPF=${data.spfValid}`, tone: 'success' });
      } catch (error: any) {
        notify({ message: `Erreur de vérification: ${error.message}`, tone: 'error' });
      }
      return;
    }

    await checkDomainStatus(domain.id);
  };

  const handleImportCfZone = async () => {
    const zone = cfZones.find((candidate) => candidate.id === selectedCfZoneId);
    if (!zone) return;

    if (domains.some((domain) => domain.name === zone.name)) {
      notify({ message: 'Ce domaine est déjà importé.', tone: 'info' });
      return;
    }

    setIsCFLoading(true);
    try {
      const newDomainId = await addDomain(zone.name, true, 'cloudflare');
      if (newDomainId) {
        await handleSetupCloudflareDNS(newDomainId, zone.name);
      }
    } catch (error: any) {
      notify({ message: `Erreur d'importation: ${error.message}`, tone: 'error' });
    } finally {
      setIsCFLoading(false);
    }
  };

  return {
    cfError,
    cfZones,
    disconnectCloudflare: () => setIsCfConnected(false),
    domainSearchQuery,
    fetchCloudflareZones,
    handleAutomateDNS,
    handleBuyDomain,
    handleCheckDomainStatus,
    handleDomainSearch,
    handleImportCfZone,
    handleSetupCloudflareDNS,
    isAutomating,
    isBuying,
    isCFLoading,
    isCfConnected,
    isConfiguringDNS,
    isSearching,
    performDomainSearch,
    searchResults,
    selectedCfZoneId,
    setDomainSearchQuery,
    setSelectedCfZoneId,
  };
}
