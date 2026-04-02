import { ChangeEvent, FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Domain } from '../../types/domain';

interface CreateMailboxModalProps {
  autoCreateSubdomain: boolean;
  domains: Domain[];
  isCfConnected: boolean;
  isOpen: boolean;
  newCount: number;
  newDomain: string;
  newLabel: string;
  newNotes: string;
  newPackageName: string;
  newPlayStoreUrl: string;
  newProject: string;
  newTargetUrl: string;
  newWebhookUrl: string;
  onAutoCreateSubdomainChange: (checked: boolean) => void;
  onClose: () => void;
  onCountChange: (value: number) => void;
  onDomainChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPackageNameChange: (value: string) => void;
  onPlayStoreUrlChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onTargetUrlChange: (value: string) => void;
  onWebhookUrlChange: (value: string) => void;
  selectedCfZoneId: string;
}

export function CreateMailboxModal({
  autoCreateSubdomain,
  domains,
  isCfConnected,
  isOpen,
  newCount,
  newDomain,
  newLabel,
  newNotes,
  newPackageName,
  newPlayStoreUrl,
  newProject,
  newTargetUrl,
  newWebhookUrl,
  onAutoCreateSubdomainChange,
  onClose,
  onCountChange,
  onDomainChange,
  onLabelChange,
  onNotesChange,
  onPackageNameChange,
  onPlayStoreUrlChange,
  onProjectChange,
  onSubmit,
  onTargetUrlChange,
  onWebhookUrlChange,
  selectedCfZoneId,
}: CreateMailboxModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card className="bg-[#0f0f0f] p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Nouvelle adresse mail</h2>
              <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Nom / Label</label>
                <input
                  required
                  type="text"
                  placeholder="ex: Inscription Client Test"
                  value={newLabel}
                  onChange={(e) => onLabelChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Projet (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: Projet SaaS X"
                  value={newProject}
                  onChange={(e) => onProjectChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Notes de test (Optionnel)</label>
                <textarea
                  placeholder="ex: Test du scénario de récupération de mot de passe..."
                  value={newNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">URL Cible (Auto-Launch)</label>
                  <input
                    type="url"
                    placeholder="https://votre-app.com/login"
                    value={newTargetUrl}
                    onChange={(e) => onTargetUrlChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Webhook URL (Callback)</label>
                  <input
                    type="url"
                    placeholder="https://votre-api.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => onWebhookUrlChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">URL Play Store (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    value={newPlayStoreUrl}
                    onChange={(e) => onPlayStoreUrlChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Package Name (Android)</label>
                  <input
                    type="text"
                    placeholder="com.votreapp.android"
                    value={newPackageName}
                    onChange={(e) => onPackageNameChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nombre d'adresses</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCount}
                    onChange={(e) => onCountChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Domaine de l'adresse</label>
                  <div className="relative">
                    <select
                      required
                      value={newDomain}
                      onChange={(e) => onDomainChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Sélectionner un domaine --
                      </option>
                      {domains.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} {d.status === 'active' ? '✓' : '⚠'}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none rotate-90" />
                  </div>
                  {domains.length === 0 ? (
                    <p className="text-[10px] text-red-500 mt-1">Aucun domaine configuré. Allez dans l'onglet Infrastructure pour connecter Cloudflare.</p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">{domains.length} domaine(s) disponible(s).</p>
                  )}
                </div>
              </div>

              {isCfConnected && selectedCfZoneId && domains.some((d) => d.name === newDomain) && (
                <div className="flex items-center gap-2 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                  <input
                    type="checkbox"
                    id="autoSubdomain"
                    checked={autoCreateSubdomain}
                    onChange={(e) => onAutoCreateSubdomainChange(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <label htmlFor="autoSubdomain" className="text-xs font-medium text-zinc-400 cursor-pointer flex items-center gap-2">
                    <Zap className="w-3 h-3 text-orange-500" />
                    Créer automatiquement un sous-domaine Cloudflare
                  </label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={onClose} className="flex-1" variant="secondary" size="lg">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" size="lg">
                  Générer
                </Button>
              </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
