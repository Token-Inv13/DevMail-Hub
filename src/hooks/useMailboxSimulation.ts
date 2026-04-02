import { useEffect } from 'react';
import { Activity } from '../types/activity';
import { Mailbox } from '../types/mailbox';
import { createActivity } from '../repositories/activities.repository';

type UseMailboxSimulationOptions = {
  activities: Activity[];
  logActivity: (type: Activity['type'], actionName?: string, details?: string) => Promise<void>;
  mailboxes: Mailbox[];
  selectedMailbox: Mailbox | undefined;
  selectedMailboxId: string | null;
  simulateMessage: (from: string, subject: string, body: string) => Promise<void>;
  updateAppStatus: (id: string, status: Mailbox['appStatus']) => Promise<void>;
  userId?: string;
};

export function useMailboxSimulation({
  activities,
  logActivity,
  mailboxes,
  selectedMailbox,
  selectedMailboxId,
  simulateMessage,
  updateAppStatus,
  userId,
}: UseMailboxSimulationOptions) {
  const triggerWebhook = async (url: string, payload: unknown) => {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Webhook Error:', error);
    }
  };

  const logActivityToMailbox = async (mailboxId: string, type: Activity['type'], name: string, details: string) => {
    if (selectedMailboxId === mailboxId) {
      await logActivity(type, name, details);
      return;
    }

    try {
      await createActivity({
        mailboxId,
        userId,
        type,
        actionName: name,
        details,
      });
    } catch (error) {
      console.error('Error logging background activity:', error);
    }
  };

  const triggerAutoPilotAction = async (mailbox: Mailbox) => {
    const actions = [
      { name: 'Navigation', details: 'Consultation du catalogue produit (Auto-Pilot)' },
      { name: 'Interaction', details: "Ajout d'un article au panier (Auto-Pilot)" },
      { name: 'Profil', details: 'Mise à jour des préférences utilisateur (Auto-Pilot)' },
      { name: 'Recherche', details: 'Recherche de mots-clés spécifiques (Auto-Pilot)' },
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    await logActivityToMailbox(mailbox.id, 'action', randomAction.name, randomAction.details);

    if (mailbox.webhookUrl) {
      await triggerWebhook(mailbox.webhookUrl, {
        type: 'action',
        mailboxId: mailbox.id,
        address: mailbox.address,
        actionName: randomAction.name,
        details: randomAction.details,
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      mailboxes.forEach((mailbox) => {
        if (mailbox.isAutoPilotEnabled && mailbox.appStatus === 'active' && Math.random() < 0.2) {
          void triggerAutoPilotAction(mailbox);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [mailboxes]);

  const exportActivities = () => {
    if (!selectedMailbox || activities.length === 0) return;

    const headers = ['Type', 'Action', 'Details', 'Timestamp'];
    const rows = activities.map((activity) => [
      activity.type,
      activity.actionName || '',
      activity.details,
      activity.timestamp?.seconds ? new Date(activity.timestamp.seconds * 1000).toISOString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activities-${selectedMailbox.label}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateScenario = async (type: 'signup' | 'reset' | 'notif') => {
    if (!selectedMailbox) return;

    const appUrl = selectedMailbox.targetUrl || 'https://votre-app.com';
    const token = Math.random().toString(36).substring(7);
    let subject = '';
    let body = '';

    switch (type) {
      case 'signup':
        subject = "Confirmez votre inscription";
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

    const systemDomains = ['tech-support.pro', 'security-verify.net', 'accounts-global.io', 'staff-notif.org'];
    const randomSystemFrom = `support@${systemDomains[Math.floor(Math.random() * systemDomains.length)]}`;
    await simulateMessage(randomSystemFrom, subject, body);
  };

  const handleSimulateAppAction = async (type: Activity['type']) => {
    if (!selectedMailbox) return;

    switch (type) {
      case 'install':
        await updateAppStatus(selectedMailbox.id, 'installing');
        await logActivity('install', 'Installation Play Store', `Téléchargement de l'application ${selectedMailbox.packageName || 'inconnue'}...`);

        if (selectedMailbox.webhookUrl) {
          await triggerWebhook(selectedMailbox.webhookUrl, {
            type: 'install_start',
            mailboxId: selectedMailbox.id,
            address: selectedMailbox.address,
          });
        }

        setTimeout(async () => {
          await updateAppStatus(selectedMailbox.id, 'installed');
          await logActivity('action', 'Installation Terminée', "L'application est maintenant prête sur l'appareil simulé.");
          if (selectedMailbox.webhookUrl) {
            await triggerWebhook(selectedMailbox.webhookUrl, {
              type: 'install_complete',
              mailboxId: selectedMailbox.id,
              address: selectedMailbox.address,
            });
          }
        }, 3000);
        return;
      case 'login':
        await logActivity('login', 'Connexion Utilisateur', `Tentative de connexion avec l'adresse ${selectedMailbox.address}...`);

        setTimeout(async () => {
          await updateAppStatus(selectedMailbox.id, 'active');
          await logActivity('action', 'Session Active', 'Utilisateur connecté avec succès. Début de la session active.');
          if (selectedMailbox.webhookUrl) {
            await triggerWebhook(selectedMailbox.webhookUrl, {
              type: 'login_success',
              mailboxId: selectedMailbox.id,
              address: selectedMailbox.address,
            });
          }
        }, 1500);
        return;
      case 'action': {
        const actions = [
          { name: 'Navigation', details: 'Consultation du catalogue produit' },
          { name: 'Interaction', details: "Ajout d'un article au panier" },
          { name: 'Profil', details: 'Mise à jour des préférences utilisateur' },
          { name: 'Recherche', details: 'Recherche de mots-clés spécifiques' },
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        await logActivity('action', randomAction.name, randomAction.details);

        if (selectedMailbox.webhookUrl) {
          await triggerWebhook(selectedMailbox.webhookUrl, {
            type: 'action',
            mailboxId: selectedMailbox.id,
            address: selectedMailbox.address,
            actionName: randomAction.name,
            details: randomAction.details,
          });
        }
        return;
      }
    }
  };

  return {
    exportActivities,
    handleSimulateAppAction,
    handleSimulateScenario,
  };
}
