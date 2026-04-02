import { ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  Activity as ActivityIcon,
  Code,
  DownloadCloud,
  Filter,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Play,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppTab } from '../../types/app';
import { Mailbox } from '../../types/mailbox';

interface AppSidebarProps {
  activeTab: AppTab;
  mailboxes: Mailbox[];
  selectedProject: string | null;
  setActiveTab: (tab: AppTab) => void;
  setSelectedProject: (project: string | null) => void;
  handleLogout: () => void;
  user: User;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'extension', label: 'Browser Extension', icon: <Code className="w-5 h-5" /> },
  { id: 'infrastructure', label: 'Infrastructure', icon: <DownloadCloud className="w-5 h-5" /> },
  { id: 'simulation', label: 'Live Simulation', icon: <Play className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings & API', icon: <Settings className="w-5 h-5" /> },
];

export function AppSidebar({
  activeTab,
  mailboxes,
  selectedProject,
  setActiveTab,
  setSelectedProject,
  handleLogout,
  user,
}: AppSidebarProps) {
  const projects = Array.from(new Set(mailboxes.map((m) => m.project).filter(Boolean)));

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#0f0f0f] border-r border-zinc-800/50 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">DevMail Hub</span>
      </div>

      <div className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30',
              )}
            >
              {item.icon}
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:block space-y-4">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Projets</span>
            <Filter className="w-3 h-3 text-zinc-600" />
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedProject(null)}
              className={cn(
                'w-full flex items-center justify-between p-2 px-3 rounded-lg text-sm transition-colors',
                !selectedProject ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300',
              )}
            >
              <span>Tous les projets</span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{mailboxes.length}</span>
            </button>
            {projects.map((project) => (
              <button
                key={project}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  'w-full flex items-center justify-between p-2 px-3 rounded-lg text-sm transition-colors',
                  selectedProject === project ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300',
                )}
              >
                <span className="truncate">{project}</span>
                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                  {mailboxes.filter((m) => m.project === project).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 p-2">
          <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-zinc-700" />
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
