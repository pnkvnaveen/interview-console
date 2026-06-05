/* ===== Settings / Admin — manage topics & questions ===== */
/* eslint-disable */
function SettingsScreen({ data, onSave, onClose }) {
  const [draft, setDraft] = useState(() => window.clone(data));
  const [saved, setSaved] = useState(false);
  const dragInfo = useRef(null);

  const mutate = (fn) => { const d = window.clone(draft); fn(d); setDraft(d); setSaved(false); };

  // ---- topics ----
  const addTopic = () => mutate(d => d.push({ id: window.uid('t'), name: 'New Topic', questions: [] }));
  const delTopic = (ti) => mutate(d => d.splice(ti, 1));
  const renameTopic = (ti, v) => mutate(d => { d[ti].name = v; });
  const moveTopic = (ti, dir) => mutate(d => {
    const j = ti + dir; if (j < 0 || j >= d.length) return;
    const t = d[ti]; d[ti] = d[j]; d[j] = t;
  });

  // ---- questions ----
  const addQ = (ti) => mutate(d => d[ti].questions.push({ id: window.uid('q'), text: '', label: '' }));
  const delQ = (ti, qi) => mutate(d => d[ti].questions.splice(qi, 1));
  const editQ = (ti, qi, key, v) => mutate(d => { d[ti].questions[qi][key] = v; });

  // drag reorder questions within a topic
  const onDragStart = (ti, qi) => { dragInfo.current = { ti, qi }; };
  const onDrop = (ti, qi) => {
    const from = dragInfo.current; dragInfo.current = null;
    if (!from || from.ti !== ti || from.qi === qi) return;
    mutate(d => {
      const arr = d[ti].questions;
      const [m] = arr.splice(from.qi, 1);
      arr.splice(qi, 0, m);
    });
  };

  const save = () => {
    // strip empty questions / topics with blank names get a fallback
    const cleaned = window.clone(draft).map(t => {
      t.name = (t.name || '').trim() || 'Untitled topic';
      t.questions = t.questions.filter(q => (q.text || '').trim().length);
      t.questions.forEach(q => { q.label = (q.label || '').trim() || q.text.trim().slice(0, 40); });
      return t;
    }).filter(t => t.questions.length > 0);
    onSave(cleaned);
    setSaved(true); setTimeout(() => setSaved(false), 2200);
  };

  const resetDefaults = () => {
    if (window.confirm('Replace all topics and questions with the original preset list? This cannot be undone.')) {
      setDraft(window.clone(window.DEFAULT_DATA)); setSaved(false);
    }
  };

  const totalQ = draft.reduce((n, t) => n + t.questions.length, 0);

  return (
    <div className="page-scroll fade-in">
      <div className="page-wrap wide">
        <button className="tbtn ghost" style={{ marginBottom: 18, paddingLeft: 0 }} onClick={onClose}>
          <Icon name="arrowLeft" size={16} /> Done editing
        </button>
        <div className="eyebrow">Question bank</div>
        <h1 className="page-title">Topics &amp; questions</h1>
        <p className="page-lede">
          Add, rename, reorder or remove topics and questions. The short label on the right is what
          appears in your copied notes (e.g. <i>merge vs append</i>). Drag a question by its handle to reorder.
          {' '}Currently {draft.length} topics · {totalQ} questions.
        </p>

        {draft.map((topic, ti) => (
          <div className="set-topic" key={topic.id}>
            <div className="set-topic-head">
              <input className="ti" value={topic.name} onChange={e => renameTopic(ti, e.target.value)} />
              <button className="icon-btn" title="Move up" disabled={ti === 0} onClick={() => moveTopic(ti, -1)}><Icon name="up" size={16} /></button>
              <button className="icon-btn" title="Move down" disabled={ti === draft.length - 1} onClick={() => moveTopic(ti, 1)}><Icon name="down" size={16} /></button>
              <button className="icon-btn danger" title="Delete topic" onClick={() => delTopic(ti)}><Icon name="trash" size={16} /></button>
            </div>

            {topic.questions.map((q, qi) => (
              <div className="set-q" key={q.id}
                draggable onDragStart={() => onDragStart(ti, qi)}
                onDragOver={e => e.preventDefault()} onDrop={() => onDrop(ti, qi)}>
                <span className="set-q-grip" title="Drag to reorder"><Icon name="grip" size={15} /></span>
                <input className="qi" value={q.text} placeholder="Question text…"
                  onChange={e => editQ(ti, qi, 'text', e.target.value)} />
                <input className="qi lbl" value={q.label} placeholder="short label for notes"
                  onChange={e => editQ(ti, qi, 'label', e.target.value)} />
                <button className="icon-btn danger" title="Delete question" onClick={() => delQ(ti, qi)}><Icon name="trash" size={15} /></button>
              </div>
            ))}
            {topic.questions.length === 0 && <div className="empty-note">No questions yet</div>}

            <div className="set-add">
              <button className="add-q-btn" onClick={() => addQ(ti)}><Icon name="plus" size={15} /> Add question</button>
            </div>
          </div>
        ))}

        <button className="add-q-btn" style={{ marginTop: 4 }} onClick={addTopic}>
          <Icon name="plus" size={15} /> Add topic
        </button>

        <div className="set-actions">
          <button className="btn-primary" onClick={save}><Icon name="check" size={18} /> Save changes</button>
          <button className="btn-secondary" onClick={resetDefaults}><Icon name="rotate" size={16} /> Reset to preset</button>
          <span className={'set-saved' + (saved ? ' show' : '')}><Icon name="check" size={15} /> Saved</span>
        </div>
      </div>
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
