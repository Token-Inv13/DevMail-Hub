import { format } from 'date-fns';
import { Activity as ActivityIcon, ExternalLink, PowerOff, Smartphone, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Activity } from '../../types/activity';

type DashboardActivityFeedProps = {
  activities: Activity[];
  setSelectedInboxMailbox: (mailboxId: string) => void;
};

export function DashboardActivityFeed({ activities, setSelectedInboxMailbox }: DashboardActivityFeedProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-orange-500" />
          Flux d'activité global
        </h3>
        <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Voir tout l'historique</button>
      </div>
      <div className="bg-[#0f0f0f] border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-zinc-900/50 transition-colors group">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-800 shrink-0',
                  activity.type === 'install'
                    ? 'bg-blue-500/10 text-blue-400'
                    : activity.type === 'login'
                      ? 'bg-green-500/10 text-green-400'
                      : activity.type === 'action'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-red-500/10 text-red-400',
                )}
              >
                {activity.type === 'install' ? (
                  <Smartphone className="w-5 h-5" />
                ) : activity.type === 'login' ? (
                  <UserCheck className="w-5 h-5" />
                ) : activity.type === 'action' ? (
                  <ActivityIcon className="w-5 h-5" />
                ) : (
                  <PowerOff className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">{activity.actionName || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</p>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {activity.timestamp?.seconds ? format(new Date(activity.timestamp.seconds * 1000), 'HH:mm') : '...'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate">{activity.details || `Action effectuée sur la mailbox ${activity.mailboxId.slice(0, 8)}...`}</p>
              </div>
              <button onClick={() => setSelectedInboxMailbox(activity.mailboxId)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 rounded-lg text-zinc-500">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
