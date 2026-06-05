/* ===== Review screen — verdict + copyable summary ===== */
/* eslint-disable */
function ReviewScreen({ session, data, onChange, onBack, onNewInterview }) {
  const [copied, setCopied] = useState(false);
  const setStatus = (s) => onChange(Object.assign({}, session, { status: session.status === s ? null : s }));
  const setComments = (v) => onChange(Object.assign({}, session, { comments: v }));

  const summary = buildSummary(session, data);

  // grade tallies
  const tally = { notok: 0, avg: 0, ok: 0, good: 0 };
  const sumToTone = {}; window.GRADES.forEach(g => sumToTone[g.key] = g.tone);
  let graded = 0;
  data.forEach(t => t.questions.forEach(q => {
    const g = session.grades[q.id];
    if (g) { graded++; tally[sumToTone[g]]++; }
  }));

  const copy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    });
  };

  const statuses = [
    { id: 'selected', label: 'Selected' },
    { id: 'hold', label: 'On Hold' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="page-scroll fade-in">
      <div className="page-wrap">
        <button className="tbtn ghost" style={{ marginBottom: 20, paddingLeft: 0 }} onClick={onBack}>
          <Icon name="arrowLeft" size={16} /> Back to questions
        </button>

        <div className="eyebrow">Final assessment</div>
        <h1 className="page-title">{(session.candidate.name || '').trim() || 'Candidate'}</h1>

        <div className="review-stats">
          <div className="rstat"><b>{graded}</b><span>graded</span></div>
          <div className="rstat" data-tone="good"><b>{tally.good}</b><span>Good</span></div>
          <div className="rstat" data-tone="ok"><b>{tally.ok}</b><span>OK</span></div>
          <div className="rstat" data-tone="avg"><b>{tally.avg}</b><span>Avg</span></div>
          <div className="rstat" data-tone="notok"><b>{tally.notok}</b><span>Not OK</span></div>
        </div>

        <div className="field">
          <label className="field-label">Decision</label>
          <div className="status-grid">
            {statuses.map(s => (
              <button key={s.id} className={'status-card' + (session.status === s.id ? ' on' : '')}
                data-st={s.id} onClick={() => setStatus(s.id)}>
                <div className="sc-dot" />
                <div className="sc-label">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="f-comments">Overall comments</label>
          <textarea id="f-comments" className="textarea" style={{ minHeight: 96 }}
            placeholder="e.g. has knowledge in power bi, okay for mid level role."
            value={session.comments || ''} onChange={e => setComments(e.target.value)} />
        </div>

        <div className="summary-block">
          <div className="summary-head">
            <h3>Interview notes, ready to copy</h3>
            <button className={'copy-btn' + (copied ? ' done' : '')} onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              {copied ? 'Copied' : 'Copy notes'}
            </button>
          </div>
          <pre className="code">{summary}</pre>
        </div>

        <div className="set-actions">
          <button className="btn-secondary" onClick={onNewInterview}>
            <Icon name="rotate" size={16} /> New interview
          </button>
        </div>
      </div>
    </div>
  );
}
window.ReviewScreen = ReviewScreen;
