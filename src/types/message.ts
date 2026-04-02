export interface Message {
  id: string;
  mailboxId: string;
  userId: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  links: string[];
  receivedAt: any;
  isRead: boolean;
}
