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
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7|M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    mic: 'M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z|M19 10v1a7 7 0 01-14 0v-1|M12 19v3|M9 22h6',
    male: 'M12 8a4 4 0 100 8 4 4 0 000-8z|M16 4h4v4|M19.5 4.5l-5 5',
    female: 'M12 6a4 4 0 100 8 4 4 0 000-8z|M12 14v6|M9.5 18h5',
    warn: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z|M12 9v4|M12 17h.01',
    cloud: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
  };
  const d = (paths[name] || '').split('|');
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

/* ---- Star rating component ---- */
function StarRating({ value, onChange, readOnly }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={'star-rating' + (readOnly ? ' readonly' : '')}>
      {stars.map(i => (
        <button key={i} type="button"
          className={'star-btn' + (i <= (hover || value) ? ' filled' : '')}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange(i === value ? 0 : i)}
          disabled={readOnly}>
          ★
        </button>
      ))}
      {value > 0 && !readOnly && (
        <span className="star-label">{['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][value]}</span>
      )}
    </div>
  );
}

/* ---- Auto-resize textarea for settings ---- */
function AutoResizeTextarea({ className, value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.max(36, ref.current.scrollHeight) + 'px';
    }
  }, [value]);
  return (
    <textarea ref={ref} className={className} value={value}
      placeholder={placeholder} rows={1}
      style={{ resize: 'none', overflow: 'hidden', lineHeight: '1.45' }}
      onChange={onChange} />
  );
}

/* ---- Generic confirm modal ---- */
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-body">{message}</div>
        <div className="modal-actions">
          <button className="btn-secondary modal-cancel" onClick={onCancel}>Cancel</button>
          <button className={'btn-primary' + (danger ? ' danger-btn' : '')} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
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

/* ---- Build the copyable plain-text notes ---- */
function buildSummary(session, data) {
  const c = session.candidate || {};
  const lines = [];

  const nm = (c.name || '').trim() || 'Candidate';
  lines.push(nm + ' (' + pronoun(c.gender) + ')');
  lines.push('');

  const overall = expPhrase(c.overall);
  if (overall) {
    let exp = overall;
    const pbi = (c.powerbi || '').toString().trim();
    if (pbi) exp += '  /  ' + pbi + ' yrs Power BI';
    lines.push(exp);
  }
  const tech = (c.tech || '').trim();
  if (tech) lines.push('has experience in ' + tech);
  const genComments = (c.generalComments || '').trim();
  if (genComments) lines.push('notes: ' + genComments);
  if (overall || tech || genComments) lines.push('');

  const sumMap = {}; window.GRADES.forEach(g => sumMap[g.key] = g.sum);
  let any = false;
  data.forEach(topic => {
    topic.questions.forEach(qq => {
      const g = session.grades[qq.id];
      if (!g) return;
      any = true;
      const note = (session.notes[qq.id] || '').trim();
      let line = qq.label + ' - ' + sumMap[g];
      if (note) line += '  (' + note + ')';
      lines.push(line);
    });
  });
  if (!any) lines.push('(no questions graded yet)');

  if (session.stars) {
    lines.push('');
    lines.push('rating: ' + '★'.repeat(session.stars) + '☆'.repeat(5 - session.stars));
  }

  const stMap = { selected: 'selected', hold: 'on hold', rejected: 'rejected' };
  if (session.status) {
    lines.push('');
    const overallComment = (session.comments || '').trim();
    lines.push(stMap[session.status] + (overallComment ? ' - ' + overallComment : ''));
  }

  return lines.join('\n');
}

/* ---- Auth-aware fetch helper ---- */
window.apiFetch = function(url, opts) {
  const token = sessionStorage.getItem('ibi_auth');
  const headers = Object.assign({}, (opts && opts.headers) || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, Object.assign({}, opts, { headers })).then(function(r) {
    if (r.status === 401) {
      sessionStorage.removeItem('ibi_auth');
      window.dispatchEvent(new CustomEvent('ibi:logout'));
    }
    return r;
  });
};

window.Icon = Icon;
window.StarRating = StarRating;
window.AutoResizeTextarea = AutoResizeTextarea;
window.ConfirmModal = ConfirmModal;
window.pronoun = pronoun;
window.expPhrase = expPhrase;
window.buildSummary = buildSummary;
