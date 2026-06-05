/* ===== Lock screen ===== */
/* eslint-disable */
function LockScreen({ onAuth }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        sessionStorage.setItem('ibi_auth', token);
        onAuth();
      } else {
        setError('Incorrect password. Try again.');
        setPassword('');
      }
    } catch {
      setError('Could not connect. Check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="lock-screen">
      <div className="lock-box fade-in">
        <div className="lock-icon-wrap">
          <div className="brand-mark lock-brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z"/>
              <path d="M19 10v1a7 7 0 01-14 0v-1"/>
              <path d="M12 19v3M9 22h6"/>
            </svg>
          </div>
        </div>
        <h1 className="lock-title">Interview Console</h1>
        <p className="lock-sub">Enter your password to continue</p>
        <form className="lock-form" onSubmit={submit}>
          <input className="input lock-input" type="password"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" autoFocus autoComplete="current-password" />
          {error && <div className="lock-error">{error}</div>}
          <button className="btn-primary lock-btn" type="submit" disabled={loading || !password}>
            {loading ? 'Verifying…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
window.LockScreen = LockScreen;
