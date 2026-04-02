import assert from 'node:assert/strict';
import test from 'node:test';
import { sortActivitiesByTimestampDesc } from '../src/repositories/activities.repository';
import { sortDomainsByCreatedAtDesc } from '../src/repositories/domains.repository';
import { sortMailboxesByCreatedAtDesc } from '../src/repositories/mailboxes.repository';
import { sortMessagesByReceivedAtDesc } from '../src/repositories/messages.repository';

test('sortMailboxesByCreatedAtDesc sorts newest first without mutating input', () => {
  const mailboxes = [
    { id: 'a', createdAt: { seconds: 10 } },
    { id: 'b', createdAt: { seconds: 30 } },
    { id: 'c', createdAt: { seconds: 20 } },
  ] as any[];

  const sorted = sortMailboxesByCreatedAtDesc(mailboxes);
  assert.deepEqual(sorted.map((item) => item.id), ['b', 'c', 'a']);
  assert.deepEqual(mailboxes.map((item) => item.id), ['a', 'b', 'c']);
});

test('sortDomainsByCreatedAtDesc sorts newest first', () => {
  const domains = [
    { id: 'a', createdAt: { seconds: 1 } },
    { id: 'b', createdAt: { seconds: 3 } },
    { id: 'c', createdAt: { seconds: 2 } },
  ] as any[];

  assert.deepEqual(sortDomainsByCreatedAtDesc(domains).map((item) => item.id), ['b', 'c', 'a']);
});

test('sortMessagesByReceivedAtDesc sorts newest first', () => {
  const messages = [
    { id: 'a', receivedAt: { seconds: 100 } },
    { id: 'b', receivedAt: { seconds: 300 } },
    { id: 'c', receivedAt: { seconds: 200 } },
  ] as any[];

  assert.deepEqual(sortMessagesByReceivedAtDesc(messages).map((item) => item.id), ['b', 'c', 'a']);
});

test('sortActivitiesByTimestampDesc sorts newest first', () => {
  const activities = [
    { id: 'a', timestamp: { seconds: 5 } },
    { id: 'b', timestamp: { seconds: 15 } },
    { id: 'c', timestamp: { seconds: 10 } },
  ] as any[];

  assert.deepEqual(sortActivitiesByTimestampDesc(activities).map((item) => item.id), ['b', 'c', 'a']);
});
