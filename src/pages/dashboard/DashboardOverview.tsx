import { Activity as ActivityIcon, Globe, Layers, Mail, Plus, ShieldCheck } from 'lucide-react';
import { Domain } from '../../types/domain';
import { Mailbox } from '../../types/mailbox';

type DashboardOverviewProps = {
  domains: Domain[];
  mailboxes: Mailbox[];
  projects: string[];
};

export function DashboardOverview({ domains, mailboxes, projects }: DashboardOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Mailboxes</p>
          <Mail className="w-4 h-4 text-zinc-700" />
        </div>
        <p className="text-3xl font-bold">{mailboxes.length}</p>
        <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
          <Plus className="w-2 h-2" /> 12% cette semaine
        </p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Domaines Actifs</p>
          <Globe className="w-4 h-4 text-zinc-700" />
        </div>
        <p className="text-3xl font-bold text-green-500">{domains.filter((domain) => domain.status === 'active').length}</p>
        <p className="text-[10px] text-zinc-500 mt-1">Sur {domains.length} domaines total</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Projets</p>
          <Layers className="w-4 h-4 text-zinc-700" />
        </div>
        <p className="text-3xl font-bold text-orange-500">{projects.length}</p>
        <p className="text-[10px] text-zinc-500 mt-1">Organisation active</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Santé Système</p>
          <ActivityIcon className="w-4 h-4 text-zinc-700" />
        </div>
        <p className="text-3xl font-bold text-blue-500">98.2%</p>
        <p className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
          <ShieldCheck className="w-2 h-2" /> Tous les services OK
        </p>
      </div>
    </div>
  );
}
