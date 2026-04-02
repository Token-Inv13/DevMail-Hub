import { Activity } from '../../types/activity';
import { Domain } from '../../types/domain';
import { Mailbox } from '../../types/mailbox';

export interface DashboardPageProps {
  copiedId: string | null;
  domains: Domain[];
  filteredMailboxes: Mailbox[];
  globalActivities: Activity[];
  mailError: string | null;
  mailLoading: boolean;
  mailboxes: Mailbox[];
  search: string;
  selectedMailboxId: string | null;
  selectedProject: string | null;
  setIsModalOpen: (open: boolean) => void;
  setSearch: (value: string) => void;
  setSelectedInboxMailbox: (mailboxId: string) => void;
  setSelectedSimulationMailbox: (mailboxId: string) => void;
  toggleStatus: (id: string, currentStatus: 'active' | 'inactive') => Promise<void>;
  removeMailbox: (id: string) => Promise<void>;
  copyToClipboard: (text: string, id: string) => void;
}
