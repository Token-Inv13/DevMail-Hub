/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useMailboxes, Mailbox } from './hooks/useMailboxes';
import { useMessages, Message } from './hooks/useMessages';
import { useActivities, Activity } from './hooks/useActivities';
import { auth, db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Send,
  UserCheck,
  Zap,
  Clock,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  LogIn,
  Activity as ActivityIcon,
  Play,
  FileJson,
  Share2,
  DownloadCloud,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

export default function App() {
  const { user, loading: authLoading, apiKey, rotateApiKey } = useAuth();
  const { mailboxes, loading: mailLoading, error: mailError, createMailbox, toggleStatus, removeMailbox, updateAppStatus, toggleAutoPilot } = useMailboxes(user);
  const [selectedMailboxId, setSelectedMailboxId] = useState<string | null>(null);
  const { messages, loading: msgLoading, simulateMessage, markAsRead } = useMessages(selectedMailboxId);
  const { activities, logActivity } = useActivities(selectedMailboxId);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newPlayStoreUrl, setNewPlayStoreUrl] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [newDomain, setNewDomain] = useState('gmail-verify.com');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState<'curl' | 'javascript' | 'python'>('javascript');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'extension' | 'settings'>('dashboard');
  const [activeInboxTab, setActiveInboxTab] = useState<'messages' | 'simulation'>('messages');

  // Auto-Pilot Logic
  useEffect(() => {
    const interval = setInterval(() => {
      mailboxes.forEach(mailbox => {
        if (mailbox.isAutoPilotEnabled && mailbox.appStatus === 'active') {
          // 20% chance to trigger an action every minute
          if (Math.random() < 0.2) {
            triggerAutoPilotAction(mailbox);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [mailboxes]);

  const triggerAutoPilotAction = async (mailbox: Mailbox) => {
    const actions = [
      { name: 'Navigation', details: 'Consultation du catalogue produit (Auto-Pilot)' },
      { name: 'Interaction', details: 'Ajout d\'un article au panier (Auto-Pilot)' },
      { name: 'Profil', details: 'Mise à jour des préférences utilisateur (Auto-Pilot)' },
      { name: 'Recherche', details: 'Recherche de mots-clés spécifiques (Auto-Pilot)' }
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    // Log activity
    await logActivityToMailbox(mailbox.id, 'action', randomAction.name, randomAction.details);
    
    // Trigger Webhook if exists
    if (mailbox.webhookUrl) {
      triggerWebhook(mailbox.webhookUrl, {
        type: 'action',
        mailboxId: mailbox.id,
        address: mailbox.address,
        actionName: randomAction.name,
        details: randomAction.details,
        timestamp: new Date().toISOString()
      });
    }
  };

  const triggerWebhook = async (url: string, payload: any) => {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Webhook Error:", err);
    }
  };

  const logActivityToMailbox = async (mailboxId: string, type: Activity['type'], name: string, details: string) => {
    // This is a helper to log activity even if not currently selected
    // Since useActivities is scoped to selectedMailboxId, we might need a more global way or just use the hook's method if it's the selected one
    if (selectedMailboxId === mailboxId) {
      await logActivity(type, name, details);
    } else {
      // Manual log for background auto-pilot
      try {
        await addDoc(collection(db, 'activities'), {
          mailboxId,
          userId: user?.uid,
          type,
          actionName: name,
          details,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error logging background activity:", err);
      }
    }
  };

  const exportActivities = () => {
    if (activities.length === 0) return;
    
    const headers = ['Type', 'Action', 'Details', 'Timestamp'];
    const rows = activities.map(a => [
      a.type,
      a.actionName || '',
      a.details,
      a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000).toISOString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activities-${selectedMailbox?.label}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMailbox(newLabel, newProject, newNotes, newTargetUrl, newWebhookUrl, newPlayStoreUrl, newPackageName, newCount, newDomain);
    setNewLabel('');
    setNewProject('');
    setNewNotes('');
    setNewTargetUrl('');
    setNewWebhookUrl('');
    setNewPlayStoreUrl('');
    setNewPackageName('');
    setNewCount(1);
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const projects = Array.from(new Set(mailboxes.map(m => m.project).filter(Boolean)));

  const selectedMailbox = mailboxes.find(m => m.id === selectedMailboxId);

  const filteredMailboxes = mailboxes.filter(m => {
    const matchesSearch = m.address.toLowerCase().includes(search.toLowerCase()) ||
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.project.toLowerCase().includes(search.toLowerCase());
    
    const matchesProject = !selectedProject || m.project === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  const handleSimulateScenario = async (type: 'signup' | 'reset' | 'notif') => {
    if (!selectedMailbox) return;
    
    let subject = '';
    let body = '';
    
    const appUrl = selectedMailbox.targetUrl || 'https://votre-app.com';
    const token = Math.random().toString(36).substring(7);

    switch(type) {
      case 'signup':
        subject = 'Confirmez votre inscription';
        body = `Bonjour ! Merci de vous être inscrit sur ${selectedMailbox.project || 'notre application'}. Veuillez cliquer sur le lien ci-dessous pour confirmer votre compte : ${appUrl}/confirm?token=${token}`;
        break;
      case 'reset':
        subject = 'Réinitialisation de votre mot de passe';
        body = `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ici : ${appUrl}/reset-password?token=${token}. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`;
        break;
      case 'notif':
        subject = 'Nouvelle notification système';
        body = `Une nouvelle activité a été détectée sur votre compte. Voir les détails : ${appUrl}/dashboard/activity/${token}`;
        break;
    }
    
    const systemDomains = ['verify-system.com', 'account-notif.net', 'security-alerts.io'];
    const randomSystemFrom = `support@${systemDomains[Math.floor(Math.random() * systemDomains.length)]}`;
    
    await simulateMessage(randomSystemFrom, subject, body);
  };

  const handleSimulateAppAction = async (type: Activity['type']) => {
    if (!selectedMailbox) return;

    let actionName = '';
    let details = '';

    switch(type) {
      case 'install':
        actionName = 'Installation Play Store';
        details = `Téléchargement de l'application ${selectedMailbox.packageName || 'inconnue'}...`;
        await updateAppStatus(selectedMailbox.id, 'installing');
        await logActivity('install', actionName, details);
        
        // Webhook for install start
        if (selectedMailbox.webhookUrl) {
          triggerWebhook(selectedMailbox.webhookUrl, { type: 'install_start', mailboxId: selectedMailbox.id, address: selectedMailbox.address });
        }

        // Simulate installation delay
        setTimeout(async () => {
          await updateAppStatus(selectedMailbox.id, 'installed');
          await logActivity('action', 'Installation Terminée', `L'application est maintenant prête sur l'appareil simulé.`);
          if (selectedMailbox.webhookUrl) {
            triggerWebhook(selectedMailbox.webhookUrl, { type: 'install_complete', mailboxId: selectedMailbox.id, address: selectedMailbox.address });
          }
        }, 3000);
        break;
      case 'login':
        actionName = 'Connexion Utilisateur';
        details = `Tentative de connexion avec l'adresse ${selectedMailbox.address}...`;
        await logActivity('login', actionName, details);
        
        setTimeout(async () => {
          await updateAppStatus(selectedMailbox.id, 'active');
          await logActivity('action', 'Session Active', `Utilisateur connecté avec succès. Début de la session active.`);
          if (selectedMailbox.webhookUrl) {
            triggerWebhook(selectedMailbox.webhookUrl, { type: 'login_success', mailboxId: selectedMailbox.id, address: selectedMailbox.address });
          }
        }, 1500);
        break;
      case 'action':
        const actions = [
          { name: 'Navigation', details: 'Consultation du catalogue produit' },
          { name: 'Interaction', details: 'Ajout d\'un article au panier' },
          { name: 'Profil', details: 'Mise à jour des préférences utilisateur' },
          { name: 'Recherche', details: 'Recherche de mots-clés spécifiques' }
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        actionName = randomAction.name;
        details = randomAction.details;
        await logActivity('action', actionName, details);
        
        if (selectedMailbox.webhookUrl) {
          triggerWebhook(selectedMailbox.webhookUrl, { 
            type: 'action', 
            mailboxId: selectedMailbox.id, 
            address: selectedMailbox.address,
            actionName,
            details
          });
        }
        break;
    }
  };

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
  -d '{"to": "user.abc12345@gmail-verify.com", "subject": "Test", "body": "Hello World"}'`,
    javascript: `const response = await fetch('https://api.devmail.hub/v1/messages', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    to: 'user.abc12345@gmail-verify.com',
    subject: 'Test',
    body: 'Hello World'
  })
});`,
    python: `import requests
response = requests.post(
    'https://api.devmail.hub/v1/messages',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'to': 'user.abc12345@gmail-verify.com', 'subject': 'Test', 'body': 'Hello World'}
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
                            <button 
                              onClick={() => setSelectedMailboxId(mailbox.id)}
                              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-orange-500 transition-colors shrink-0"
                              title="Voir les messages"
                            >
                              <Inbox className="w-4 h-4" />
                            </button>
                            {mailbox.playStoreUrl && (
                              <button 
                                onClick={() => {
                                  setSelectedMailboxId(mailbox.id);
                                  setActiveInboxTab('simulation');
                                }}
                                className={cn(
                                  "p-1.5 hover:bg-zinc-800 rounded-md transition-colors shrink-0",
                                  mailbox.appStatus === 'active' ? "text-green-500" :
                                  mailbox.appStatus === 'installed' ? "text-blue-500" :
                                  mailbox.appStatus === 'installing' ? "text-orange-500 animate-pulse" :
                                  "text-zinc-500 hover:text-orange-500"
                                )}
                                title={`App Status: ${mailbox.appStatus || 'idle'}`}
                              >
                                <Smartphone className="w-4 h-4" />
                              </button>
                            )}
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

      {/* Inbox Overlay */}
      <AnimatePresence>
        {selectedMailboxId && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#0f0f0f] border-l border-zinc-800 z-[60] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setSelectedMailboxId(null);
                    setSelectedMessage(null);
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
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
                  "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  activeInboxTab === 'messages' 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                Messages
              </button>
              <button 
                onClick={() => setActiveInboxTab('simulation')}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  activeInboxTab === 'simulation' 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
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
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800/50" />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                        <Inbox className="w-8 h-8 text-zinc-700" />
                      </div>
                      <p className="text-zinc-500 text-sm">Aucun message reçu pour le moment.</p>
                      <button 
                        onClick={() => handleSimulateScenario('signup')}
                        className="text-xs text-orange-500 font-medium hover:underline"
                      >
                        Simuler une inscription utilisateur
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (!msg.isRead) markAsRead(msg.id);
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-all cursor-pointer group/msg",
                            selectedMessage?.id === msg.id 
                              ? "bg-orange-500/5 border-orange-500/30" 
                              : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700",
                            !msg.isRead && "border-l-4 border-l-orange-500"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-zinc-400 truncate max-w-[200px]">{msg.from}</span>
                            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {msg.receivedAt?.seconds ? format(new Date(msg.receivedAt.seconds * 1000), 'HH:mm') : '...'}
                            </span>
                          </div>
                          <h4 className={cn(
                            "text-sm font-semibold mb-2 line-clamp-1",
                            !msg.isRead ? "text-white" : "text-zinc-400"
                          )}>
                            {msg.subject}
                          </h4>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {msg.body}
                          </p>
                          
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
                  {/* App Status Card */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
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
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        selectedMailbox?.appStatus === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        selectedMailbox?.appStatus === 'installed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        selectedMailbox?.appStatus === 'installing' ? "bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse" :
                        "bg-zinc-800 text-zinc-500 border-zinc-700"
                      )}>
                        {selectedMailbox?.appStatus || 'idle'}
                      </div>
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
                      <button 
                        onClick={() => handleSimulateAppAction('install')}
                        disabled={selectedMailbox?.appStatus !== 'idle'}
                        className="flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Installer
                      </button>
                      <button 
                        onClick={() => handleSimulateAppAction('login')}
                        disabled={selectedMailbox?.appStatus === 'idle' || selectedMailbox?.appStatus === 'installing'}
                        className="flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                        Connexion
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleSimulateAppAction('action')}
                      disabled={selectedMailbox?.appStatus !== 'active'}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
                    >
                      <ActivityIcon className="w-4 h-4" />
                      Réaliser une action in-app
                    </button>

                    {/* Auto-Pilot Toggle */}
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className={cn("w-4 h-4", selectedMailbox?.isAutoPilotEnabled ? "text-orange-500" : "text-zinc-600")} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">Mode Auto-Pilote</p>
                          <p className="text-[10px] text-zinc-500">Actions périodiques automatiques</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => selectedMailbox && toggleAutoPilot(selectedMailbox.id, !!selectedMailbox.isAutoPilotEnabled)}
                        className={cn(
                          "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                          selectedMailbox?.isAutoPilotEnabled ? "bg-orange-500" : "bg-zinc-800"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                          selectedMailbox?.isAutoPilotEnabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Activity Log */}
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
                        <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
                          <p className="text-xs text-zinc-600">Aucune activité enregistrée.</p>
                        </div>
                      ) : (
                        activities.map((activity) => (
                          <div key={activity.id} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border shrink-0",
                                activity.type === 'install' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                activity.type === 'login' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                activity.type === 'action' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                "bg-zinc-800 border-zinc-700 text-zinc-500"
                              )}>
                                {activity.type === 'install' ? <Download className="w-4 h-4" /> :
                                 activity.type === 'login' ? <LogIn className="w-4 h-4" /> :
                                 activity.type === 'action' ? <ActivityIcon className="w-4 h-4" /> :
                                 <Trash2 className="w-4 h-4" />}
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
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                className="absolute inset-0 bg-[#0f0f0f] z-20 flex flex-col"
              >
                <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                  >
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
                    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 leading-relaxed text-zinc-300 whitespace-pre-wrap">
                      {selectedMessage.body}
                    </div>
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
                            <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-orange-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">URL Play Store (Optionnel)</label>
                    <input 
                      type="url" 
                      placeholder="https://play.google.com/store/apps/details?id=..." 
                      value={newPlayStoreUrl}
                      onChange={(e) => setNewPlayStoreUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Package Name (Android)</label>
                    <input 
                      type="text" 
                      placeholder="com.votreapp.android" 
                      value={newPackageName}
                      onChange={(e) => setNewPackageName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Nombre d'adresses</label>
                    <input 
                      type="number" 
                      min="1"
                      max="20"
                      value={newCount}
                      onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Domaine de l'adresse</label>
                    <div className="relative">
                      <select 
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="gmail-verify.com">gmail-verify.com (Recommandé)</option>
                        <option value="outlook-test.net">outlook-test.net</option>
                        <option value="mbox-pro.io">mbox-pro.io</option>
                        <option value="user-mail.org">user-mail.org</option>
                        <option value="cloud-verify.me">cloud-verify.me</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none rotate-90" />
                    </div>
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
