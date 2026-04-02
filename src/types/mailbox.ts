export interface Mailbox {
  id: string;
  userId: string;
  address: string;
  label: string;
  project: string;
  notes?: string;
  targetUrl?: string;
  playStoreUrl?: string;
  packageName?: string;
  webhookUrl?: string;
  status: 'active' | 'inactive';
  appStatus: 'idle' | 'installing' | 'installed' | 'active';
  isAutoPilotEnabled?: boolean;
  createdAt: any;
  lastMessageAt?: any;
}
