export interface Domain {
  id: string;
  userId: string;
  name: string;
  status: 'pending' | 'active' | 'error';
  mxValid: boolean;
  spfValid: boolean;
  dkimValid: boolean;
  reputation: 'High' | 'Medium' | 'Low' | 'None';
  isAutomated: boolean;
  dnsProvider?: 'cloudflare' | 'gandi' | 'route53' | null;
  createdAt: any;
}
