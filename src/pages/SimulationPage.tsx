import { Activity as ActivityIcon, Bot, Clock, Play, Share2, Smartphone, UserCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';
import { Mailbox } from '../types/mailbox';

interface SimulationPageProps {
  mailboxes: Mailbox[];
  onOpenMailbox: (mailboxId: string) => void;
  onOpenCreateModal: () => void;
  onSimulateSignup: () => Promise<void>;
}

export function SimulationPage({
  mailboxes,
  onOpenMailbox,
  onOpenCreateModal,
  onSimulateSignup,
}: SimulationPageProps) {
  const simulatedApps = mailboxes.filter((m) => m.packageName);

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">Live App Simulation</h2>
          <p className="text-zinc-400 text-lg">Visualisez l'état de vos applications et simulez des flux utilisateurs complexes.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-2 rounded-xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Système Actif
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="text-xs text-zinc-500 px-2">
            <span className="text-white font-bold">{mailboxes.filter((m) => m.appStatus === 'active').length}</span> Apps Actives
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simulatedApps.map((m) => (
              <motion.div
                key={m.id}
                layoutId={m.id}
                className="group"
              >
                <Card className="p-6 space-y-4 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black rounded-xl border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Smartphone className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">{m.label}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono">{m.packageName}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.appStatus === 'active'
                          ? 'success'
                          : m.appStatus === 'installing'
                            ? 'info'
                            : m.appStatus === 'installed'
                              ? 'accent'
                              : 'neutral'
                      }
                    >
                      {m.appStatus || 'idle'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Progression du test</span>
                      <span className="text-orange-500 font-bold">75%</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button onClick={() => onOpenMailbox(m.id)} variant="secondary" size="sm" className="flex-1">
                      Détails Logs
                    </Button>
                    <Button onClick={onSimulateSignup} variant="accent" size="sm" className="px-3">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {simulatedApps.length === 0 && (
              <EmptyState
                className="col-span-2"
                icon={<Smartphone className="w-8 h-8 text-zinc-600" />}
                title="Aucune application en simulation"
                description="Créez une adresse avec un Package Name pour commencer."
                action={
                  <Button onClick={onOpenCreateModal} variant="ghost" className="text-orange-500 hover:text-orange-400">
                    Créer ma première simulation
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Scénarios de Test
            </h3>
            <div className="space-y-3">
              {[
                { id: 'signup', name: 'Inscription Complète', desc: "Simule l'installation, l'ouverture et l'inscription.", icon: UserCheck },
                { id: 'reset', name: 'Password Reset', desc: 'Simule la demande de reset et le clic sur le lien.', icon: Clock },
                { id: 'purchase', name: 'In-App Purchase', desc: "Simule un achat et la réception du reçu.", icon: Share2 },
              ].map((s) => (
                <button key={s.id} className="w-full text-left p-4 bg-black border border-zinc-800 rounded-xl hover:border-orange-500/50 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500 group-hover:text-orange-500 transition-colors">
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{s.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <Bot className="w-4 h-4" />
              IA Auto-Pilot
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              L'Auto-Pilot peut détecter automatiquement les liens de confirmation et les valider sans intervention humaine.
            </p>
            <Button className="w-full text-blue-400 hover:bg-blue-500/30" variant="ghost" size="sm">
              Activer Globalement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
