/* ===== Setup screen — candidate intake ===== */
/* eslint-disable */
function SetupScreen({ candidate, onChange, onStart, totalQ, totalT }) {
  const set = (k, v) => onChange(Object.assign({}, candidate, { [k]: v }));
  const canStart = (candidate.name || '').trim().length > 0;

  return (
    <div className="page-scroll fade-in">
      <div className="page-wrap">
        <div className="eyebrow">New interview</div>
        <h1 className="page-title">Who are you<br/>interviewing today?</h1>
        <p className="page-lede">
          A few details about the candidate. You'll grade {totalQ} questions across {totalT} topics,
          then get a clean copyable summary at the end.
        </p>

        <div className="field">
          <label className="field-label" htmlFor="f-name">Candidate full name</label>
          <input id="f-name" className="input" autoFocus value={candidate.name || ''}
            placeholder="Enter candidate's full name"
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && canStart) onStart(); }} />
        </div>

        <div className="field">
          <label className="field-label">Gender</label>
          <div className="seg">
            <button className={'seg-opt' + (candidate.gender === 'male' ? ' active' : '')}
              onClick={() => set('gender', 'male')}>Male</button>
            <button className={'seg-opt' + (candidate.gender === 'female' ? ' active' : '')}
              onClick={() => set('gender', 'female')}>Female</button>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="f-overall">Overall experience <span className="field-hint">(years)</span></label>
            <input id="f-overall" className="input" inputMode="decimal" value={candidate.overall || ''}
              placeholder="e.g. 6" onChange={e => set('overall', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="f-pbi">Power BI experience <span className="field-hint">(years)</span></label>
            <input id="f-pbi" className="input" inputMode="decimal" value={candidate.powerbi || ''}
              placeholder="e.g. 4" onChange={e => set('powerbi', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="f-tech">Technologies the candidate has worked with</label>
          <input id="f-tech" className="input" value={candidate.tech || ''}
            placeholder="e.g. power bi, tibco spotfire, sql"
            onChange={e => set('tech', e.target.value)} />
        </div>

        <div style={{ marginTop: 34 }}>
          <button className="btn-primary" disabled={!canStart} onClick={onStart}>
            Start interview <Icon name="arrowRight" />
          </button>
          {!canStart && <span style={{ marginLeft: 14, color: 'var(--faint)', fontSize: 13 }}>Enter a name to begin</span>}
        </div>
      </div>
    </div>
  );
}
window.SetupScreen = SetupScreen;
