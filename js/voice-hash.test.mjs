import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpeech, hashId, clipId } from './voice-hash.js';

test('normalizeSpeech strips <em> and collapses whitespace', () => {
  assert.equal(normalizeSpeech('שלום <em>עולם</em>   כאן'), 'שלום עולם כאן');
  assert.equal(normalizeSpeech('  a\n b '), 'a b');
});

test('hashId is deterministic and 8 hex chars', () => {
  const a = hashId('abc'); const b = hashId('abc');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{8}$/);
  assert.notEqual(hashId('abc'), hashId('abd'));
});

test('clipId ignores <em> but depends on speaker and text', () => {
  assert.equal(clipId('michal', 'היי <em>שם</em>'), clipId('michal', 'היי שם'));
  assert.notEqual(clipId('michal', 'היי'), clipId('dana', 'היי'));
});
