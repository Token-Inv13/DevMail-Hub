import { FormEvent, useEffect, useState } from 'react';
import { Domain } from '../types/domain';
import { createCloudflareSubdomain } from '../services/cloudflare.service';
import { CreateMailboxInput } from '../services/mailboxFactory';

type UseCreateMailboxModalOptions = {
  createMailbox: (params: CreateMailboxInput) => Promise<void> | Promise<unknown>;
  domains: Domain[];
  isCfConnected: boolean;
  selectedCfZoneId: string;
};

const initialFormState = {
  label: '',
  project: '',
  notes: '',
  targetUrl: '',
  webhookUrl: '',
  playStoreUrl: '',
  packageName: '',
  count: 1,
  domain: '',
  autoCreateSubdomain: false,
};

export function useCreateMailboxModal({
  createMailbox,
  domains,
  isCfConnected,
  selectedCfZoneId,
}: UseCreateMailboxModalOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState(initialFormState.label);
  const [newProject, setNewProject] = useState(initialFormState.project);
  const [newNotes, setNewNotes] = useState(initialFormState.notes);
  const [newTargetUrl, setNewTargetUrl] = useState(initialFormState.targetUrl);
  const [newWebhookUrl, setNewWebhookUrl] = useState(initialFormState.webhookUrl);
  const [newPlayStoreUrl, setNewPlayStoreUrl] = useState(initialFormState.playStoreUrl);
  const [newPackageName, setNewPackageName] = useState(initialFormState.packageName);
  const [newCount, setNewCount] = useState(initialFormState.count);
  const [newDomain, setNewDomain] = useState(initialFormState.domain);
  const [autoCreateSubdomain, setAutoCreateSubdomain] = useState(initialFormState.autoCreateSubdomain);

  useEffect(() => {
    if (domains.length > 0 && !newDomain) {
      setNewDomain(domains[0].name);
    }
  }, [domains, newDomain]);

  const resetForm = () => {
    setNewLabel(initialFormState.label);
    setNewProject(initialFormState.project);
    setNewNotes(initialFormState.notes);
    setNewTargetUrl(initialFormState.targetUrl);
    setNewWebhookUrl(initialFormState.webhookUrl);
    setNewPlayStoreUrl(initialFormState.playStoreUrl);
    setNewPackageName(initialFormState.packageName);
    setNewCount(initialFormState.count);
    setAutoCreateSubdomain(initialFormState.autoCreateSubdomain);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!newLabel || !newDomain) return;

    if (autoCreateSubdomain && isCfConnected && selectedCfZoneId && domains.some((domain) => domain.name === newDomain)) {
      const subdomain = newLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');
      try {
        await createCloudflareSubdomain(selectedCfZoneId, subdomain, window.location.hostname);
      } catch (error) {
        console.error('Subdomain creation failed:', error);
      }
    }

    await createMailbox({
      label: newLabel,
      project: newProject,
      notes: newNotes,
      targetUrl: newTargetUrl,
      webhookUrl: newWebhookUrl,
      playStoreUrl: newPlayStoreUrl,
      packageName: newPackageName,
      count: newCount,
      domain: newDomain,
    });

    closeModal();
    resetForm();
  };

  return {
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
    openModal: () => setIsModalOpen(true),
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
  };
}
