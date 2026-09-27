// Platform shell: data লোড, hash router, top bar, settings panel, search, migration, service worker.
import { storage } from './store.js';
import { migrate } from './migrate.js';
import { initTheme, applyTheme, applySize, THEMES, FONT_SIZES, currentTheme, currentSize } from './theme.js';
import { loadIndex } from './search.js';
import { esc, hubRoute } from './ui.js';
import { renderHome } from '../hubs/home.js';
import { renderHub } from '../hubs/hub.js';
import { renderSkills, renderSkill } from '../hubs/skills.js';
import { renderProgress, bindProgress } from '../hubs/progress.js';
import { renderSearch } from '../hubs/search.js';
import { renderRoadmap } from '../hubs/roadmap.js';

initTheme();
try { migrate(storage); } catch (e) { console.warn('migration failed', e); }

const view = document.getElementById('view');
const ctx = {};

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [path, qs = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(qs) };
}

function notFound() {
  return `<div class="panel notice"><h1>পাতা পাওয়া যায়নি</h1><p><a href="#/">Home-এ ফিরুন</a></p></div>`;
}

const HUB_ALIASES = { skills: '#/skills', progress: '#/progress' };

function route() {
  const { parts, params } = parseHash();
  const [first, second] = parts;
  let html = null;
  let after = null;
  let active = first || 'home';

  if (!first) html = renderHome(ctx);
  else if (first === 'hub' && second) {
    if (HUB_ALIASES[second]) { location.replace(HUB_ALIASES[second]); return; }
    html = renderHub(ctx, second);
    active = second;
  } else if (first === 'skills') html = renderSkills(ctx);
  else if (first === 'roadmap') html = renderRoadmap(ctx);
  else if (first === 'skill' && second) { html = renderSkill(ctx, second); active = 'skills'; }
  else if (first === 'progress') {
    html = renderProgress();
    after = () => bindProgress(view, route);
  } else if (first === 'search') {
    const q = params.get('q') || '';
    html = renderSearch(ctx, q);
    const box = document.getElementById('q');
    if (box && document.activeElement !== box) box.value = q;
  }

  view.innerHTML = html ?? notFound();
  after?.();
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === active);
  });
  const h1 = view.querySelector('h1');
  document.title = h1 && first ? `${h1.textContent} · IELTS Master` : 'IELTS Master Platform';
  window.scrollTo(0, 0);
}

function buildNav() {
  const nav = document.getElementById('hubnav');
  nav.innerHTML = [
    '<a href="#/" data-nav="home">🏠 Home</a>',
    ...ctx.nav.hubs.map((h) => `<a href="${esc(hubRoute(h))}" data-nav="${esc(h.id)}">${h.icon} ${esc(h.title)}</a>`),
  ].join('');
}

function buildSettings() {
  const dlg = document.getElementById('settings');
  dlg.querySelector('[data-theme-list]').innerHTML = THEMES.map((t) =>
    `<label class="chip"><input type="radio" name="theme" value="${t.id}" ${t.id === currentTheme() ? 'checked' : ''}> ${esc(t.label)}</label>`).join('');
  dlg.querySelector('[data-size-list]').innerHTML = FONT_SIZES.map((s) =>
    `<label class="chip"><input type="radio" name="size" value="${s.id}" ${s.id === currentSize() ? 'checked' : ''}> ${esc(s.label)}</label>`).join('');
  dlg.addEventListener('change', (e) => {
    if (e.target.name === 'theme') applyTheme(e.target.value);
    if (e.target.name === 'size') applySize(e.target.value);
  });
  document.getElementById('open-settings').addEventListener('click', () => dlg.showModal());
  dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
}

function bindSearch() {
  const form = document.getElementById('searchform');
  const box = document.getElementById('q');
  let t;
  box.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const q = box.value.trim();
      if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`;
    }, 200);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    location.hash = `#/search?q=${encodeURIComponent(box.value.trim())}`;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      box.focus();
    }
  });
}

async function start() {
  try {
    const [nav, apps, skills, roadmap, searchIndex] = await Promise.all([
      loadJSON('data/nav.json'),
      loadJSON('data/apps.json'),
      loadJSON('data/skills.json'),
      loadJSON('data/roadmap.json'),
      loadIndex('data/search-index.json'),
    ]);
    Object.assign(ctx, { nav, apps: apps.apps, skills, roadmap, searchIndex });
  } catch (e) {
    view.innerHTML = `<div class="panel notice warn"><h1>ডেটা লোড হয়নি</h1><p>${esc(e.message)}</p><p class="muted">সাইটটা <code>node serve.js</code> দিয়ে চালান; ফাইল হিসেবে সরাসরি খুললে browser JSON পড়তে দেয় না।</p></div>`;
    return;
  }
  buildNav();
  buildSettings();
  bindSearch();
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

start();
