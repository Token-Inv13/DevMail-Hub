import axios, { AxiosInstance } from 'axios';
import { requireCloudflareApiToken } from '../config/env';

type CloudflareRecordInput = {
  type: 'MX' | 'TXT' | 'CNAME';
  name: string;
  content: string;
  ttl: number;
  priority?: number;
  proxied?: boolean;
};

type CloudflareApiError = {
  code?: number;
};

type CloudflareDnsRecord = {
  type: string;
  content: string;
};

export class CloudflareService {
  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        Authorization: `Bearer ${requireCloudflareApiToken()}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async listZones() {
    const response = await this.createClient().get('/zones');
    return response.data;
  }

  async setupDns(zoneId: string, domainName: string) {
    const records = await Promise.all([
      this.safeCreateRecord(zoneId, {
        type: 'MX',
        name: '@',
        content: 'mx.devmail.hub',
        priority: 10,
        ttl: 3600,
      }),
      this.safeCreateRecord(zoneId, {
        type: 'TXT',
        name: '@',
        content: 'v=spf1 include:spf.devmail.hub ~all',
        ttl: 3600,
      }),
    ]);

    return {
      success: true,
      domainName,
      records: records.map((record) => record.data),
    };
  }

  async verifyDns(zoneId: string) {
    const response = await this.createClient().get(`/zones/${zoneId}/dns_records`);
    const records = response.data.result as CloudflareDnsRecord[];

    const mxValid = records.some((record) => record.type === 'MX' && record.content === 'mx.devmail.hub');
    const spfValid = records.some((record) => record.type === 'TXT' && record.content.includes('v=spf1 include:spf.devmail.hub'));

    return { mxValid, spfValid };
  }

  async createSubdomain(zoneId: string, subdomain: string, target: string) {
    const response = await this.safeCreateRecord(zoneId, {
      type: 'CNAME',
      name: subdomain,
      content: target,
      ttl: 3600,
      proxied: true,
    });

    return response.data;
  }

  private async safeCreateRecord(zoneId: string, data: CloudflareRecordInput) {
    try {
      return await this.createClient().post(`/zones/${zoneId}/dns_records`, data);
    } catch (error: any) {
      const cfErrors = (error.response?.data?.errors || []) as CloudflareApiError[];
      const alreadyExists = cfErrors.some((entry) => entry.code === 81058);

      if (alreadyExists) {
        return { data: { success: true, result: 'already_exists' } };
      }

      throw error;
    }
  }
}

export const cloudflareService = new CloudflareService();
