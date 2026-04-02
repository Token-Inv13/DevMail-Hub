import { ShieldCheck } from 'lucide-react';
import { DashboardActivityFeed } from './DashboardActivityFeed';
import { DashboardHeader } from './DashboardHeader';
import { DashboardMailboxGrid } from './DashboardMailboxGrid';
import { DashboardMessageChart } from './DashboardMessageChart';
import { DashboardOverview } from './DashboardOverview';
import { DashboardPageProps } from './types';

export function DashboardPage({
  copiedId,
  domains,
  filteredMailboxes,
  globalActivities,
  mailError,
  mailLoading,
  mailboxes,
  search,
  selectedMailboxId,
  selectedProject,
  setIsModalOpen,
  setSearch,
  setSelectedInboxMailbox,
  setSelectedSimulationMailbox,
  toggleStatus,
  removeMailbox,
  copyToClipboard,
}: DashboardPageProps) {
  const projects = Array.from(new Set(mailboxes.map((m) => m.project).filter(Boolean)));

  return (
    <>
      <DashboardHeader
        filteredCount={filteredMailboxes.length}
        search={search}
        selectedProject={selectedProject}
        setIsModalOpen={setIsModalOpen}
        setSearch={setSearch}
      />

      <div className="p-6">
        {!selectedProject && !selectedMailboxId && (
          <>
            <DashboardOverview domains={domains} mailboxes={mailboxes} projects={projects} />
            <DashboardMessageChart />
          </>
        )}

        {mailError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>Erreur de synchronisation : {mailError}. Si c'est un problème d'index, veuillez patienter quelques minutes.</p>
          </div>
        )}

        <>
          <DashboardMailboxGrid
            copiedId={copiedId}
            domains={domains}
            filteredMailboxes={filteredMailboxes}
            mailLoading={mailLoading}
            removeMailbox={removeMailbox}
            setIsModalOpen={setIsModalOpen}
            setSelectedInboxMailbox={setSelectedInboxMailbox}
            setSelectedSimulationMailbox={setSelectedSimulationMailbox}
            toggleStatus={toggleStatus}
            copyToClipboard={copyToClipboard}
          />

          {!selectedProject && !selectedMailboxId && (
            <DashboardActivityFeed activities={globalActivities} setSelectedInboxMailbox={setSelectedInboxMailbox} />
          )}
        </>
      </div>
    </>
  );
}
