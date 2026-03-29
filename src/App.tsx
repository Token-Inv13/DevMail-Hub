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
  Code,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

export default function App() {
  const { user, loading: authLoading, apiKey, rotateApiKey } = useAuth();
  const { mailboxes, loading: mailLoading, error: mailError, createMailbox, toggleStatus, removeMailbox } = useMailboxes(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<'curl' | 'javascript' | 'python'>('javascript');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'extension' | 'settings'>('dashboard');

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMailbox(newLabel, newProject, newNotes, newTargetUrl, newWebhookUrl);
    setNewLabel('');
    setNewProject('');
    setNewNotes('');
    setNewTargetUrl('');
    setNewWebhookUrl('');
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const projects = Array.from(new Set(mailboxes.map(m => m.project).filter(Boolean)));

  const filteredMailboxes = mailboxes.filter(m => {
    const matchesSearch = m.address.toLowerCase().includes(search.toLowerCase()) ||
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.project.toLowerCase().includes(search.toLowerCase());
    
    const matchesProject = !selectedProject || m.project === selectedProject;
    
    return matchesSearch && matchesProject;
  });

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

        <div className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors",
                activeTab === 'dashboard' ? "bg-orange-500/10 text-orange-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden md:block">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('extension')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors",
                activeTab === 'extension' ? "bg-orange-500/10 text-orange-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <Code className="w-5 h-5" />
              <span className="hidden md:block">Browser Extension</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-colors",
                activeTab === 'settings' ? "bg-orange-500/10 text-orange-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:block">Settings & API</span>
            </button>
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
                  "w-full flex items-center justify-between p-2 px-3 rounded-lg text-sm transition-colors",
                  !selectedProject ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                )}
              >
                <span>Tous les projets</span>
                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{mailboxes.length}</span>
              </button>
              {projects.map(project => (
                <button 
                  key={project}
                  onClick={() => setSelectedProject(project)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 px-3 rounded-lg text-sm transition-colors",
                    selectedProject === project ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                  )}
                >
                  <span className="truncate">{project}</span>
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    {mailboxes.filter(m => m.project === project).length}
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

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        {activeTab === 'dashboard' ? (
          <>
            <header className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md border-bottom border-zinc-800/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedProject ? `Projet: ${selectedProject}` : 'Tableau de bord'}
                </h2>
                <p className="text-zinc-500 text-sm">Gérez vos {filteredMailboxes.length} adresses de test</p>
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
                          <div className="flex items-center gap-1">
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
                            <button 
                              onClick={() => copyToClipboard(mailbox.address, mailbox.id)}
                              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors shrink-0"
                            >
                              {copiedId === mailbox.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {mailbox.notes && (
                          <p className="mt-3 text-xs text-zinc-500 italic line-clamp-2">
                            "{mailbox.notes}"
                          </p>
                        )}

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
          </>
        ) : activeTab === 'extension' ? (
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

              {/* Extension Mockup */}
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
                      {mailboxes.slice(0, 3).map(m => (
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
        ) : (
          <div className="p-12 max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Settings & Automation</h2>
              <p className="text-zinc-400 text-lg">
                Configurez vos accès API et automatisez vos tests QA.
              </p>
            </div>

            <div className="space-y-8">
              {/* API Key Section */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Clé API Personnelle</h3>
                    <p className="text-sm text-zinc-500">Utilisez cette clé pour accéder à DevMail Hub via vos scripts d'automatisation.</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-orange-500/20" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-3 font-mono text-sm text-orange-500 flex items-center justify-between">
                    <span>{apiKey || 'Génération en cours...'}</span>
                    <button 
                      onClick={() => copyToClipboard(apiKey || '', 'api-key')}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                      {copiedId === 'api-key' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-600" />}
                    </button>
                  </div>
                  <button 
                    onClick={rotateApiKey}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all border border-zinc-700"
                  >
                    Régénérer
                  </button>
                </div>

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                  <p className="text-xs text-orange-500/80 leading-relaxed">
                    <span className="font-bold">Attention :</span> Ne partagez jamais votre clé API. Elle donne un accès complet à vos mailboxes et messages.
                  </p>
                </div>
              </div>

              {/* Automation Docs Preview */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Exemple d'automatisation (Playwright)</h3>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="bg-zinc-800/50 p-3 border-b border-zinc-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">test-auth.spec.ts</span>
                  </div>
                  <pre className="p-6 text-xs font-mono text-zinc-400 overflow-x-auto">
                    {`import { test, expect } from '@playwright/test';

test('vérification du mail de bienvenue', async ({ page }) => {
  const apiKey = '${apiKey || 'VOTRE_CLE_API'}';
  
  // 1. Créer une mailbox via l'API
  const response = await fetch('https://api.devmail.hub/v1/mailboxes', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${apiKey}\` }
  });
  const { address } = await response.json();

  // 2. S'inscrire sur votre app
  await page.goto('https://votre-app.com/signup');
  await page.fill('#email', address);
  await page.click('#submit');

  // 3. Récupérer le dernier mail reçu
  const mailRes = await fetch(\`https://api.devmail.hub/v1/messages?address=\${address}\`, {
    headers: { 'Authorization': \`Bearer \${apiKey}\` }
  });
  const { messages } = await mailRes.json();
  
  expect(messages[0].subject).toBe('Bienvenue !');
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Notes de test (Optionnel)</label>
                  <textarea 
                    placeholder="ex: Test du scénario de récupération de mot de passe..." 
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">URL Cible (Auto-Launch)</label>
                    <input 
                      type="url" 
                      placeholder="https://votre-app.com/login" 
                      value={newTargetUrl}
                      onChange={(e) => setNewTargetUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Webhook URL (Callback)</label>
                    <input 
                      type="url" 
                      placeholder="https://votre-api.com/webhook" 
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                    />
                  </div>
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
