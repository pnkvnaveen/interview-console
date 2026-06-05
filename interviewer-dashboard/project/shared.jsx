/* ===== Shared UI bits + summary builder ===== */
/* eslint-disable */
const { useState, useEffect, useRef, useCallback } = React;

/* ---- Inline line icons (Lucide-style, 2px stroke) ---- */
function Icon({ name, size }) {
  const s = size || 18;
  const paths = {
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z|M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
    copy: 'M9 9h11a2 2 0 012 2v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9a2 2 0 012-2z|M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
    check: 'M20 6L9 17l-5-5',
    note: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7|M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
    up: 'M18 15l-6-6-6 6',
    down: 'M6 9l6 6 6-6',
    rotate: 'M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8|M3 3v5h5',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2|M12 11a4 4 0 100-8 4 4 0 000 8z',
  };
  const d = (paths[name] || '').split('|');
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

/* ---- pronoun + experience formatting ---- */
function pronoun(gender) { return gender === 'female' ? 'she/her' : 'he/him'; }

function expPhrase(years) {
  const n = (years || '').toString().trim();
  if (!n) return '';
  const isOne = n === '1';
  return n + (isOne ? ' year' : ' years') + ' of experience';
}

/* ---- Build the copyable plain-text notes (handwritten style) ---- */
function buildSummary(session, data) {
  const c = session.candidate || {};
  const lines = [];

  // Header: name + pronoun
  const nm = (c.name || '').trim() || 'Candidate';
  lines.push(nm + ' (' + pronoun(c.gender) + ')');
  lines.push('');

  // experience line
  const overall = expPhrase(c.overall);
  if (overall) {
    let exp = overall;
    const pbi = (c.powerbi || '').toString().trim();
    if (pbi) exp += '  ·  ' + pbi + ' yrs Power BI';
    lines.push(exp);
  }
  // technologies
  const tech = (c.tech || '').trim();
  if (tech) lines.push('has experience in ' + tech);
  if (overall || tech) lines.push('');

  // graded questions only, in topic order
  const sumMap = {}; window.GRADES.forEach(g => sumMap[g.key] = g.sum);
  let any = false;
  data.forEach(topic => {
    topic.questions.forEach(qq => {
      const g = session.grades[qq.id];
      if (!g) return; // skipped — omit entirely
      any = true;
      const note = (session.notes[qq.id] || '').trim();
      let line = qq.label + ' - ' + sumMap[g];
      if (note) line += '  (' + note + ')';
      lines.push(line);
    });
  });
  if (!any) lines.push('(no questions graded yet)');

  // verdict line
  const stMap = { selected: 'selected', hold: 'on hold', rejected: 'rejected' };
  if (session.status) {
    lines.push('');
    const overallComment = (session.comments || '').trim();
    lines.push(stMap[session.status] + (overallComment ? ' - ' + overallComment : ''));
  }

  return lines.join('\n');
}

window.Icon = Icon;
window.pronoun = pronoun;
window.expPhrase = expPhrase;
window.buildSummary = buildSummary;
