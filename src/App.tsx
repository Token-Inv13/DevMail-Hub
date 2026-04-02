/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useMailboxes } from './hooks/useMailboxes';
import { useInfrastructure } from './hooks/useInfrastructure';
import { useMessages } from './hooks/useMessages';
import { useActivities } from './hooks/useActivities';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { AppTab, InboxTab } from './types/app';
import { Message } from './types/message';
import { AppSidebar } from './components/layout/AppSidebar';
import { AuthLoadingScreen } from './pages/AuthLoadingScreen';
import { LoginScreen } from './pages/LoginScreen';
import { useCreateMailboxModal } from './hooks/useCreateMailboxModal';
import { useInfrastructureActions } from './hooks/useInfrastructureActions';
import { useMailboxSimulation } from './hooks/useMailboxSimulation';
import { useNotifications } from './hooks/useNotifications';
import { useWebhookDebugger } from './hooks/useWebhookDebugger';
import { NotificationViewport } from './components/ui/NotificationViewport';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const InfrastructurePage = lazy(() => import('./pages/InfrastructurePage').then((module) => ({ default: module.InfrastructurePage })));
const SimulationPage = lazy(() => import('./pages/SimulationPage').then((module) => ({ default: module.SimulationPage })));
const ExtensionPage = lazy(() => import('./pages/ExtensionPage').then((module) => ({ default: module.ExtensionPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const InboxOverlay = lazy(() => import('./components/inbox/InboxOverlay').then((module) => ({ default: module.InboxOverlay })));
const CreateMailboxModal = lazy(() => import('./components/mailboxes/CreateMailboxModal').then((module) => ({ default: module.CreateMailboxModal })));

export default function App() {
  const { user, loading: authLoading, apiKey, rotateApiKey } = useAuth();
  const { mailboxes, loading: mailLoading, error: mailError, createMailbox, toggleStatus, removeMailbox, updateAppStatus, toggleAutoPilot } = useMailboxes(user);
  const { domains, loading: domainsLoading, addDomain, deleteDomain, checkDomainStatus, searchDomains, buyDomain, automateDNS } = useInfrastructure();
  const [selectedMailboxId, setSelectedMailboxId] = useState<string | null>(null);
  const { messages, loading: msgLoading, simulateMessage, markAsRead } = useMessages(selectedMailboxId);
  const { activities, logActivity } = useActivities(selectedMailboxId);
  const { activities: globalActivities } = useActivities(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [search, setSearch] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [activeInboxTab, setActiveInboxTab] = useState<InboxTab>('messages');
  const { dismissNotification, notifications, showNotification } = useNotifications();

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedMailbox = mailboxes.find(m => m.id === selectedMailboxId);

  const filteredMailboxes = mailboxes.filter(m => {
    const matchesSearch = m.address.toLowerCase().includes(search.toLowerCase()) ||
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.project.toLowerCase().includes(search.toLowerCase());
    
    const matchesProject = !selectedProject || m.project === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  const {
    cfError,
    cfZones,
    disconnectCloudflare,
    domainSearchQuery,
    fetchCloudflareZones,
    handleAutomateDNS,
    handleBuyDomain,
    handleCheckDomainStatus,
    handleDomainSearch,
    handleImportCfZone,
    isAutomating,
    isBuying,
    isCFLoading,
    isCfConnected,
    isConfiguringDNS,
    isSearching,
    performDomainSearch,
    searchResults,
    selectedCfZoneId,
    setDomainSearchQuery,
    setSelectedCfZoneId,
  } = useInfrastructureActions({
    addDomain,
    automateDNS,
    buyDomain,
    checkDomainStatus,
    domains,
    notify: showNotification,
    searchDomains,
  });

  const {
    autoCreateSubdomain,
    closeModal,
    handleCreate,
    isModalOpen,
    newCount,
    newDomain,
    newLabel,
    newNotes,
    newPackageName,
    newPlayStoreUrl,
    newProject,
    newTargetUrl,
    newWebhookUrl,
    openModal,
    setAutoCreateSubdomain,
    setNewCount,
    setNewDomain,
    setNewLabel,
    setNewNotes,
    setNewPackageName,
    setNewPlayStoreUrl,
    setNewProject,
    setNewTargetUrl,
    setNewWebhookUrl,
  } = useCreateMailboxModal({
    createMailbox,
    domains,
    isCfConnected,
    selectedCfZoneId,
  });

  const { exportActivities, handleSimulateAppAction, handleSimulateScenario } = useMailboxSimulation({
    activities,
    logActivity,
    mailboxes,
    selectedMailbox,
    selectedMailboxId,
    simulateMessage,
    updateAppStatus,
    userId: user?.uid,
  });

  const {
    handleTestWebhook,
    isTestingWebhook,
    setTestWebhookUrl,
    testWebhookUrl,
    webhookLogs,
  } = useWebhookDebugger();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const pageContent =
    activeTab === 'dashboard' ? (
      <DashboardPage
        copiedId={copiedId}
        domains={domains}
        filteredMailboxes={filteredMailboxes}
        globalActivities={globalActivities}
        mailError={mailError}
        mailLoading={mailLoading}
        mailboxes={mailboxes}
        search={search}
        selectedMailboxId={selectedMailboxId}
        selectedProject={selectedProject}
        setIsModalOpen={() => openModal()}
        setSearch={setSearch}
        setSelectedInboxMailbox={setSelectedMailboxId}
        setSelectedSimulationMailbox={(mailboxId) => {
          setSelectedMailboxId(mailboxId);
          setActiveInboxTab('simulation');
        }}
        toggleStatus={toggleStatus}
        removeMailbox={removeMailbox}
        copyToClipboard={copyToClipboard}
      />
    ) : activeTab === 'infrastructure' ? (
      <InfrastructurePage
        domains={domains}
        domainsLoading={domainsLoading}
        domainSearchQuery={domainSearchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        isBuying={isBuying}
        isAutomating={isAutomating}
        isConfiguringDNS={isConfiguringDNS}
        isCFLoading={isCFLoading}
        isCfConnected={isCfConnected}
        cfZones={cfZones}
        cfError={cfError}
        selectedCfZoneId={selectedCfZoneId}
        onDomainSearchSubmit={handleDomainSearch}
        onDomainSearch={performDomainSearch}
        onDomainSearchQueryChange={setDomainSearchQuery}
        onBuyDomain={handleBuyDomain}
        onAutomateDNS={handleAutomateDNS}
        onCheckDomainStatus={handleCheckDomainStatus}
        onDeleteDomain={deleteDomain}
        onFetchCloudflareZones={fetchCloudflareZones}
        onImportCfZone={handleImportCfZone}
        onSelectedCfZoneIdChange={setSelectedCfZoneId}
        onDisconnectCloudflare={disconnectCloudflare}
      />
    ) : activeTab === 'simulation' ? (
      <SimulationPage
        mailboxes={mailboxes}
        onOpenMailbox={setSelectedMailboxId}
        onOpenCreateModal={openModal}
        onSimulateSignup={() => handleSimulateScenario('signup')}
      />
    ) : activeTab === 'extension' ? (
      <ExtensionPage mailboxes={mailboxes} />
    ) : (
      <SettingsPage
        apiKey={apiKey}
        copiedId={copiedId}
        rotateApiKey={rotateApiKey}
        copyToClipboard={copyToClipboard}
        testWebhookUrl={testWebhookUrl}
        setTestWebhookUrl={setTestWebhookUrl}
        isTestingWebhook={isTestingWebhook}
        webhookLogs={webhookLogs}
        onTestWebhook={handleTestWebhook}
      />
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      <NotificationViewport notifications={notifications} onDismiss={dismissNotification} />

      <AppSidebar
        activeTab={activeTab}
        mailboxes={mailboxes}
        selectedProject={selectedProject}
        setActiveTab={setActiveTab}
        setSelectedProject={setSelectedProject}
        handleLogout={handleLogout}
        user={user}
      />

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <Suspense fallback={<AuthLoadingScreen />}>{pageContent}</Suspense>
      </main>

      <Suspense fallback={null}>
        <InboxOverlay
          activeInboxTab={activeInboxTab}
          activities={activities}
          messages={messages}
          msgLoading={msgLoading}
          selectedMailbox={selectedMailbox}
          selectedMailboxId={selectedMailboxId}
          selectedMessage={selectedMessage}
          closeOverlay={() => {
            setSelectedMailboxId(null);
            setSelectedMessage(null);
          }}
          exportActivities={exportActivities}
          handleSimulateAppAction={handleSimulateAppAction}
          handleSimulateScenario={handleSimulateScenario}
          markAsRead={markAsRead}
          openMessage={setSelectedMessage}
          setActiveInboxTab={setActiveInboxTab}
          setSelectedMessage={setSelectedMessage}
          toggleAutoPilot={toggleAutoPilot}
        />

        <CreateMailboxModal
          autoCreateSubdomain={autoCreateSubdomain}
          domains={domains}
          isCfConnected={isCfConnected}
          isOpen={isModalOpen}
          newCount={newCount}
          newDomain={newDomain}
          newLabel={newLabel}
          newNotes={newNotes}
          newPackageName={newPackageName}
          newPlayStoreUrl={newPlayStoreUrl}
          newProject={newProject}
          newTargetUrl={newTargetUrl}
          newWebhookUrl={newWebhookUrl}
          onAutoCreateSubdomainChange={setAutoCreateSubdomain}
          onClose={closeModal}
          onCountChange={setNewCount}
          onDomainChange={setNewDomain}
          onLabelChange={setNewLabel}
          onNotesChange={setNewNotes}
          onPackageNameChange={setNewPackageName}
          onPlayStoreUrlChange={setNewPlayStoreUrl}
          onProjectChange={setNewProject}
          onSubmit={handleCreate}
          onTargetUrlChange={setNewTargetUrl}
          onWebhookUrlChange={setNewWebhookUrl}
          selectedCfZoneId={selectedCfZoneId}
        />
      </Suspense>
    </div>
  );
}
