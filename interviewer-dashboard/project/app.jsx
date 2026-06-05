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
  return { candidate: { name: '', gender: 'male', overall: '', powerbi: '', tech: '' },
    grades: {}, notes: {}, status: null, comments: '', phase: 'setup' };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(LS_SESSION);
    if (raw) { const s = JSON.parse(raw); if (s && s.candidate) return Object.assign(blankSession(), s); }
  } catch (e) {}
  return blankSession();
}

function App() {
  const [data, setData] = useState(loadData);
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState('main'); // 'main' | 'settings'

  useEffect(() => { localStorage.setItem(LS_DATA, JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem(LS_SESSION, JSON.stringify(session)); }, [session]);

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

  const newInterview = () => {
    if (gradedCount > 0 || (session.candidate.name || '').trim()) {
      if (!window.confirm('Start a fresh interview? The current candidate and grades will be cleared.')) return;
    }
    sessionStorage.removeItem('ibi_scroll');
    setSession(blankSession());
    setView('main');
  };

  // ----- render -----
  if (view === 'settings') {
    return (
      <div className="app">
        <Topbar onSettings={null} onNew={null} inSettings />
        <SettingsScreen data={data} onSave={setData} onClose={() => setView('main')} />
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
      onBack={() => setPhase('interview')} onNewInterview={newInterview} />;
  } else {
    body = <SetupScreen candidate={session.candidate} onChange={setCandidate}
      onStart={() => setPhase('interview')} totalQ={totalQ} totalT={data.length} />;
  }

  return (
    <div className="app">
      <Topbar phase={session.phase} onSettings={() => setView('settings')} onNew={newInterview} />
      {body}
    </div>
  );
}

function Topbar({ phase, onSettings, onNew, inSettings }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">i</div>
        <div>
          <span className="brand-name">Interview Console</span>
          <span className="brand-sub">· Power BI</span>
        </div>
      </div>
      <div className="topbar-spacer" />
      {!inSettings && phase !== 'setup' && (
        <button className="tbtn ghost" onClick={onNew}><Icon name="rotate" size={16} /> New</button>
      )}
      {!inSettings && (
        <button className="tbtn" onClick={onSettings}><Icon name="settings" size={16} /> Settings</button>
      )}
    </header>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
