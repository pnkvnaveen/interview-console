/* ===== Interview screen — faded wheel-style scroll + question cards ===== */
/* eslint-disable */
function QuestionCard({ q, index, grade, note, onGrade, onNote }) {
  const [showNote, setShowNote] = useState(!!(note && note.length));
  useEffect(() => { if (note && note.length) setShowNote(true); }, [note]);

  return (
    <div className={'q-card' + (grade ? ' graded' : '')}>
      <div className="q-top">
        <span className="q-num">{index}</span>
        <div className="q-text">
          {q.text}
          <span className="q-label">{q.label}</span>
        </div>
      </div>

      <div className="q-grade" role="radiogroup" aria-label="grade">
        {window.GRADES.map(g => (
          <button key={g.key} className={'grade-btn' + (grade === g.key ? ' on' : '')}
            data-tone={g.tone} role="radio" aria-checked={grade === g.key}
            onClick={() => onGrade(grade === g.key ? null : g.key)}>
            {g.key}
          </button>
        ))}
      </div>

      <div className="q-note-row">
        <button className="note-toggle" onClick={() => setShowNote(s => !s)}>
          <Icon name="note" size={14} />
          {showNote ? 'Hide note' : (note ? 'Note added' : 'Add note')}
        </button>
      </div>
      {showNote && (
        <textarea className="textarea q-note" placeholder="Anything worth recording: examples given, depth, hesitation"
          value={note || ''} onChange={e => onNote(e.target.value)} />
      )}
    </div>
  );
}

function InterviewScreen({ candidate, data, grades, notes, onGrade, onNote, gradedCount, totalQ, onFinish }) {
  const scrollRef = useRef(null);

  // restore scroll position
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const saved = parseFloat(sessionStorage.getItem('ibi_scroll') || '0');
    if (saved) el.scrollTop = saved;
    const onScroll = () => sessionStorage.setItem('ibi_scroll', String(el.scrollTop));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const pct = totalQ ? Math.round((gradedCount / totalQ) * 100) : 0;
  const exp = expPhrase(candidate.overall);

  return (
    <div className="iv-root fade-in">
      <div className="iv-head">
        <div className="iv-head-inner">
          <div className="iv-cand">
            <div className="iv-name">{(candidate.name || '').trim() || 'Candidate'}</div>
            <div className="iv-meta">
              {exp ? <span><b>{exp.replace(' of experience','')}</b> experience</span> : <span>experience not set</span>}
              {candidate.tech ? <span> · {candidate.tech}</span> : null}
            </div>
          </div>
          <div className="iv-progress-wrap">
            <div className="iv-progress-top"><span>Graded</span><b>{gradedCount} / {totalQ}</b></div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
          </div>
        </div>
      </div>

      <div className="iv-scroll" ref={scrollRef}>
        <div className="iv-track">
          {data.map(topic => {
            const done = topic.questions.filter(q => grades[q.id]).length;
            return (
              <section key={topic.id}>
                <div className="topic-head">
                  <h2 className="topic-title">{topic.name}</h2>
                  <span className="topic-count">{done}/{topic.questions.length}</span>
                  <span className="topic-rule" />
                </div>
                {topic.questions.map((q, i) => (
                  <QuestionCard key={q.id} q={q} index={i + 1}
                    grade={grades[q.id]} note={notes[q.id]}
                    onGrade={v => onGrade(q.id, v)} onNote={v => onNote(q.id, v)} />
                ))}
              </section>
            );
          })}

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button className="btn-primary" onClick={onFinish}>
              Finish &amp; review <Icon name="arrowRight" />
            </button>
            <div style={{ color: 'var(--faint)', fontSize: 13, marginTop: 12 }}>
              {gradedCount} of {totalQ} graded · ungraded questions are skipped in the summary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.InterviewScreen = InterviewScreen;
