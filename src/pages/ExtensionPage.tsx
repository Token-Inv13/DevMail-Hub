import { Mail, Settings, Copy } from 'lucide-react';
import { Mailbox } from '../types/mailbox';

interface ExtensionPageProps {
  mailboxes: Mailbox[];
}

export function ExtensionPage({ mailboxes }: ExtensionPageProps) {
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Browser Extension Preview</h2>
        <p className="text-zinc-400 text-lg">
          Imaginez pouvoir générer des adresses directement depuis vos formulaires. Voici à quoi ressemblerait notre extension Chrome.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Comment ça marche ?</h3>
            <ul className="space-y-3 text-zinc-500 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center text-orange-500 shrink-0 mt-0.5">1</div>
                <span>Cliquez sur l'icône DevMail Hub dans votre barre d'outils.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center text-orange-500 shrink-0 mt-0.5">2</div>
                <span>Choisissez un label ou un projet pour votre nouvelle adresse.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center text-orange-500 shrink-0 mt-0.5">3</div>
                <span>L'adresse est automatiquement copiée ou insérée dans le champ mail.</span>
              </li>
            </ul>
          </div>
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all border border-zinc-700">
            Télécharger le Manifest (Demo)
          </button>
        </div>

        <div className="flex justify-center">
          <div className="w-[320px] bg-[#1a1a1a] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">DevMail Hub</span>
              </div>
              <Settings className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Label Rapide</label>
                <input type="text" placeholder="ex: Test Login" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs focus:outline-none" />
              </div>
              <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all">
                Générer & Copier
              </button>
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Récents</label>
                {mailboxes.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <span className="text-[10px] truncate max-w-[180px] text-zinc-400">{m.address}</span>
                    <Copy className="w-3 h-3 text-zinc-600" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/50 p-3 text-center">
              <button className="text-[10px] text-orange-500 font-medium hover:underline">Ouvrir le Dashboard complet</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
