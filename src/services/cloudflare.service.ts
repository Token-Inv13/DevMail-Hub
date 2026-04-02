type CloudflareError = {
  error?: unknown;
};

type CloudflareZone = {
  id: string;
  name: string;
};

type VerifyDnsResponse = {
  mxValid: boolean;
  spfValid: boolean;
};

const toErrorMessage = (error: unknown) =>
  typeof error === 'string' ? error : JSON.stringify(error);

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & CloudflareError;
  if (!response.ok || data.error) {
    throw new Error(toErrorMessage(data.error || response.statusText));
  }
  return data as T;
}

export async function listCloudflareZones(): Promise<CloudflareZone[]> {
  const response = await fetch('/api/cloudflare/zones');
  const data = await parseResponse<{ result?: CloudflareZone[] }>(response);
  return data.result || [];
}

export async function setupCloudflareDns(zoneId: string, domainName: string) {
  const response = await fetch('/api/cloudflare/setup-dns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, domainName }),
  });

  return parseResponse(response);
}

export async function verifyCloudflareDns(zoneId: string): Promise<VerifyDnsResponse> {
  const response = await fetch(`/api/cloudflare/verify-dns/${zoneId}`);
  return parseResponse<VerifyDnsResponse>(response);
}

export async function createCloudflareSubdomain(zoneId: string, subdomain: string, target: string) {
  const response = await fetch('/api/cloudflare/create-subdomain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zoneId, subdomain, target }),
  });

  return parseResponse(response);
}
