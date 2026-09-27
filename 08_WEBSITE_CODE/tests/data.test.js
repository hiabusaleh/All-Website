import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData } from '../build.js';
import { validateData } from '../validate.js';
import { overallPercent, stepPercent } from '../src/shell/roadmap.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

test('আসল data-য় কোনো ভুল নেই', () => {
  assert.deepEqual(validateData(loadData(SRC)), []);
});

test('duplicate alias ধরা পড়ে', () => {
  const d = loadData(SRC);
  d.skills.skills[1] = { ...d.skills.skills[1], aliases: ['R-S14'] };
  assert.ok(validateData(d).some((e) => e.includes('R-S14')));
});

test('registry-তে নেই এমন prerequisite ধরা পড়ে', () => {
  const d = loadData(SRC);
  d.skills.skills[0] = { ...d.skills.skills[0], prerequisites: ['X-SK-999'] };
  assert.ok(validateData(d).some((e) => e.includes('X-SK-999')));
});

test('ভুল ধরনের skill ID ধরা পড়ে', () => {
  const d = loadData(SRC);
  d.skills.skills.push({ id: 'Skill_10', aliases: [], prerequisites: [], status: 'PENDING_SOURCE' });
  assert.ok(validateData(d).some((e) => e.includes('ধরন')));
});

test('% হিসাব: task-এর ওজন আর ধাপের ওজন', () => {
  assert.equal(stepPercent({ status: 'done' }), 100);
  assert.equal(stepPercent({ status: 'started', tasks: [{ done: true }, { done: false, weight: 3 }] }), 25);
  assert.equal(overallPercent({ steps: [{ status: 'done', weight: 1 }, { status: 'todo', weight: 3, percent: 0 }] }), 25);
  const p = overallPercent(loadData(SRC).roadmap);
  assert.ok(p > 0 && p < 100);
});
