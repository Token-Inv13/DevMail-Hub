import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Copy, Loader2, Plus, Send, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';

interface WebhookLog {
  id: string;
  timestamp: Date;
  url: string;
  payload: any;
  status: 'success' | 'error';
}

interface SettingsPageProps {
  apiKey: string | null;
  copiedId: string | null;
  rotateApiKey: () => Promise<void>;
  copyToClipboard: (text: string, id: string) => void;
  testWebhookUrl: string;
  setTestWebhookUrl: Dispatch<SetStateAction<string>>;
  isTestingWebhook: boolean;
  webhookLogs: WebhookLog[];
  onTestWebhook: () => Promise<void>;
}

export function SettingsPage({
  apiKey,
  copiedId,
  rotateApiKey,
  copyToClipboard,
  testWebhookUrl,
  setTestWebhookUrl,
  isTestingWebhook,
  webhookLogs,
  onTestWebhook,
}: SettingsPageProps) {
  const apiSnippets = {
    curl: `curl -X POST https://api.devmail.hub/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"to": "john.doe.abc12@tech-solutions.pro", "subject": "Test", "body": "Hello World"}'`,
    javascript: `const response = await fetch('https://api.devmail.hub/v1/messages', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    to: 'john.doe.abc12@tech-solutions.pro',
    subject: 'Test',
    body: 'Hello World'
  })
});`,
    python: `import requests
response = requests.post(
    'https://api.devmail.hub/v1/messages',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={'to': 'john.doe.abc12@tech-solutions.pro', 'subject': 'Test', 'body': 'Hello World'}
)`,
  };

  return (
    <div className="p-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Settings & Automation</h2>
        <p className="text-zinc-400 text-lg">Configurez vos accès API et automatisez vos tests QA.</p>
      </div>

      <div className="space-y-8">
        <Card className="p-6 space-y-6">
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
              <button onClick={() => copyToClipboard(apiKey || '', 'api-key')} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                {copiedId === 'api-key' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-600" />}
              </button>
            </div>
            <Button
              onClick={rotateApiKey}
              className="border-zinc-700"
              variant="secondary"
            >
              Régénérer
            </Button>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
            <p className="text-xs text-orange-500/80 leading-relaxed">
              <span className="font-bold">Attention :</span> Ne partagez jamais votre clé API. Elle donne un accès complet à vos mailboxes et messages.
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Webhook Debugger</h3>
              <p className="text-sm text-zinc-500">Testez vos webhooks en temps réel et visualisez les payloads envoyés.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <Badge variant="success">Live</Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://votre-api.com/webhooks/mail"
              value={testWebhookUrl}
              onChange={(e) => setTestWebhookUrl(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all"
            />
            <Button
              onClick={onTestWebhook}
              disabled={isTestingWebhook || !testWebhookUrl}
              size="lg"
            >
              {isTestingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Tester
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase">Derniers Appels</h4>
            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div key={log.id} className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                        {log.status === 'success' ? '200 OK' : 'Error'}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">{log.url}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <pre className="text-[10px] text-zinc-400 font-mono overflow-x-auto">{JSON.stringify(log.payload, null, 2)}</pre>
                  </div>
                </div>
              ))}
              {webhookLogs.length === 0 && (
                <EmptyState
                  className="py-8"
                  icon={<Send className="w-5 h-5 text-zinc-600" />}
                  title="Aucun log de webhook récent."
                  description="Lance un test pour voir apparaître les derniers appels."
                />
              )}
            </div>
          </div>
        </Card>

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

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">API Documentation</h3>
              <p className="text-sm text-zinc-500">Prévisualisation des snippets d’intégration actuellement exposés dans le modal.</p>
            </div>
            <Button className="p-2 text-zinc-500" variant="ghost">
              <Plus className="w-5 h-5 rotate-45" />
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(apiSnippets).map(([lang, snippet]) => (
              <div key={lang} className="space-y-2">
                <div className="text-xs font-bold text-zinc-500 uppercase">{lang}</div>
                <div className="relative group">
                  <pre className="bg-zinc-900 p-4 rounded-xl text-sm font-mono text-zinc-300 overflow-x-auto border border-zinc-800">{snippet}</pre>
                  <button
                    onClick={() => copyToClipboard(snippet, `api-${lang}`)}
                    className="absolute top-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-500 transition-colors"
                  >
                    {copiedId === `api-${lang}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400">
              <span className="text-orange-500 font-semibold">Note:</span> L'API est actuellement en mode simulation pour cette démo. Dans une version de production, vous recevriez une clé API unique dans vos paramètres.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
