import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.js';
import { search } from '../src/shell/search.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function tmpSrcWithApps(apps) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-src-'));
  fs.cpSync(SRC, dir, { recursive: true, filter: (p) => !p.includes(`${path.sep}apps${path.sep}`) || p.endsWith('README.md') });
  for (const [rel, html] of Object.entries(apps)) {
    fs.mkdirSync(path.dirname(path.join(dir, 'apps', rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, 'apps', rel), html);
  }
  return dir;
}

function localRefs(html) {
  return [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map((m) => m[1]).filter((u) => !/^(https?:|data:|mailto:)/.test(u));
}

test('build: সব লোকাল লিংক কাজ করে, sw-তে placeholder নেই', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-out-'));
  build({ src: SRC, out, log: () => {} });
  const html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  for (const ref of localRefs(html)) assert.ok(fs.existsSync(path.join(out, ref)), `ভাঙা লিংক: ${ref}`);
  const sw = fs.readFileSync(path.join(out, 'sw.js'), 'utf8');
  assert.ok(!sw.includes('__VERSION__') && !sw.includes('__PRECACHE__'));
  const pre = JSON.parse(/const PRECACHE = (\[.*\]);/.exec(sw)[1]);
  for (const f of pre) assert.ok(fs.existsSync(path.join(out, f === './' ? 'index.html' : f)), `precache-এ নেই: ${f}`);
  // app.js থেকে import হওয়া সব module আছে
  for (const f of fs.readdirSync(path.join(out, 'shell'))) {
    const js = fs.readFileSync(path.join(out, 'shell', f), 'utf8');
    for (const m of js.matchAll(/from '(\.[^']+)'/g)) assert.ok(fs.existsSync(path.join(out, 'shell', m[1])), `${f}: ${m[1]}`);
  }
});

test('build: app থাকলে চালু হয়, কপিতে top bar বসে, মূল ফাইল বদলায় না', () => {
  const original = '<html><body><h1>Drill</h1></body></html>';
  const src = tmpSrcWithApps({ 'listening/drill/index.html': original, 'listening/full-tests/index.html': original });
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-out-'));
  const { appsOut } = build({ src, out, log: () => {} });
  assert.equal(appsOut.find((a) => a.id === 'l-drill').available, true);
  assert.equal(appsOut.find((a) => a.id === 'l-az').available, false);
  const copied = fs.readFileSync(path.join(out, 'apps/listening/drill/index.html'), 'utf8');
  assert.match(copied, /<script src="\.\.\/\.\.\/\.\.\/shell\/topbar\.js" data-hub="listening"/);
  assert.equal(fs.readFileSync(path.join(src, 'apps/listening/drill/index.html'), 'utf8'), original);
});

test('public build-এ private app বাদ যায়', () => {
  const src = tmpSrcWithApps({ 'listening/full-tests/index.html': '<body>x</body>', 'listening/drill/index.html': '<body>x</body>' });
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-out-'));
  const { appsOut } = build({ src, out, publicBuild: true, log: () => {} });
  assert.equal(fs.existsSync(path.join(out, 'apps/listening/full-tests')), false);
  assert.equal(appsOut.find((a) => a.id === 'l-full-tests').available, false);
  assert.equal(appsOut.find((a) => a.id === 'l-drill').available, true);
});

test('search: alias দিয়ে skill পাওয়া যায়', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-out-'));
  build({ src: SRC, out, log: () => {} });
  const idx = JSON.parse(fs.readFileSync(path.join(out, 'data/search-index.json'), 'utf8'));
  assert.equal(search(idx, 'R-S14')[0].href, '#/skill/X-SK-004');
  assert.ok(search(idx, 'synonym').some((e) => e.title === 'Synonym Map'));
  assert.deepEqual(search(idx, '   '), []);
});
