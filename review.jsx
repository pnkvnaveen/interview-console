/* ===== Review screen -- verdict + copyable summary ===== */
/* eslint-disable */
function ReviewScreen({ session, data, onChange, onBack }) {
  const [copied, setCopied] = useState(false);
  const setStatus = (s) => onChange(Object.assign({}, session, { status: session.status === s ? null : s }));
  const setComments = (v) => onChange(Object.assign({}, session, { comments: v }));
  const setStars = (v) => onChange(Object.assign({}, session, { stars: v }));

  const summary = buildSummary(session, data);

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

        <div className="field">
          <label className="field-label">Decision</label>
          <div className="status-grid">
            {statuses.map(s => (
              <button key={s.id} className={'status-card' + (session.status === s.id ? ' on' : '')}
                data-st={s.id} onClick={() => setStatus(s.id)}>
                <div className="sc-label">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Overall rating</label>
          <StarRating value={session.stars || 0} onChange={setStars} />
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

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a href="https://gemini.google.com/gem/80c8bc334583" target="_blank" rel="noopener noreferrer"
            className="btn-gemini">
            <img src="/gemini-icon.svg" width="20" height="20" alt="Gemini" style={{ display: 'block', flexShrink: 0 }} />
            Feedback Generator
          </a>
        </div>
      </div>
    </div>
  );
}
window.ReviewScreen = ReviewScreen;
