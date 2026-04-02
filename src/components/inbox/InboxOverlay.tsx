import {
  Activity as ActivityIcon,
  ArrowLeft,
  Bot,
  Clock,
  Download,
  DownloadCloud,
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  LogIn,
  Play,
  Smartphone,
  Trash2,
  UserCheck,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../lib/utils';
import { Activity } from '../../types/activity';
import { InboxTab } from '../../types/app';
import { Mailbox } from '../../types/mailbox';
import { Message } from '../../types/message';

interface InboxOverlayProps {
  activeInboxTab: InboxTab;
  activities: Activity[];
  messages: Message[];
  msgLoading: boolean;
  selectedMailbox: Mailbox | undefined;
  selectedMailboxId: string | null;
  selectedMessage: Message | null;
  closeOverlay: () => void;
  exportActivities: () => void;
  handleSimulateAppAction: (type: Activity['type']) => Promise<void>;
  handleSimulateScenario: (type: 'signup' | 'reset' | 'notif') => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  openMessage: (message: Message) => void;
  setActiveInboxTab: (tab: InboxTab) => void;
  setSelectedMessage: (message: Message | null) => void;
  toggleAutoPilot: (id: string, current: boolean) => Promise<void>;
}

export function InboxOverlay({
  activeInboxTab,
  activities,
  messages,
  msgLoading,
  selectedMailbox,
  selectedMailboxId,
  selectedMessage,
  closeOverlay,
  exportActivities,
  handleSimulateAppAction,
  handleSimulateScenario,
  markAsRead,
  openMessage,
  setActiveInboxTab,
  setSelectedMessage,
  toggleAutoPilot,
}: InboxOverlayProps) {
  if (!selectedMailboxId) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#0f0f0f] border-l border-zinc-800 z-[60] shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={closeOverlay} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-lg leading-tight">{selectedMailbox?.label}</h3>
              <p className="text-xs text-zinc-500 font-mono">{selectedMailbox?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateScenario('signup')}
              className="p-2 hover:bg-orange-500/10 text-zinc-500 hover:text-orange-500 rounded-lg transition-colors"
              title="Simuler Inscription"
            >
              <UserCheck className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSimulateScenario('reset')}
              className="p-2 hover:bg-orange-500/10 text-zinc-500 hover:text-orange-500 rounded-lg transition-colors"
              title="Simuler Reset Password"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-zinc-800 px-6">
          <button
            onClick={() => setActiveInboxTab('messages')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors border-b-2',
              activeInboxTab === 'messages' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveInboxTab('simulation')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors border-b-2',
              activeInboxTab === 'simulation' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300',
            )}
          >
            Simulation App
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {activeInboxTab === 'messages' ? (
            <>
              {msgLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800/50" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="w-8 h-8 text-zinc-700" />}
                  title="Aucun message reçu pour le moment."
                  description=""
                  action={
                    <Button onClick={() => handleSimulateScenario('signup')} variant="ghost" className="text-orange-500 hover:text-orange-400">
                      Simuler une inscription utilisateur
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        openMessage(msg);
                        if (!msg.isRead) {
                          void markAsRead(msg.id);
                        }
                      }}
                      className={cn(
                        'p-4 rounded-2xl border transition-all cursor-pointer group/msg',
                        selectedMessage?.id === msg.id ? 'bg-orange-500/5 border-orange-500/30' : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700',
                        !msg.isRead && 'border-l-4 border-l-orange-500',
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-zinc-400 truncate max-w-[200px]">{msg.from}</span>
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {msg.receivedAt?.seconds ? format(new Date(msg.receivedAt.seconds * 1000), 'HH:mm') : '...'}
                        </span>
                      </div>
                      <h4 className={cn('text-sm font-semibold mb-2 line-clamp-1', !msg.isRead ? 'text-white' : 'text-zinc-400')}>{msg.subject}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{msg.body}</p>

                      {msg.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md text-[10px] font-bold hover:bg-orange-500/20 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Action Utilisateur
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Simulation Mobile</h4>
                      <p className="text-xs text-zinc-500">{selectedMailbox?.packageName || 'Aucun package configuré'}</p>
                    </div>
                  </div>
                  <Badge
                    className={cn('rounded-full border px-3', selectedMailbox?.appStatus === 'installing' && 'animate-pulse')}
                    variant={
                      selectedMailbox?.appStatus === 'active'
                        ? 'success'
                        : selectedMailbox?.appStatus === 'installed'
                          ? 'info'
                          : selectedMailbox?.appStatus === 'installing'
                            ? 'accent'
                            : 'neutral'
                    }
                  >
                    {selectedMailbox?.appStatus || 'idle'}
                  </Badge>
                </div>

                {selectedMailbox?.playStoreUrl && (
                  <a
                    href={selectedMailbox.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-zinc-500 group-hover:text-orange-500" />
                      <span className="text-xs text-zinc-400">Voir sur le Play Store</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-600" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSimulateAppAction('install')}
                    disabled={selectedMailbox?.appStatus !== 'idle'}
                    className="w-full"
                    variant="secondary"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    Installer
                  </Button>
                  <Button
                    onClick={() => handleSimulateAppAction('login')}
                    disabled={selectedMailbox?.appStatus === 'idle' || selectedMailbox?.appStatus === 'installing'}
                    className="w-full"
                    variant="secondary"
                    size="sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Button>
                </div>

                <Button
                  onClick={() => handleSimulateAppAction('action')}
                  disabled={selectedMailbox?.appStatus !== 'active'}
                  className="w-full"
                  size="sm"
                >
                  <ActivityIcon className="w-4 h-4" />
                  Réaliser une action in-app
                </Button>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className={cn('w-4 h-4', selectedMailbox?.isAutoPilotEnabled ? 'text-orange-500' : 'text-zinc-600')} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Mode Auto-Pilote</p>
                      <p className="text-[10px] text-zinc-500">Actions périodiques automatiques</p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectedMailbox && toggleAutoPilot(selectedMailbox.id, !!selectedMailbox.isAutoPilotEnabled)}
                    className={cn(
                      'relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                      selectedMailbox?.isAutoPilotEnabled ? 'bg-orange-500' : 'bg-zinc-800',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                        selectedMailbox?.isAutoPilotEnabled ? 'translate-x-5' : 'translate-x-1',
                      )}
                    />
                  </button>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Journal d'activité
                  </h4>
                  <button
                    onClick={exportActivities}
                    disabled={activities.length === 0}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadCloud className="w-3 h-3" />
                    Exporter CSV
                  </button>
                </div>
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <EmptyState
                      className="py-8"
                      icon={<Clock className="w-5 h-5 text-zinc-600" />}
                      title="Aucune activité enregistrée."
                      description=""
                    />
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center border shrink-0',
                              activity.type === 'install'
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                : activity.type === 'login'
                                  ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                  : activity.type === 'action'
                                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-500',
                            )}
                          >
                            {activity.type === 'install' ? (
                              <Download className="w-4 h-4" />
                            ) : activity.type === 'login' ? (
                              <LogIn className="w-4 h-4" />
                            ) : activity.type === 'action' ? (
                              <ActivityIcon className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </div>
                          <div className="w-px flex-1 bg-zinc-800 my-1 group-last:hidden" />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="text-sm font-bold capitalize">{activity.type}</h5>
                            <span className="text-[10px] text-zinc-600">
                              {activity.timestamp?.seconds ? format(new Date(activity.timestamp.seconds * 1000), 'HH:mm:ss') : '...'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {activity.actionName ? <span className="font-bold text-zinc-400">{activity.actionName}: </span> : ''}
                            {activity.details}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedMessage && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="absolute inset-0 bg-[#0f0f0f] z-20 flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
              <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{selectedMessage.subject}</h3>
                <p className="text-xs text-zinc-500">De: {selectedMessage.from}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Reçu le {selectedMessage.receivedAt?.seconds ? format(new Date(selectedMessage.receivedAt.seconds * 1000), 'dd MMMM yyyy à HH:mm') : '...'}</span>
                  {selectedMessage.isRead ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 leading-relaxed text-zinc-300 whitespace-pre-wrap">{selectedMessage.body}</div>
              </div>

              {selectedMessage.links.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Actions Automatiques Détectées
                  </h4>
                  <div className="grid gap-3">
                    {selectedMessage.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-500">Agir en tant qu'utilisateur</p>
                            <p className="text-[10px] text-zinc-500 truncate max-w-[250px]">{link}</p>
                          </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-zinc-700 group-hover:text-orange-500 transition-colors rotate-180" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
