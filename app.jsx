/* ===== App orchestrator + persistence ===== */
/* eslint-disable */
const LS_DATA = 'ibi_data_v2';
const LS_SESSION = 'ibi_session_v1';

function loadData() {
  try {
    const raw = localStorage.getItem(LS_DATA);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d) && d.length) return d; }
  } catch (e) {}
  return window.clone(window.DEFAULT_DATA);
}

function blankSession() {
  return {
    candidate: { id: null, name: '', gender: 'male', overall: '', powerbi: '', tech: '', generalComments: '' },
    grades: {}, notes: {}, status: null, comments: '', stars: 0, phase: 'setup'
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(LS_SESSION);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.candidate) {
        const blank = blankSession();
        return Object.assign({}, blank, s, {
          candidate: Object.assign({}, blank.candidate, s.candidate)
        });
      }
    }
  } catch (e) {}
  return blankSession();
}

/* ---- Edit candidate modal ---- */
function EditCandidateModal({ candidate, onSave, onClose }) {
  const [draft, setDraft] = useState(Object.assign({}, candidate));
  const set = (k, v) => setDraft(d => Object.assign({}, d, { [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Edit candidate info</div>

        <div className="field">
          <label className="field-label" htmlFor="ec-name">Full name</label>
          <input id="ec-name" className="input" value={draft.name || ''}
            onChange={e => set('name', e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Gender</label>
          <div className="seg">
            <button className={'seg-opt' + (draft.gender === 'male' ? ' active' : '')}
              onClick={() => set('gender', 'male')}>
              <Icon name="male" size={15} /> Male
            </button>
            <button className={'seg-opt' + (draft.gender === 'female' ? ' active' : '')}
              onClick={() => set('gender', 'female')}>
              <Icon name="female" size={15} /> Female
            </button>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="ec-overall">Overall experience <span className="field-hint">(years)</span></label>
            <input id="ec-overall" className="input" inputMode="decimal" value={draft.overall || ''}
              onChange={e => set('overall', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ec-pbi">Power BI experience <span className="field-hint">(years)</span></label>
            <input id="ec-pbi" className="input" inputMode="decimal" value={draft.powerbi || ''}
              onChange={e => set('powerbi', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ec-tech">Technologies</label>
          <input id="ec-tech" className="input" value={draft.tech || ''}
            onChange={e => set('tech', e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ec-gen">General comments</label>
          <textarea id="ec-gen" className="textarea" style={{ minHeight: 64 }}
            value={draft.generalComments || ''} onChange={e => set('generalComments', e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary modal-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => { onSave(draft); onClose(); }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(loadData);
  const [savedData, setSavedData] = useState(loadData);
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState('main');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [showEditCandidate, setShowEditCandidate] = useState(false);
  const saveTimer = useRef(null);

  // Load question bank from DB on mount
  useEffect(() => {
    apiFetch('/api/question-bank')
      .then(r => r.json())
      .then(serverData => {
        if (serverData && Array.isArray(serverData) && serverData.length > 0) {
          setData(serverData);
          setSavedData(serverData);
          localStorage.setItem(LS_DATA, JSON.stringify(serverData));
        } else {
          const current = loadData();
          apiFetch('/api/question-bank', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(current),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Persist session to localStorage
  useEffect(() => {
    localStorage.setItem(LS_SESSION, JSON.stringify(session));
  }, [session]);

  // Auto-save session to DB (debounced)
  useEffect(() => {
    const cid = session.candidate && session.candidate.id;
    if (!cid || session.phase === 'setup') return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(session), 900);
    return () => clearTimeout(saveTimer.current);
  }, [session.grades, session.notes, session.status, session.comments, session.stars]);

  const autoSave = async (s) => {
    const cid = s.candidate && s.candidate.id;
    if (!cid) return;
    setSaveStatus('saving');
    try {
      const res = await apiFetch(`/api/candidates/${cid}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: s.grades,
          notes: s.notes,
          decision: s.status || '',
          overall_comments: s.comments || '',
          stars: s.stars || 0,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  };

  const totalQ = data.reduce((n, t) => n + t.questions.length, 0);
  const gradedCount = Object.keys(session.grades).filter(id => session.grades[id]).length;

  const setPhase = (phase) => setSession(s => Object.assign({}, s, { phase }));
  const setCandidate = (candidate) => setSession(s => Object.assign({}, s, { candidate }));
  const setSessionField = (next) => setSession(next);

  const onGrade = (qid, val) => setSession(s => {
    const grades = Object.assign({}, s.grades);
    if (val == null) delete grades[qid]; else grades[qid] = val;
    return Object.assign({}, s, { grades });
  });
  const onNote = (qid, val) => setSession(s => {
    const notes = Object.assign({}, s.notes); notes[qid] = val;
    return Object.assign({}, s, { notes });
  });

  const startInterview = async () => {
    const c = session.candidate;
    const id = 'c-' + Math.random().toString(36).slice(2, 10);
    setSaveStatus('saving');
    try {
      const res = await apiFetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: c.name, gender: c.gender, overall: c.overall, powerbi: c.powerbi, tech: c.tech, generalComments: c.generalComments }),
      });
      if (res.ok) {
        setSession(s => Object.assign({}, s, {
          candidate: Object.assign({}, s.candidate, { id }),
          phase: 'interview'
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } else {
        throw new Error('create failed');
      }
    } catch {
      setSaveStatus('error');
      setSession(s => Object.assign({}, s, {
        candidate: Object.assign({}, s.candidate, { id }),
        phase: 'interview'
      }));
    }
    sessionStorage.removeItem('ibi_scroll');
  };

  const newInterview = () => {
    if (saveStatus === 'error') {
      if (!window.confirm('Auto-save failed for the current candidate. Starting a new interview will lose unsaved changes. Continue?')) return;
    }
    clearTimeout(saveTimer.current);
    sessionStorage.removeItem('ibi_scroll');
    setSession(blankSession());
    setView('main');
    setSaveStatus('idle');
  };

  const goHome = () => {
    clearTimeout(saveTimer.current);
    sessionStorage.removeItem('ibi_scroll');
    setSession(blankSession());
    setView('main');
    setSaveStatus('idle');
  };

  const handleSaveData = async (newData) => {
    setData(newData);
    setSavedData(newData);
    localStorage.setItem(LS_DATA, JSON.stringify(newData));
    try {
      await apiFetch('/api/question-bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (e) {}
  };

  const handleSaveCandidate = async (updated) => {
    setCandidate(updated);
    if (updated.id) {
      try {
        await apiFetch(`/api/candidates/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch (e) {}
    }
  };

  const loadFromHistory = (restoredSession) => {
    clearTimeout(saveTimer.current);
    sessionStorage.removeItem('ibi_scroll');
    setSession(restoredSession);
    setView('main');
    setSaveStatus('idle');
  };

  // ---- render ----
  if (view === 'settings') {
    return (
      <div className="app">
        <Topbar inSettings saveStatus={saveStatus} onHome={goHome} />
        <SettingsScreen data={data} savedData={savedData} onSave={handleSaveData} onClose={() => setView('main')} />
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="app">
        <Topbar inHistory phase={session.phase} candidate={session.candidate}
          gradedCount={gradedCount} totalQ={totalQ}
          saveStatus={saveStatus} onHome={goHome}
          onNew={newInterview} onSettings={() => setView('settings')} />
        <HistoryScreen data={data} onLoad={loadFromHistory} onClose={() => setView('main')} />
      </div>
    );
  }

  let body;
  if (session.phase === 'interview') {
    body = <InterviewScreen candidate={session.candidate} data={data}
      grades={session.grades} notes={session.notes} onGrade={onGrade} onNote={onNote}
      gradedCount={gradedCount} totalQ={totalQ} onFinish={() => setPhase('review')} />;
  } else if (session.phase === 'review') {
    body = <ReviewScreen session={session} data={data} onChange={setSessionField}
      onBack={() => setPhase('interview')} />;
  } else {
    body = <SetupScreen candidate={session.candidate} onChange={setCandidate}
      onStart={startInterview} totalQ={totalQ} totalT={data.length} />;
  }

  return (
    <div className="app">
      <Topbar
        phase={session.phase}
        candidate={session.candidate}
        gradedCount={gradedCount}
        totalQ={totalQ}
        saveStatus={saveStatus}
        onHome={goHome}
        onSettings={() => setView('settings')}
        onHistory={() => setView('history')}
        onNew={newInterview}
        onEditCandidate={() => setShowEditCandidate(true)}
      />
      {body}
      {showEditCandidate && (
        <EditCandidateModal
          candidate={session.candidate}
          onSave={handleSaveCandidate}
          onClose={() => setShowEditCandidate(false)}
        />
      )}
    </div>
  );
}

function Topbar({ phase, candidate, gradedCount, totalQ, saveStatus, onHome, onSettings, onHistory, onNew, onEditCandidate, inSettings, inHistory }) {
  const showEditCandidate = !inSettings && !inHistory && phase !== 'setup' && onEditCandidate;
  const showNew = !inSettings && phase !== 'setup' && onNew;
  const showCand = (phase === 'interview' || phase === 'review') && candidate && (candidate.name || '').trim();
  const pct = totalQ ? Math.round(((gradedCount || 0) / totalQ) * 100) : 0;

  const metaParts = [];
  if (candidate) {
    const exp = expPhrase(candidate.overall);
    if (exp) metaParts.push(exp.replace(' of experience', ''));
    if (candidate.tech) metaParts.push(candidate.tech);
  }
  const meta = metaParts.join(' · ');

  const progressBar = phase === 'interview' && showCand && (
    <div className="topbar-progress">
      <div className="topbar-pg-label"><span>Graded</span><b>{gradedCount} / {totalQ}</b></div>
      <div className="bar topbar-bar"><i style={{ width: pct + '%' }} /></div>
    </div>
  );

  return (
    <>
      <header className="topbar">
        <button className="brand brand-btn" onClick={onHome} title="Go to home">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z"/>
              <path d="M19 10v1a7 7 0 01-14 0v-1"/>
              <path d="M12 19v3M9 22h6"/>
            </svg>
          </div>
          <span className="brand-name">Interview Console</span>
        </button>

        {showCand && (
          <>
            <div className="topbar-divider" />
            <div className="topbar-cand-inline">
              <span className="topbar-cand-name">{(candidate.name || '').trim()}</span>
              {meta && <span className="topbar-cand-meta">{meta}</span>}
            </div>
          </>
        )}

        <div className="topbar-spacer" />

        {progressBar && <div className="topbar-progress-inline">{progressBar}</div>}

        {saveStatus === 'saving' && <span className="save-status saving">Saving…</span>}
        {saveStatus === 'saved' && <span className="save-status saved"><Icon name="check" size={13} /> Saved</span>}
        {saveStatus === 'error' && <span className="save-status error"><Icon name="warn" size={13} /> Save failed</span>}

        {showEditCandidate && (
          <button className="tbtn ghost" title="Edit candidate info" onClick={onEditCandidate}>
            <Icon name="user" size={16} />
          </button>
        )}
        {!inSettings && !inHistory && onHistory && (
          <button className="tbtn ghost" title="Candidate history" onClick={onHistory}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/>
              <path d="M12 7v5l4 2"/>
            </svg>
          </button>
        )}
        {showNew && (
          <button className="tbtn tbtn--new" onClick={onNew}>
            <Icon name="rotate" size={16} /><span className="tbtn-label"> New</span>
          </button>
        )}
        {!inSettings && onSettings && (
          <button className="tbtn" onClick={onSettings}>
            <Icon name="settings" size={16} /><span className="tbtn-label"> Settings</span>
          </button>
        )}
      </header>

      {showCand && (
        <div className="topbar-sub">
          <span className="topbar-cand-name">{(candidate.name || '').trim()}</span>
          {meta && <span className="topbar-cand-meta">{meta}</span>}
          <div className="topbar-spacer" />
          {progressBar}
        </div>
      )}
    </>
  );
}

/* ---- Auth gate ---- */
function Root() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('ibi_auth'));
  const [authRequired, setAuthRequired] = useState(null);

  useEffect(() => {
    if (authed) return;
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(({ required }) => setAuthRequired(!!required))
      .catch(() => setAuthRequired(false));
  }, [authed]);

  useEffect(() => {
    const handler = () => { setAuthed(false); setAuthRequired(true); };
    window.addEventListener('ibi:logout', handler);
    return () => window.removeEventListener('ibi:logout', handler);
  }, []);

  if (authed) return <App />;
  if (authRequired === null) return null;
  if (!authRequired) return <App />;
  return <LockScreen onAuth={() => setAuthed(true)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
