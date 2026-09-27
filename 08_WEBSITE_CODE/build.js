#!/usr/bin/env node
// node build.js → dist/
// ১. data যাচাই  ২. src কপি  ৩. কোন পুরনো app আছে তা দেখা  ৪. app-এর HTML কপিতে top bar বসানো
// ৫. search index  ৬. service worker-এ version আর precache তালিকা.
// মূল ফাইল (src/) কখনো বদলায় না.
// PUBLIC_BUILD=1 দিলে private (Cambridge/তৃতীয় পক্ষ) app আর audio বাদ যায়.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateData } from './validate.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

export function loadData(src) {
  const d = path.join(src, 'data');
  return {
    nav: readJSON(path.join(d, 'nav.json')),
    apps: readJSON(path.join(d, 'apps.json')),
    skills: readJSON(path.join(d, 'skills.json')),
    questionTypes: readJSON(path.join(d, 'question_types.json')),
    roadmap: readJSON(path.join(d, 'roadmap.json')),
  };
}

function injectTopbar(html, relToRoot, app) {
  const tag = `<script src="${relToRoot}shell/topbar.js" data-hub="${app.hub}" data-title="${app.title.replace(/"/g, '&quot;')}" defer></script>`;
  if (html.includes('shell/topbar.js')) return html;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${tag}\n</body>`);
  return `${html}\n${tag}\n`;
}

export function buildSearchIndex({ nav, apps, skills }) {
  const entries = [];
  for (const h of nav.hubs) {
    entries.push({ kind: 'hub', title: `${h.icon} ${h.title}`, sub: h.desc, href: h.route || `#/hub/${h.id}`, keywords: [h.en, h.id] });
  }
  for (const a of apps) {
    entries.push({
      kind: 'app', title: a.title, sub: a.sub,
      href: a.available ? `apps/${a.dir}/${a.entry || 'index.html'}` : `#/hub/${a.hub === 'home' ? '' : a.hub}`,
      keywords: [a.hub, a.source || ''],
    });
  }
  for (const s of skills.skills) {
    if (!s.name) continue;
    entries.push({ kind: 'skill', title: s.name, sub: `${s.id} · ${s.bn || ''}`, href: `#/skill/${s.id}`, keywords: [s.id, ...(s.aliases || []), ...(s.modules || [])] });
  }
  entries.push({ kind: 'page', title: 'Roadmap: কাজ কত দূর', sub: 'প্রতিটা ধাপের %', href: '#/roadmap', keywords: ['progress', 'percent', 'plan', 'প্ল্যান'] });
  entries.push({ kind: 'page', title: 'Progress Export/Import', sub: 'progress নামানো আর তোলা', href: '#/progress', keywords: ['backup', 'export', 'import'] });
  return entries;
}

export function build({ src = path.join(HERE, 'src'), out = path.join(HERE, 'dist'), publicBuild = false, log = console.log } = {}) {
  const data = loadData(src);
  const errors = validateData(data);
  if (errors.length) {
    throw new Error(`data যাচাইয়ে ${errors.length}টা ভুল:\n  - ${errors.join('\n  - ')}`);
  }

  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const files = walk(src);
  const skipped = [];
  const appsOut = data.apps.apps.map((a) => {
    const entry = a.entry || 'index.html';
    const exists = fs.existsSync(path.join(src, 'apps', a.dir, entry));
    const excluded = publicBuild && a.private;
    if (excluded && exists) skipped.push(a.id);
    return { ...a, available: exists && !excluded };
  });
  const excludedDirs = appsOut.filter((a) => publicBuild && a.private).map((a) => `apps/${a.dir}/`);

  for (const rel of files) {
    if (excludedDirs.some((d) => rel.startsWith(d))) continue;
    if (publicBuild && rel.startsWith('media/')) continue;
    if (/(^|\/)\.(DS_Store|gitkeep)$|(^|\/)(Thumbs\.db|desktop\.ini)$|\.bak$/i.test(rel)) continue;
    const from = path.join(src, rel);
    const to = path.join(out, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });

    const app = rel.startsWith('apps/') && /\.html?$/i.test(rel)
      ? appsOut.find((a) => rel.startsWith(`apps/${a.dir}/`))
      : null;
    if (app) {
      const depth = rel.split('/').length - 1;
      fs.writeFileSync(to, injectTopbar(fs.readFileSync(from, 'utf8'), '../'.repeat(depth), app));
    } else {
      fs.copyFileSync(from, to);
    }
  }

  // data: available flag সহ apps.json, আর search index
  fs.writeFileSync(path.join(out, 'data/apps.json'), JSON.stringify({ apps: appsOut }, null, 1));
  fs.writeFileSync(path.join(out, 'data/search-index.json'), JSON.stringify(buildSearchIndex({ ...data, apps: appsOut })));

  // service worker: shell precache (apps, media, tools বাদ; সেগুলো প্রথমবার খোলার পর cache হয়)
  const shellFiles = walk(out).filter((f) => !/^(apps|media|tools)\//.test(f) && f !== 'sw.js' && !f.endsWith('.md'));
  const hash = crypto.createHash('sha256');
  for (const f of shellFiles.sort()) hash.update(f).update(fs.readFileSync(path.join(out, f)));
  const version = hash.digest('hex').slice(0, 10);
  const precache = ['./', ...shellFiles.filter((f) => f !== 'index.html')].map((f) => (f === './' ? f : `./${f}`));
  const sw = fs.readFileSync(path.join(src, 'sw.js'), 'utf8')
    .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(version)};`)
    .replace('const PRECACHE = __PRECACHE__;', `const PRECACHE = ${JSON.stringify(precache)};`);
  fs.writeFileSync(path.join(out, 'sw.js'), sw);
  // GitHub Pages যেন _ দিয়ে শুরু হওয়া ফোল্ডার বাদ না দেয়
  fs.writeFileSync(path.join(out, '.nojekyll'), '');

  const live = appsOut.filter((a) => a.available).length;
  log(`✔ build শেষ → ${path.relative(process.cwd(), out) || out}`);
  log(`  version ${version} · ${walk(out).length}টা ফাইল · পুরনো app চালু ${live}/${appsOut.length}${publicBuild ? ` · public build (বাদ: ${skipped.length}টা private app)` : ''}`);
  return { version, appsOut, out };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    build({ publicBuild: process.env.PUBLIC_BUILD === '1' });
  } catch (e) {
    console.error(`✘ ${e.message}`);
    process.exit(1);
  }
}
