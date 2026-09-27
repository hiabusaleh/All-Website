import { esc, bn, appCard, plannedList } from '../shell/ui.js';

// Reading, Listening, Speaking, Foundation, Writing আর পরিকল্পিত hub — সব একই কাঠামো:
// উপরে পরিচয়, তারপর Portal-এর পুরনো app, তারপর কোন ধাপে কী আসবে.
export function renderHub(ctx, id) {
  const hub = ctx.nav.hubs.find((h) => h.id === id);
  if (!hub) return null;
  const apps = ctx.apps.filter((a) => a.hub === id);
  const live = apps.filter((a) => a.available).length;

  let body = '';
  if (apps.length) {
    body += `
      <h2 class="section-title">পুরনো app (Portal)</h2>
      <p class="muted">${bn(live)}/${bn(apps.length)}টা চালু। Portal ধাপে এগুলো যেমন ছিল তেমনই চলে; উপরে শুধু সাইটের top bar থাকে।</p>
      <section class="grid grid-3">${apps.map(appCard).join('')}</section>`;
  } else if (hub.status === 'planned') {
    body += `
      <div class="panel notice">
        <strong>এই অংশ এখনো তৈরি হয়নি।</strong>
        ${hub.step ? `প্ল্যান অনুযায়ী এটা ধাপ ${bn(hub.step)}-এ তৈরি হবে।` : ''}
      </div>`;
  }

  if (hub.planned?.length) {
    body += `<h2 class="section-title">যা আসছে</h2>${plannedList(hub.planned)}`;
  }

  return `
    <header class="page-head accent-${esc(hub.accent)}">
      <div class="hub-icon big" aria-hidden="true">${hub.icon}</div>
      <div>
        <p class="eyebrow">${esc(hub.en)}</p>
        <h1>${esc(hub.title)}</h1>
        <p class="lead">${esc(hub.desc)}</p>
      </div>
    </header>
    ${body}`;
}
