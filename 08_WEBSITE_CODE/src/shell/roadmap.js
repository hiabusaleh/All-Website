// কাজের % হিসাব (data/roadmap.json থেকে). Home পাতা, build আর tests একই হিসাব ব্যবহার করে.

/** একটা ধাপের %: tasks থাকলে শেষ হওয়া task-এর ওজন দিয়ে, না থাকলে percent field. */
export function stepPercent(step) {
  if (step.status === 'done') return 100;
  if (Array.isArray(step.tasks) && step.tasks.length) {
    let total = 0, got = 0;
    for (const t of step.tasks) {
      const w = t.weight ?? 1;
      total += w;
      if (t.done) got += w;
    }
    return Math.round((got / total) * 100);
  }
  return step.percent || 0;
}

/** পুরো প্রজেক্টের % — প্রতিটা ধাপ তার weight অনুযায়ী গোনা হয়. */
export function overallPercent(roadmap) {
  let total = 0, got = 0;
  for (const s of roadmap.steps) {
    const w = s.weight ?? 1;
    total += w;
    got += w * stepPercent(s);
  }
  return total ? Math.round(got / total) : 0;
}
