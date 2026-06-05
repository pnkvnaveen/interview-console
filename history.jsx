/* ===== History screen -- candidate archive ===== */
/* eslint-disable */

function HistoryScreen({ data, onLoad, onClose }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [copyingId, setCopyingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    apiFetch('/api/candidates')
      .then(r => r.json())
      .then(rows => { setCandidates(Array.isArray(rows) ? rows : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'created_at' ? 'desc' : 'asc'); }
  };

  const decisionLabel = { selected: 'selected', hold: 'on hold', rejected: 'rejected' };

  const filtered = candidates
    .filter(c => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      const dLabel = (decisionLabel[c.decision] || c.decision || '').toLowerCase();
      return (c.name || '').toLowerCase().includes(s) ||
             (c.tech || '').toLowerCase().includes(s) ||
             dLabel.includes(s);
    })
    .sort((a, b) => {
      let av = a[sortKey] || '';
      let bv = b[sortKey] || '';
      if (sortKey === 'stars') { av = Number(av) || 0; bv = Number(bv) || 0; }
      const cmp = typeof av === 'number' ? av - bv : av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleDelete = async () => {
    const id = deleteModal.id;
    try {
      await apiFetch(`/api/candidates/${id}`, { method: 'DELETE' });
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (e) {}
    setDeleteModal(null);
  };

  const handleLoad = async (candidate) => {
    setLoadingId(candidate.id);
    try {
      const res = await apiFetch(`/api/candidates/${candidate.id}/response`);
      const response = res.ok ? await res.json() : null;
      const session = {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          gender: candidate.gender || 'male',
          overall: candidate.overall_exp || '',
          powerbi: candidate.powerbi_exp || '',
          tech: candidate.tech || '',
          generalComments: candidate.general_comments || '',
        },
        grades: (response && response.grades) || {},
        notes: (response && response.notes) || {},
        status: (response && response.decision) || null,
        comments: (response && response.overall_comments) || '',
        stars: (response && response.stars) || 0,
        phase: 'interview',
      };
      onLoad(session);
    } catch (e) {
      setLoadingId(null);
    }
  };

  const handleCopyNotes = async (candidate) => {
    setCopyingId(candidate.id);
    try {
      const res = await apiFetch(`/api/candidates/${candidate.id}/response`);
      const response = res.ok ? await res.json() : null;
      const session = {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          gender: candidate.gender || 'male',
          overall: candidate.overall_exp || '',
          powerbi: candidate.powerbi_exp || '',
          tech: candidate.tech || '',
          generalComments: candidate.general_comments || '',
        },
        grades: (response && response.grades) || {},
        notes: (response && response.notes) || {},
        status: (response && response.decision) || null,
        comments: (response && response.overall_comments) || '',
        stars: (response && response.stars) || 0,
      };
      const summary = buildSummary(session, data);
      await navigator.clipboard.writeText(summary);
    } catch (e) {}
    setTimeout(() => setCopyingId(null), 1600);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="sort-icon neutral">↑</span>;
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const decisionBadge = (d) => {
    if (!d) return null;
    const map = { selected: { label: 'Selected', cls: 'badge-good' }, hold: { label: 'On Hold', cls: 'badge-avg' }, rejected: { label: 'Rejected', cls: 'badge-notok' } };
    const info = map[d] || { label: d, cls: '' };
    return <span className={'hist-badge ' + info.cls}>{info.label}</span>;
  };

  const starsDisplay = (n) => {
    if (!n) return <span className="hist-no-stars">—</span>;
    return <span className="hist-stars">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const cols = [
    { key: 'name', label: 'Candidate' },
    { key: 'overall_exp', label: 'Experience' },
    { key: 'tech', label: 'Technologies' },
    { key: 'decision', label: 'Decision' },
    { key: 'stars', label: 'Rating' },
    { key: 'created_at', label: 'Interviewed' },
  ];

  return (
    <div className="page-scroll fade-in">
      <div className="page-wrap" style={{ maxWidth: 1080 }}>
        <div className="eyebrow">Archive</div>
        <h1 className="page-title">Candidate history</h1>

        <div className="hist-toolbar">
          <div className="hist-search-wrap">
            <svg className="hist-search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="hist-search" placeholder="Search by name, tech, or decision…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="hist-count">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</span>
          <button className="tbtn ghost" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <Icon name="arrowLeft" size={15} /> Back
          </button>
        </div>

        {loading && (
          <div className="hist-empty-state">
            <div className="hist-empty-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/>
              </svg>
            </div>
            <p className="hist-empty-text">Loading…</p>
          </div>
        )}

        {!loading && candidates.length === 0 && (
          <div className="hist-empty-state">
            <div className="hist-empty-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z"/>
                <path d="M19 10v1a7 7 0 01-14 0v-1"/><path d="M12 19v3M9 22h6"/>
              </svg>
            </div>
            <h3 className="hist-empty-title">No interviews yet</h3>
            <p className="hist-empty-text">Candidates you interview will appear here. Start by setting up a new interview.</p>
          </div>
        )}

        {!loading && candidates.length > 0 && (
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  {cols.map(c => (
                    <th key={c.key} className={'hist-th' + (sortKey === c.key ? ' sorted' : '')}
                      onClick={() => handleSort(c.key)}>
                      {c.label} <SortIcon col={c.key} />
                    </th>
                  ))}
                  <th className="hist-th hist-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="hist-row">
                    <td className="hist-td hist-td-name">
                      <div className="hist-name">{c.name}</div>
                      <div className="hist-gender">
                        <Icon name={c.gender === 'female' ? 'female' : 'male'} size={11} />
                        {c.gender === 'female' ? 'Female' : 'Male'}
                      </div>
                    </td>
                    <td className="hist-td">
                      {c.overall_exp || c.powerbi_exp ? (
                        <span className="hist-exp">
                          {c.overall_exp ? c.overall_exp + ' yrs' : '—'}
                          {c.powerbi_exp ? <span className="hist-exp-pbi"> / {c.powerbi_exp} PBI</span> : null}
                        </span>
                      ) : <span className="hist-muted">—</span>}
                    </td>
                    <td className="hist-td hist-td-tech">
                      <span className="hist-tech">{c.tech || <span className="hist-muted">—</span>}</span>
                    </td>
                    <td className="hist-td">{decisionBadge(c.decision) || <span className="hist-muted">—</span>}</td>
                    <td className="hist-td">{starsDisplay(c.stars)}</td>
                    <td className="hist-td hist-td-date">{formatDate(c.created_at)}</td>
                    <td className="hist-td hist-td-actions">
                      <button className="hist-action-btn" title="Copy interview notes"
                        onClick={() => handleCopyNotes(c)}>
                        <Icon name={copyingId === c.id ? 'check' : 'copy'} size={14} />
                      </button>
                      <button className="hist-action-btn hist-action-load" title="Load and edit responses"
                        onClick={() => handleLoad(c)} disabled={loadingId === c.id}>
                        <Icon name="arrowRight" size={14} />
                      </button>
                      <button className="hist-action-btn hist-action-del" title="Delete candidate"
                        onClick={() => setDeleteModal(c)}>
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="hist-empty-state hist-empty-state--inline">
                        <div className="hist-empty-icon">
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                          </svg>
                        </div>
                        <p className="hist-empty-text">No candidates match <em>"{search}"</em></p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteModal && (
        <ConfirmModal
          title="Delete candidate?"
          message={`This will permanently delete "${deleteModal.name}" and all their interview responses. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
window.HistoryScreen = HistoryScreen;
