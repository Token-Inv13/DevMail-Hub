import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCloudflareSubdomain,
  listCloudflareZones,
  setupCloudflareDns,
  verifyCloudflareDns,
} from '../src/services/cloudflare.service';

type MockResponseInput = {
  body: unknown;
  ok?: boolean;
  statusText?: string;
};

function mockJsonResponse({ body, ok = true, statusText = 'OK' }: MockResponseInput): Response {
  return {
    ok,
    statusText,
    json: async () => body,
  } as Response;
}

test('listCloudflareZones returns the result array', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () =>
    mockJsonResponse({
      body: {
        result: [{ id: 'zone-1', name: 'example.com' }],
      },
    });

  const zones = await listCloudflareZones();
  assert.deepEqual(zones, [{ id: 'zone-1', name: 'example.com' }]);
});

test('setupCloudflareDns posts the zone payload and throws on API error', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let capturedBody = '';
  globalThis.fetch = async (_input, init) => {
    capturedBody = String(init?.body || '');
    return mockJsonResponse({
      ok: false,
      statusText: 'Bad Request',
      body: { error: 'invalid payload' },
    });
  };

  await assert.rejects(() => setupCloudflareDns('zone-2', 'example.net'), /invalid payload/);
  assert.match(capturedBody, /zone-2/);
  assert.match(capturedBody, /example.net/);
});

test('verifyCloudflareDns returns MX and SPF flags', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () =>
    mockJsonResponse({
      body: { mxValid: true, spfValid: false },
    });

  const result = await verifyCloudflareDns('zone-3');
  assert.deepEqual(result, { mxValid: true, spfValid: false });
});

test('createCloudflareSubdomain sends the expected payload', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let capturedBody = '';
  globalThis.fetch = async (_input, init) => {
    capturedBody = String(init?.body || '');
    return mockJsonResponse({
      body: { success: true },
    });
  };

  const result = await createCloudflareSubdomain('zone-4', 'app', 'localhost');
  assert.deepEqual(result, { success: true });
  assert.match(capturedBody, /"subdomain":"app"/);
  assert.match(capturedBody, /"target":"localhost"/);
});
