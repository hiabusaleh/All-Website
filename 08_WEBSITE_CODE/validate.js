import { stepPercent } from './src/shell/roadmap.js';

// data/*.json-এর নিয়ম যাচাই (প্ল্যান §৩: duplicate নেই, alias এক জায়গায়, অনুমানে ID নয়).
// build.js আর tests দুটোই এটা ব্যবহার করে. ফল: ভুলের তালিকা (খালি = ঠিক আছে).

export function validateData({ nav, apps, skills, questionTypes, roadmap }) {
  const errors = [];
  const err = (m) => errors.push(m);

  // Skill Registry
  const idRe = new RegExp(skills.id_pattern);
  const ids = new Set();
  const names = new Map();
  for (const s of skills.skills) {
    if (!idRe.test(s.id)) err(`skills: ID-এর ধরন ভুল: ${s.id}`);
    if (ids.has(s.id)) err(`skills: একই ID দুবার: ${s.id}`);
    ids.add(s.id);
    if (s.status === 'APPROVED' && !s.name) err(`skills: approved skill-এর নাম নেই: ${s.id}`);
    for (const a of s.aliases || []) {
      if (names.has(a)) err(`skills: alias ${a} দুটো skill-এ: ${names.get(a)}, ${s.id}`);
      names.set(a, s.id);
    }
    if (s.mastery_threshold != null && (s.mastery_threshold < 0 || s.mastery_threshold > 100)) {
      err(`skills: mastery_threshold 0–100 হতে হবে: ${s.id}`);
    }
  }
  for (const a of names.keys()) if (ids.has(a)) err(`skills: alias ${a} আবার canonical ID-ও`);
  const qtIds = new Set(questionTypes.question_types.map((q) => q.id));
  const appIds = new Set(apps.apps.map((a) => a.id));
  for (const s of skills.skills) {
    for (const p of s.prerequisites || []) if (!ids.has(p)) err(`skills: ${s.id}-এর prerequisite ${p} registry-তে নেই`);
    for (const q of s.question_types || []) if (!qtIds.has(q)) err(`skills: ${s.id}-এর question type ${q} নেই`);
    for (const a of s.apps || []) if (!appIds.has(a)) err(`skills: ${s.id}-এর app ${a} নেই`);
  }

  // Question types
  const seenQt = new Set();
  for (const q of questionTypes.question_types) {
    if (seenQt.has(q.id)) err(`question_types: একই ID দুবার: ${q.id}`);
    seenQt.add(q.id);
    for (const sk of [...(q.primary_skills || []), ...(q.secondary_skills || [])]) {
      if (sk !== 'UNMAPPED' && !ids.has(sk)) err(`question_types: ${q.id}-এর skill ${sk} registry-তে নেই`);
    }
  }

  // Apps
  const hubIds = new Set(nav.hubs.map((h) => h.id));
  const seenApp = new Set();
  const seenDir = new Set();
  for (const a of apps.apps) {
    if (seenApp.has(a.id)) err(`apps: একই ID দুবার: ${a.id}`);
    if (seenDir.has(a.dir)) err(`apps: একই dir দুবার: ${a.dir}`);
    seenApp.add(a.id);
    seenDir.add(a.dir);
    if (a.hub !== 'home' && !hubIds.has(a.hub)) err(`apps: ${a.id}-এর hub ${a.hub} nav-এ নেই`);
    if (!/^[a-z0-9][a-z0-9/-]*$/.test(a.dir)) err(`apps: ${a.id}-এর dir-এ শুধু ছোট হাতের অক্ষর, সংখ্যা, - আর / চলে`);
  }

  // Nav
  const seenHub = new Set();
  for (const h of nav.hubs) {
    if (seenHub.has(h.id)) err(`nav: একই hub দুবার: ${h.id}`);
    seenHub.add(h.id);
  }

  // Roadmap
  for (const s of roadmap.steps) {
    const p = stepPercent(s);
    if (!(p >= 0 && p <= 100)) err(`roadmap: ধাপ ${s.n}-এর percent 0–100 হতে হবে`);
    if (s.status === 'done' && p !== 100) err(`roadmap: ধাপ ${s.n} done, কিন্তু ${p}%`);
    if (s.status === 'todo' && p !== 0) err(`roadmap: ধাপ ${s.n} todo, কিন্তু ${p}%`);
  }

  return errors;
}
