import { esc, bn } from '../shell/ui.js';
import { stepPercent, overallPercent } from '../shell/roadmap.js';

const STATUS = { done: '✅ শেষ', started: '🟡 চলছে', todo: '⚪ বাকি' };

export function renderRoadmap(ctx) {
  const { roadmap } = ctx;
  const pct = overallPercent(roadmap);
  return `
    <header class="page-head accent-brand">
      <div class="hub-icon big" aria-hidden="true">🗺️</div>
      <div>
        <p class="eyebrow">Roadmap · প্ল্যান §৮</p>
        <h1>কাজ কত দূর: ${bn(pct)}%</h1>
        <p class="lead">প্রতিটা ধাপ তার আকার (ওজন) অনুযায়ী মোট %-এ গোনা হয়। শেষ হালনাগাদ: ${esc(roadmap.updated || '')}</p>
      </div>
    </header>
    <div class="meter big" aria-hidden="true"><div class="meter-fill" style="width:${pct}%"></div><span class="meter-label">${bn(pct)}%</span></div>
    <ol class="steps">
      ${roadmap.steps.map((s) => {
        const p = stepPercent(s);
        return `
        <li class="step-card rm-${esc(s.status)}">
          <div class="step-head">
            <span class="step-n">${bn(s.n)}</span>
            <strong>${esc(s.title)}</strong>
            <span class="badge">${STATUS[s.status] || esc(s.status)}</span>
            <span class="step-pct">${bn(p)}%</span>
          </div>
          <div class="meter thin" aria-hidden="true"><div class="meter-fill" style="width:${p}%"></div></div>
          ${s.where ? `<p class="muted">কোথায়: ${esc(s.where)}</p>` : ''}
          ${s.tasks?.length ? `<ul class="tasks">${s.tasks.map((t) => `<li class="${t.done ? 'is-done' : ''}">${t.done ? '☑' : '☐'} ${esc(t.title)}</li>`).join('')}</ul>` : ''}
        </li>`;
      }).join('')}
    </ol>`;
}
