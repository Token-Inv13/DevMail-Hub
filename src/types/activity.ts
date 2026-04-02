export interface Activity {
  id: string;
  mailboxId: string;
  userId: string;
  type: 'install' | 'login' | 'action' | 'uninstall';
  actionName?: string;
  details?: string;
  timestamp: any;
}
