import { CheckCircle2, Copy, ExternalLink, Inbox, Mail, Power, PowerOff, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Domain } from '../../types/domain';
import { Mailbox } from '../../types/mailbox';

type DashboardMailboxGridProps = {
  copiedId: string | null;
  domains: Domain[];
  filteredMailboxes: Mailbox[];
  mailLoading: boolean;
  removeMailbox: (id: string) => Promise<void>;
  setIsModalOpen: (open: boolean) => void;
  setSelectedInboxMailbox: (mailboxId: string) => void;
  setSelectedSimulationMailbox: (mailboxId: string) => void;
  toggleStatus: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;
  copyToClipboard: (text: string, id: string) => void;
};

export function DashboardMailboxGrid({
  copiedId,
  domains,
  filteredMailboxes,
  mailLoading,
  removeMailbox,
  setIsModalOpen,
  setSelectedInboxMailbox,
  setSelectedSimulationMailbox,
  toggleStatus,
  copyToClipboard,
}: DashboardMailboxGridProps) {
  if (mailLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
        ))}
      </div>
    );
  }

  if (filteredMailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
          <Mail className="w-10 h-10 text-zinc-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Aucune adresse trouvée</h3>
          <p className="text-zinc-500 text-sm max-w-xs">Commencez par créer votre première adresse mail de test pour vos développements.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="text-orange-500 font-medium hover:underline">
          Créer une adresse maintenant
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {filteredMailboxes.map((mailbox) => {
          const hasActiveDomain =
            domains.some((domain) => mailbox.address.endsWith(`@${domain.name}`) && domain.status === 'active') ||
            mailbox.address.includes('tech-solutions.pro') ||
            mailbox.address.includes('global-corp.net');

          return (
            <motion.div
              key={mailbox.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-[#0f0f0f] border border-zinc-800/50 rounded-2xl p-5 hover:border-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', mailbox.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-600')} />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{mailbox.project || 'Sans projet'}</span>
                  </div>
                  <h3 className="font-bold text-lg">{mailbox.label}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleStatus(mailbox.id, mailbox.status)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                    title={mailbox.status === 'active' ? 'Désactiver' : 'Activer'}
                  >
                    {mailbox.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeMailbox(mailbox.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-zinc-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex items-center justify-between group/addr">
                <div className="flex items-center gap-2 min-w-0">
                  <code className="text-sm text-orange-500 font-mono truncate">{mailbox.address}</code>
                  <div className="group/mx relative shrink-0">
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        hasActiveDomain ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-yellow-500/50',
                      )}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover/mx:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700 z-50">
                      {hasActiveDomain ? 'MX Configuré (Réel)' : 'Simulation DNS'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedInboxMailbox(mailbox.id)}
                    className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-orange-500 transition-colors shrink-0"
                    title="Voir les messages"
                  >
                    <Inbox className="w-4 h-4" />
                  </button>
                  {mailbox.playStoreUrl && (
                    <button
                      onClick={() => setSelectedSimulationMailbox(mailbox.id)}
                      className={cn(
                        'p-1.5 hover:bg-zinc-800 rounded-md transition-colors shrink-0',
                        mailbox.appStatus === 'active'
                          ? 'text-green-500'
                          : mailbox.appStatus === 'installed'
                            ? 'text-blue-500'
                            : mailbox.appStatus === 'installing'
                              ? 'text-orange-500 animate-pulse'
                              : 'text-zinc-500 hover:text-orange-500',
                      )}
                      title={`App Status: ${mailbox.appStatus || 'idle'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  )}
                  {mailbox.targetUrl && (
                    <a
                      href={mailbox.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-orange-500 transition-colors shrink-0"
                      title="Lancer l'application"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => copyToClipboard(mailbox.address, mailbox.id)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors shrink-0">
                    {copiedId === mailbox.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mailbox.notes && <p className="mt-3 text-xs text-zinc-500 italic line-clamp-2">"{mailbox.notes}"</p>}

              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                <span>Créé le {mailbox.createdAt?.seconds ? format(new Date(mailbox.createdAt.seconds * 1000), 'dd/MM/yyyy') : '...'}</span>
                <div className="flex items-center gap-1">
                  <Inbox className="w-3 h-3" />
                  <span>0 messages</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
