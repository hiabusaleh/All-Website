import { esc, bn, appCard } from '../shell/ui.js';

// প্ল্যান §৫: Learning Ladder — সব skill-এ একই.
export const LADDER = [
  { n: 0, name: 'Understand', bn: 'বোঝা', weight: null },
  { n: 1, name: 'Rule', bn: 'নিয়ম (ছক/skeleton)', weight: null },
  { n: 2, name: 'Guided', bn: 'hint সহ', weight: 20 },
  { n: 3, name: 'Blind', bn: 'hint ছাড়া', weight: 20 },
  { n: 4, name: 'Cambridge', bn: 'আসল প্রশ্নে', weight: 25 },
  { n: 5, name: 'Transfer', bn: 'নতুন item-এ', weight: 20 },
  { n: 6, name: 'Timed', bn: 'সময় ধরে', weight: 15 },
  { n: 7, name: 'Mastery Gate', bn: '≥ ৮৫%', weight: null },
];

const MODULE_BN = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

function statusBadge(s) {
  if (s === 'APPROVED') return '<span class="badge badge-ok">approved</span>';
  if (s === 'PENDING_SOURCE') return '<span class="badge badge-wait">উৎস থেকে আসা বাকি</span>';
  return `<span class="badge">${esc(s)}</span>`;
}

function skillLabel(s) {
  return s ? (s.name ? `${s.name}${s.bn ? ` · ${s.bn}` : ''}` : 'নাম এখনো আসেনি') : '';
}

export function renderSkills(ctx) {
  const skills = ctx.skills.skills;
  return `
    <header class="page-head accent-brand">
      <div class="hub-icon big" aria-hidden="true">🧠</div>
      <div>
        <p class="eyebrow">Skill Library</p>
        <h1>সব skill</h1>
        <p class="lead">প্রতিটা skill-এর একটাই canonical ID (যেমন <code>X-SK-004</code>)। বাকি তিন ব্যবস্থার ID (<code>R-S14</code>, <code>Skill_10</code>, …) alias হিসেবে থাকে, তাই যেকোনো নামে খুঁজলেই পাওয়া যায়।</p>
      </div>
    </header>
    <div class="panel notice">
      Skill Registry এখন শুরুর অবস্থায় আছে: শুধু প্ল্যানে দেওয়া skill-গুলো আছে। বাকিগুলো ধাপ ৩-এ Skill Map, Question Matrix আর 53-Skill course থেকে আসবে।
    </div>
    <section class="grid grid-3">
      ${skills.map((s) => `
        <a class="card" href="#/skill/${esc(s.id)}">
          <div class="card-sub mono">${esc(s.id)}</div>
          <div class="card-title">${esc(skillLabel(s))}</div>
          <div class="card-meta">${statusBadge(s.status)}${(s.modules || []).map((m) => `<span class="badge accent-${esc(m)}">${esc(MODULE_BN[m] || m)}</span>`).join('')}</div>
        </a>`).join('')}
    </section>`;
}

export function findSkill(ctx, idOrAlias) {
  const skills = ctx.skills.skills;
  return skills.find((s) => s.id === idOrAlias) || skills.find((s) => (s.aliases || []).includes(idOrAlias)) || null;
}

export function renderSkill(ctx, idOrAlias) {
  const s = findSkill(ctx, idOrAlias);
  if (!s) return null;
  const byId = (id) => ctx.skills.skills.find((x) => x.id === id);
  const apps = (s.apps || []).map((id) => ctx.apps.find((a) => a.id === id)).filter(Boolean);
  const ladder = s.ladder || {};

  return `
    <nav class="crumbs"><a href="#/skills">Skill Library</a> › ${esc(s.id)}</nav>
    <header class="page-head accent-brand">
      <div>
        <p class="eyebrow mono">${esc(s.id)}${s.level != null ? ` · Level ${bn(s.level)}` : ''}</p>
        <h1>${esc(s.name || 'নাম এখনো আসেনি')}</h1>
        ${s.bn ? `<p class="lead">${esc(s.bn)}</p>` : ''}
        <div class="card-meta">${statusBadge(s.status)}${(s.modules || []).map((m) => `<span class="badge accent-${esc(m)}">${esc(MODULE_BN[m] || m)}</span>`).join('')}</div>
      </div>
    </header>

    <section class="panel-row">
      <div class="panel">
        <h2>পরিচয়</h2>
        <dl class="facts">
          <dt>Alias</dt><dd>${(s.aliases || []).map((a) => `<code>${esc(a)}</code>`).join(' ') || '—'}</dd>
          <dt>আগে জানতে হবে</dt><dd>${(s.prerequisites || []).map((p) => `<a href="#/skill/${esc(p)}"><code>${esc(p)}</code> ${esc(byId(p)?.name || '')}</a>`).join(', ') || '—'}</dd>
          <dt>Question type</dt><dd>${(s.question_types || []).map((q) => `<code>${esc(q)}</code>`).join(' ') || '—'}</dd>
          <dt>Mastery</dt><dd>≥ ${bn(s.mastery_threshold ?? 85)}%</dd>
          <dt>Lesson-এর উৎস</dt><dd>${s.lesson_source ? `<code>${esc(s.lesson_source)}</code>` : '—'}</dd>
        </dl>
      </div>
      <div class="panel">
        <h2>Learning Ladder</h2>
        <table class="ladder">
          <thead><tr><th>Level</th><th>ধাপ</th><th>উৎস</th><th>ওজন</th></tr></thead>
          <tbody>
            ${LADDER.map((l) => `
              <tr>
                <td>${bn(l.n)}</td>
                <td><strong>${esc(l.name)}</strong><br><span class="muted">${esc(l.bn)}</span></td>
                <td>${esc(ladder[l.n] || '—')}</td>
                <td>${l.weight ? `${bn(l.weight)}%` : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <p class="muted">৮৫%-এর নিচে গেলে: Error Diagnosis → দুর্বল subskill → Targeted Practice → Retest।</p>
      </div>
    </section>

    ${apps.length ? `<h2 class="section-title">এখনকার অনুশীলন (পুরনো app)</h2><section class="grid grid-3">${apps.map(appCard).join('')}</section>` : ''}

    <div class="panel notice">
      বাংলা lesson, Guided/Blind অনুশীলন আর Mastery Gate এই পাতায় আসবে ধাপ ১০-এ (vertical slice)।
    </div>`;
}
