import { FormEvent } from 'react';
import {
  Bot,
  CheckCircle2,
  Copy,
  DownloadCloud,
  Loader2,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';
import { Domain } from '../types/domain';

interface SearchResult {
  name: string;
  price: string;
  available: boolean;
}

interface CloudflareZone {
  id: string;
  name: string;
}

interface InfrastructurePageProps {
  domains: Domain[];
  domainsLoading: boolean;
  domainSearchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  isBuying: string | null;
  isAutomating: string | null;
  isConfiguringDNS: string | null;
  isCFLoading: boolean;
  isCfConnected: boolean;
  cfZones: CloudflareZone[];
  cfError: string | null;
  selectedCfZoneId: string;
  onDomainSearchSubmit: (e: FormEvent) => Promise<void>;
  onDomainSearch: () => Promise<void>;
  onDomainSearchQueryChange: (value: string) => void;
  onBuyDomain: (name: string) => Promise<void>;
  onAutomateDNS: (id: string, domainName: string) => Promise<void>;
  onCheckDomainStatus: (domain: Domain) => Promise<void>;
  onDeleteDomain: (id: string) => Promise<void>;
  onFetchCloudflareZones: () => Promise<void>;
  onImportCfZone: () => Promise<void>;
  onSelectedCfZoneIdChange: (value: string) => void;
  onDisconnectCloudflare: () => void;
}

export function InfrastructurePage({
  domains,
  domainsLoading,
  domainSearchQuery,
  searchResults,
  isSearching,
  isBuying,
  isAutomating,
  isConfiguringDNS,
  isCFLoading,
  isCfConnected,
  cfZones,
  cfError,
  selectedCfZoneId,
  onDomainSearchSubmit,
  onDomainSearch,
  onDomainSearchQueryChange,
  onBuyDomain,
  onAutomateDNS,
  onCheckDomainStatus,
  onDeleteDomain,
  onFetchCloudflareZones,
  onImportCfZone,
  onSelectedCfZoneIdChange,
  onDisconnectCloudflare,
}: InfrastructurePageProps) {
  return (
    <div className="p-12 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">Infrastructure DNS</h2>
          <p className="text-zinc-400 text-lg">Gérez vos domaines réels et assurez-vous qu'ils passent les tests MX/SPF.</p>
        </div>
        <div className="flex gap-4">
          <form onSubmit={onDomainSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher un domaine..."
              value={domainSearchQuery}
              onChange={(e) => onDomainSearchQueryChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all w-64"
            />
          </form>
          <Button
            onClick={onDomainSearch}
            disabled={isSearching}
            size="lg"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Acheter un domaine "Fresh"
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Résultats de recherche</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((res) => (
              <div key={res.name} className="bg-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold">{res.name}</div>
                  <div className="text-xs text-zinc-500">{res.price}€ / an</div>
                </div>
                <Button
                  onClick={() => onBuyDomain(res.name)}
                  disabled={!res.available || !!isBuying}
                  size="sm"
                  variant={res.available ? 'primary' : 'secondary'}
                >
                  {isBuying === res.name ? <Loader2 className="w-4 h-4 animate-spin" /> : res.available ? 'Acheter' : 'Indisponible'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Domaine</th>
                  <th className="px-6 py-4">Status MX</th>
                  <th className="px-6 py-4">Reputation</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {domains.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{d.name}</span>
                        {d.isAutomated && (
                          <span className="text-[9px] text-orange-500 font-bold uppercase flex items-center gap-1">
                            <Zap className="w-2 h-2" />
                            Automatisé via {d.dnsProvider}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', d.status === 'active' ? 'bg-green-500' : 'bg-red-500')} />
                        <span className={d.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                          {d.status === 'active' ? 'Configuré' : d.status === 'pending' ? 'En attente' : 'Erreur'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={d.reputation === 'High' ? 'success' : d.reputation === 'Medium' ? 'warning' : 'neutral'}>
                        {d.reputation}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!d.isAutomated && (
                          <Button
                            onClick={() => onAutomateDNS(d.id, d.name)}
                            disabled={!!isAutomating || !!isConfiguringDNS}
                            variant="accent"
                            size="sm"
                          >
                            {isAutomating === d.id || isConfiguringDNS === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            Automatiser
                          </Button>
                        )}
                        <Button onClick={() => onCheckDomainStatus(d)} variant="ghost" className="p-0 text-orange-500 hover:bg-transparent hover:text-orange-400">
                          Vérifier
                        </Button>
                        <Button onClick={() => onDeleteDomain(d.id)} variant="ghost" className="p-1 text-red-500/50 hover:bg-transparent hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {domains.length === 0 && !domainsLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <EmptyState
                        className="py-10"
                        icon={<Search className="w-6 h-6 text-zinc-600" />}
                        title="Aucun domaine réel configuré."
                        description="Recherchez un domaine pour commencer."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-4">
            <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Pourquoi le MX est-il crucial ?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Les plateformes comme Google ou Facebook vérifient l'existence d'un serveur mail via le DNS. Si votre domaine n'a pas d'enregistrement MX, l'adresse est considérée comme "morte" ou frauduleuse.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0f0f0f] p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-500" />
              Automatisation DNS (Wildcard)
            </h3>
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Bot className="w-4 h-4" />
                CONSEIL D'EXPERT
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Pour éviter de configurer le DNS pour chaque adresse, utilisez un <span className="text-white font-bold">Wildcard MX (*)</span>. Cela permet à votre domaine de recevoir des mails pour <span className="italic">n'importe quel</span> préfixe (ex: anything@votre-domaine.com) avec une seule configuration.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Type: MX (Wildcard)</label>
                <div className="bg-black p-3 rounded-xl border border-zinc-800 font-mono text-[10px] text-orange-500 flex justify-between items-center">
                  <span>* (ou @) {'->'} mx.devmail.hub</span>
                  <Copy className="w-3 h-3 text-zinc-700" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              {!isCfConnected ? (
                <Button
                  onClick={onFetchCloudflareZones}
                  disabled={isCFLoading}
                  className="w-full"
                  variant="secondary"
                  size="lg"
                >
                  {isCFLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  Connecter Cloudflare API
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connecté
                    </Badge>
                    <Button onClick={onDisconnectCloudflare} variant="ghost" size="sm" className="p-0 text-zinc-500 hover:bg-transparent hover:text-zinc-300">
                      Déconnecter
                    </Button>
                  </div>
                  <select
                    value={selectedCfZoneId}
                    onChange={(e) => onSelectedCfZoneIdChange(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-2 text-xs text-zinc-300 focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="">-- Sélectionner une Zone --</option>
                    {cfZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  {selectedCfZoneId && !domains.some((d) => d.name === cfZones.find((z) => z.id === selectedCfZoneId)?.name) && (
                    <Button
                      onClick={onImportCfZone}
                      disabled={isCFLoading}
                      className="w-full"
                      size="sm"
                    >
                      {isCFLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <DownloadCloud className="w-3 h-3" />}
                      Importer & Configurer ce domaine
                    </Button>
                  )}
                  {cfError && <p className="text-[10px] text-red-500">{cfError}</p>}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-sm">Achat Automatisé</h3>
            <p className="text-xs text-zinc-500">Bientôt : Achetez des domaines .com ou .net directement ici. Ils seront pré-configurés et prêts à l'emploi en 60 secondes.</p>
            <div className="flex items-center gap-2 text-[10px] text-orange-500 font-bold">
              <Zap className="w-3 h-3" />
              INTÉGRATION CLOUDFLARE API
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
