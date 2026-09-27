import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrate, newKeyFor, META_KEY } from '../src/shell/migrate.js';

function fake(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    map: m,
  };
}

test('প্ল্যান §৭-এর সব নাম', () => {
  assert.equal(newKeyFor('ielts_lt::C10T1'), 'L.test::C10T1');
  assert.equal(newKeyFor('ielts_drill'), 'L.drill');
  assert.equal(newKeyFor('ielts_syn::C12T3'), 'L.syn::C12T3');
  for (const k of ['navstate', 'shopt', 'smopt', 'vaultoff', 'vtheme', 'vfs']) assert.equal(newKeyFor(k), `L.vault.${k}`);
  assert.equal(newKeyFor('ielts_ft::C15T1'), 'R.test::C15T1');
  assert.equal(newKeyFor('ielts_vocab::abate'), 'V.learned::abate');
  assert.equal(newKeyFor('sg.streak'), 'S.streak');
  assert.equal(newKeyFor('ui.theme'), null);
  assert.equal(newKeyFor('ielts_drill_x'), null);
});

test('কপি হয়, পুরনো key মোছে না', () => {
  const s = fake({ 'ielts_lt::C10T1': '{"a":1}', 'sg.x': '5' });
  const r = migrate(s);
  assert.equal(r.copied.length, 2);
  assert.equal(s.getItem('L.test::C10T1'), '{"a":1}');
  assert.equal(s.getItem('ielts_lt::C10T1'), '{"a":1}');
  assert.equal(s.getItem('S.x'), '5');
  assert.ok(s.getItem(META_KEY));
});

test('পুরনো app পরে লিখলে নতুন key হালনাগাদ হয়', () => {
  const s = fake({ ielts_drill: '1' });
  migrate(s);
  s.setItem('ielts_drill', '2');
  const r = migrate(s);
  assert.equal(r.updated.length, 1);
  assert.equal(s.getItem('L.drill'), '2');
});

test('নতুন engine নতুন key বদলালে overwrite হয় না', () => {
  const s = fake({ ielts_drill: '1' });
  migrate(s);
  s.setItem('L.drill', 'engine');
  s.setItem('ielts_drill', '2');
  const r = migrate(s);
  assert.equal(r.skipped.length, 1);
  assert.equal(s.getItem('L.drill'), 'engine');
});

test('দুবার চালালে কিছু বদলায় না', () => {
  const s = fake({ ielts_drill: '1' });
  migrate(s);
  const r = migrate(s);
  assert.deepEqual([r.copied.length, r.updated.length, r.skipped.length], [0, 0, 0]);
});
