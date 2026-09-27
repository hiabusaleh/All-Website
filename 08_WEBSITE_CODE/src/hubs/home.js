import { esc, bn, hubRoute, appCard } from '../shell/ui.js';
import { allKeys, moduleOf } from '../shell/store.js';
import { overallPercent } from '../shell/roadmap.js';

const MAIN = ['reading', 'listening', 'writing', 'speaking'];

function savedCounts() {
  const counts = { reading: 0, listening: 0, speaking: 0, vocab: 0, writing: 0 };
  for (const k of allKeys()) {
    // নতুন key গোনা হয়; পুরনো কপি দুবার গোনা হবে না
    if (!/^[LRSVW]\./.test(k)) continue;
    const m = moduleOf(k);
    if (m in counts) counts[m]++;
  }
  return counts;
}

export function renderHome(ctx) {
  const { nav, apps, roadmap } = ctx;
  const counts = savedCounts();
  const hubs = nav.hubs;
  const main = hubs.filter((h) => MAIN.includes(h.id));
  const rest = hubs.filter((h) => !MAIN.includes(h.id));
  const liveApps = apps.filter((a) => a.available).length;
  const next = roadmap.steps.find((s) => s.status !== 'done');
  const done = roadmap.steps.filter((s) => s.status === 'done').length;
  const pct = overallPercent(roadmap);
  const extra = apps.filter((a) => a.hub === 'home');

  return `
  <section class="hero">
    <p class="eyebrow">এক Website · চার Hub · Skill-First · Cambridge-Integrated</p>
    <h1>IELTS Master Platform</h1>
    <p class="lead">IELTS materials-ওয়ালা website নয়; একটা IELTS learning system, যার একটা website আছে।</p>
    <p class="equation">Skill → Learn → Practice → Apply → Diagnose → Repair → Transfer → Master</p>
  </section>

  <section class="grid grid-4">
    ${main.map((h) => `
      <a class="card card-hub accent-${esc(h.accent)}" href="${esc(hubRoute(h))}">
        <div class="hub-icon" aria-hidden="true">${h.icon}</div>
        <div class="card-title">${esc(h.title)}</div>
        <div class="card-sub">${esc(h.desc)}</div>
        <div class="card-meta">${h.id in counts ? `<span class="badge">${bn(counts[h.id])}টা সংরক্ষিত progress</span>` : ''}</div>
      </a>`).join('')}
  </section>

  <section class="panel-row">
    <div class="panel">
      <h2>আজকের কাজ</h2>
      <p>পরের ধাপ: <strong>ধাপ ${bn(next?.n ?? '')} · ${esc(next?.title ?? 'সব শেষ')}</strong></p>
      <p class="muted">দুর্বল skill আর আজকের practice দেখানো শুরু হবে Error Lab (ধাপ ৯) আর Mastery Gate (ধাপ ১০) তৈরি হলে।</p>
      <a class="btn" href="#/skill/X-SK-004">প্রথম skill: Paraphrase Recognition →</a>
    </div>
    <div class="panel">
      <h2>কাজ কত দূর</h2>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="পুরো প্রজেক্ট">
        <div class="meter-fill" style="width:${pct}%"></div><span class="meter-label">${bn(pct)}%</span>
      </div>
      <div class="stat-row">
        <div class="stat"><span class="stat-n">${bn(done)}/${bn(roadmap.steps.length)}</span><span class="stat-l">ধাপ শেষ</span></div>
        <div class="stat"><span class="stat-n">${bn(liveApps)}/${bn(apps.length)}</span><span class="stat-l">পুরনো app চালু</span></div>
        <div class="stat"><span class="stat-n">${bn(ctx.skills.skills.filter((s) => s.status === 'APPROVED').length)}</span><span class="stat-l">approved skill</span></div>
      </div>
      <a class="btn btn-ghost" href="#/roadmap">প্রতিটা ধাপের হিসাব →</a>
    </div>
  </section>

  <h2 class="section-title">সব অংশ</h2>
  <section class="grid grid-5">
    ${rest.map((h) => `
      <a class="card card-mini accent-${esc(h.accent)}" href="${esc(hubRoute(h))}">
        <span class="hub-icon" aria-hidden="true">${h.icon}</span>
        <span class="card-title">${esc(h.title)}</span>
        <span class="card-sub">${h.status === 'live' ? 'চালু' : h.step ? `ধাপ ${bn(h.step)}-এ আসবে` : ''}</span>
      </a>`).join('')}
  </section>

  ${extra.length ? `<h2 class="section-title">অন্যান্য</h2><section class="grid grid-3">${extra.map(appCard).join('')}</section>` : ''}
  `;
}
