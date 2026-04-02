import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMailboxDrafts } from '../src/services/mailboxFactory';

test('buildMailboxDrafts uses provided domain and default values', () => {
  const drafts = buildMailboxDrafts(
    'user-1',
    {
      label: 'Signup flow',
      project: 'Project A',
      domain: 'example.com',
    },
    'created-at',
  );

  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].userId, 'user-1');
  assert.equal(drafts[0].label, 'Signup flow');
  assert.equal(drafts[0].project, 'Project A');
  assert.equal(drafts[0].address.endsWith('@example.com'), true);
  assert.equal(drafts[0].status, 'active');
  assert.equal(drafts[0].appStatus, 'idle');
  assert.equal(drafts[0].isAutoPilotEnabled, false);
  assert.equal(drafts[0].notes, '');
});

test('buildMailboxDrafts suffixes labels when count is greater than one', () => {
  const drafts = buildMailboxDrafts(
    'user-2',
    {
      label: 'Checkout',
      project: 'Project B',
      count: 3,
      domain: 'example.org',
    },
    'created-at',
  );

  assert.deepEqual(
    drafts.map((draft) => draft.label),
    ['Checkout #1', 'Checkout #2', 'Checkout #3'],
  );
  assert.equal(drafts.every((draft) => draft.address.endsWith('@example.org')), true);
});
