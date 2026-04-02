import { useState } from 'react';

type WebhookLog = {
  id: string;
  timestamp: Date;
  url: string;
  payload: unknown;
  status: 'success' | 'error';
};

export function useWebhookDebugger() {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleTestWebhook = async () => {
    if (!testWebhookUrl) return;

    setIsTestingWebhook(true);
    const payload = {
      event: 'message.received',
      mailbox: 'test-mailbox@devmail.hub',
      subject: 'Test Webhook Debugger',
      timestamp: new Date().toISOString(),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setWebhookLogs((previousLogs) => [
        {
          id: Math.random().toString(36).slice(2, 11),
          timestamp: new Date(),
          url: testWebhookUrl,
          payload,
          status: 'success' as const,
        },
        ...previousLogs,
      ].slice(0, 5));
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return {
    handleTestWebhook,
    isTestingWebhook,
    setTestWebhookUrl,
    testWebhookUrl,
    webhookLogs,
  };
}
