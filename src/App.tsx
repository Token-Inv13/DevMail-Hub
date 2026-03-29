/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useMailboxes, Mailbox } from './hooks/useMailboxes';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Power, 
  PowerOff, 
  LayoutDashboard, 
  LogOut, 
  Search,
  Filter,
  Copy,
  CheckCircle2,
  Inbox,
  Settings,
  ShieldCheck,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { mailboxes, loading: mailLoading, error: mailError, createMailbox, toggleStatus, removeMailbox } = useMailboxes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newProject, setNewProject] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<'curl' | 'javascript' | 'python'>('javascript');

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMailbox(newLabel, newProject);
    setNewLabel('');
    setNewProject('');
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMailboxes = mailboxes.filter(m => 
    m.address.toLowerCase().includes(search.toLowerCase()) ||
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.project.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">DevMail Hub</h1>
            <p className="text-zinc-400">Gérez vos adresses mail de test en un seul endroit. Simplifiez vos workflows QA et Dev.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <ShieldCheck className="w-5 h-5" />
            Se connecter avec Google
          </button>
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/50">
            <div className="space-y-1">
              <div className="text-orange-500 font-bold">∞</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Adresses</div>
            </div>
            <div className="space-y-1">
              <div className="text-orange-500 font-bold">100%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Gratuit</div>
            </div>
            <div className="space-y-1">
              <div className="text-orange-500 font-bold">API</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Ready</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const apiSnippets = {
    curl: `curl -X POST https://api.devmail.hub/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"to": "test-abc12345@devmail.hub", "subject": "Test", "body": "Hello World"}'`,
    javascript: `const response = await fetch('https://api.devmail.hub/v1/messages', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    to: 'test-abc12345@devmail.hub',
    subject: 'Test',
    body: 'Hello World'
  })
});`,
    python: `import requests
response = requests.post(
    'https://api.devmail.hub/v1/messages',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'to': 'test-abc12345@devmail.hub', 'subject': 'Test', 'body': 'Hello World'}
)`
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Sidebar / Nav */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#0f0f0f] border-r border-zinc-800/50 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">DevMail Hub</span>
        </div>

        <div className="flex-1 px-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 p-3 bg-orange-500/10 text-orange-500 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:block">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 rounded-xl font-medium transition-colors">
            <Inbox className="w-5 h-5" />
            <span className="hidden md:block">Messages</span>
          </button>
          <button 
            onClick={() => setIsApiModalOpen(true)}
            className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 rounded-xl font-medium transition-colors"
          >
            <Code className="w-5 h-5" />
            <span className="hidden md:block">API Docs</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            <span className="hidden md:block">Settings</span>
          </button>
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

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <header className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md border-bottom border-zinc-800/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40">
          <div>
            <h2 className="text-2xl font-bold">Tableau de bord</h2>
            <p className="text-zinc-500 text-sm">Gérez vos {mailboxes.length} adresses de test</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

        <div className="p-6">
          {mailError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>Erreur de synchronisation : {mailError}. Si c'est un problème d'index, veuillez patienter quelques minutes.</p>
            </div>
          )}
          {mailLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
              ))}
            </div>
          ) : filteredMailboxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                <Mail className="w-10 h-10 text-zinc-700" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Aucune adresse trouvée</h3>
                <p className="text-zinc-500 text-sm max-w-xs">Commencez par créer votre première adresse mail de test pour vos développements.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-orange-500 font-medium hover:underline"
              >
                Créer une adresse maintenant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMailboxes.map((mailbox) => (
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
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            mailbox.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600"
                          )} />
                          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            {mailbox.project || 'Sans projet'}
                          </span>
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
                      <code className="text-sm text-orange-500 font-mono truncate mr-2">
                        {mailbox.address}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(mailbox.address, mailbox.id)}
                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors shrink-0"
                      >
                        {copiedId === mailbox.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                      <span>Créé le {mailbox.createdAt?.seconds ? format(new Date(mailbox.createdAt.seconds * 1000), 'dd/MM/yyyy') : '...'}</span>
                      <div className="flex items-center gap-1">
                        <Inbox className="w-3 h-3" />
                        <span>0 messages</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-zinc-800 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Nouvelle adresse mail</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Nom / Label</label>
                  <input 
                    required
                    type="text" 
                    placeholder="ex: Inscription Client Test" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Projet (Optionnel)</label>
                  <input 
                    type="text" 
                    placeholder="ex: Projet SaaS X" 
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Générer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* API Modal */}
      <AnimatePresence>
        {isApiModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApiModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f0f0f] border border-zinc-800 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">API Documentation</h2>
                <button 
                  onClick={() => setIsApiModalOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <p className="text-zinc-400 mb-6">
                Utilisez notre API pour automatiser vos tests et envoyer des emails directement à vos adresses de test.
              </p>

              <div className="flex gap-2 mb-4 border-b border-zinc-800">
                {Object.keys(apiSnippets).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveSnippet(lang as any)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                      activeSnippet === lang 
                        ? "border-orange-500 text-orange-500" 
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <pre className="bg-zinc-900 p-4 rounded-xl text-sm font-mono text-zinc-300 overflow-x-auto border border-zinc-800">
                  {apiSnippets[activeSnippet]}
                </pre>
                <button 
                  onClick={() => copyToClipboard(apiSnippets[activeSnippet], 'api')}
                  className="absolute top-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-500 transition-colors"
                >
                  {copiedId === 'api' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400">
                  <span className="text-orange-500 font-semibold">Note:</span> L'API est actuellement en mode simulation pour cette démo. Dans une version de production, vous recevriez une clé API unique dans vos paramètres.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
