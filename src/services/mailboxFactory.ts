export type CreateMailboxInput = {
  label: string;
  project: string;
  notes?: string;
  targetUrl?: string;
  webhookUrl?: string;
  playStoreUrl?: string;
  packageName?: string;
  count?: number;
  domain?: string;
};

type MailboxDraft = {
  userId: string;
  address: string;
  label: string;
  project: string;
  notes: string;
  targetUrl: string;
  playStoreUrl: string;
  packageName: string;
  webhookUrl: string;
  status: 'active';
  appStatus: 'idle';
  isAutoPilotEnabled: false;
  createdAt: unknown;
};

const fallbackDomains = [
  'tech-solutions.pro',
  'global-corp.net',
  'service-desk.io',
  'staff-mail.org',
  'verify-account.me',
  'gmail-verify.com',
];

const firstNames = ['john', 'jane', 'alex', 'sarah', 'mike', 'emma', 'david', 'lisa', 'tom', 'anna'];
const lastNames = ['smith', 'jones', 'doe', 'brown', 'wilson', 'taylor', 'clark', 'lewis', 'walker', 'hall'];

const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function buildMailboxDrafts(
  userId: string,
  input: CreateMailboxInput,
  createdAt: unknown,
): MailboxDraft[] {
  const {
    label,
    project,
    notes = '',
    targetUrl = '',
    webhookUrl = '',
    playStoreUrl = '',
    packageName = '',
    count = 1,
    domain,
  } = input;

  return Array.from({ length: count }, (_, index) => {
    const randomStr = Math.random().toString(36).substring(2, 6);
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(lastNames);
    const randomDomain = domain || pickRandom(fallbackDomains);
    const address = `${firstName}.${lastName}.${randomStr}@${randomDomain}`;

    return {
      userId,
      address,
      label: count > 1 ? `${label} #${index + 1}` : label,
      project,
      notes,
      targetUrl,
      playStoreUrl,
      packageName,
      webhookUrl,
      status: 'active',
      appStatus: 'idle',
      isAutoPilotEnabled: false,
      createdAt,
    };
  });
}
