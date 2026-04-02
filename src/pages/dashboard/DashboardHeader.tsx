import { Plus, Search } from 'lucide-react';

type DashboardHeaderProps = {
  filteredCount: number;
  search: string;
  selectedProject: string | null;
  setIsModalOpen: (open: boolean) => void;
  setSearch: (value: string) => void;
};

export function DashboardHeader({
  filteredCount,
  search,
  selectedProject,
  setIsModalOpen,
  setSearch,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md border-bottom border-zinc-800/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40">
      <div>
        <h2 className="text-2xl font-bold">{selectedProject ? `Projet: ${selectedProject}` : 'Tableau de bord'}</h2>
        <p className="text-zinc-500 text-sm">Gérez vos {filteredCount} adresses de test</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all w-full md:w-64"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle adresse</span>
        </button>
      </div>
    </header>
  );
}
