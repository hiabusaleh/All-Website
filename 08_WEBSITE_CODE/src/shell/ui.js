// ছোট HTML helper — সব view string template দিয়ে তৈরি, তাই escape জরুরি.

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export function bn(n) {
  return String(n).replace(/\d/g, (d) => BN_DIGITS[d]);
}

export function appHref(app) {
  return `apps/${app.dir}/${app.entry || 'index.html'}`;
}

export function hubRoute(hub) {
  return hub.route || `#/hub/${hub.id}`;
}

export function appCard(app) {
  const badges = [];
  if (app.private) badges.push('<span class="badge badge-lock" title="Cambridge বা তৃতীয় পক্ষের content; public launch-এর আগে অনুমতি লাগবে">🔒 private</span>');
  if (app.count) badges.push(`<span class="badge">${bn(app.count.toLocaleString('en-US'))}</span>`);
  const body = `
    <div class="card-title">${esc(app.title)}</div>
    <div class="card-sub">${esc(app.sub || '')}</div>
    <div class="card-meta">${badges.join('')}${app.available ? '<span class="badge badge-ok">চালু</span>' : '<span class="badge badge-wait">upload বাকি</span>'}</div>`;
  if (app.available) {
    return `<a class="card card-app" href="${esc(appHref(app))}">${body}</a>`;
  }
  const where = app.source
    ? `উৎস: G:\\IELTS\\${esc(app.source.replace(/\//g, '\\'))}<br>রাখতে হবে: src/apps/${esc(app.dir)}/`
    : 'উৎস ফাইল এখনো চিহ্নিত হয়নি।';
  return `<div class="card card-app is-missing" tabindex="0">${body}<div class="card-hint">${where}</div></div>`;
}

export function plannedList(items) {
  if (!items?.length) return '';
  return `<ul class="planned">${items
    .map((p) => `<li><span class="step">ধাপ ${bn(p.step)}</span>${esc(p.title)}</li>`)
    .join('')}</ul>`;
}
