import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid credentials. Try password123');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: '#0e1209', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace" },
    card: { background: '#151910', border: '1px solid #2e3828', borderRadius: 12, padding: 32, width: '100%', maxWidth: 380 },
    label: { display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 6 },
    input: { width: '100%', background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 6, padding: '10px 12px', color: '#c8d4b0', fontSize: 15, fontFamily: "'Courier New', monospace", outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', background: '#4a6a28', border: 'none', borderRadius: 6, padding: '11px', color: '#c8d4b0', fontSize: 13, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8 },
  };

  return (
    <div style={s.page}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.4em', color: '#4a5a3a', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Classified System</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#c8d4b0' }}>Military AMS</div>
          <div style={{ fontSize: 13, color: '#4a5a3a', marginTop: 4 }}>Asset Management System</div>
        </div>

        <div style={s.card}>
          {error && <div style={{ background: '#3a1010', border: '1px solid #6a2020', color: '#f08080', fontSize: 11, padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>{error}</div>}

          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Officer Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="officer@mil.gov" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Passphrase</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" />
          </div>
          <button style={s.btn} onClick={submit} disabled={loading}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </div>

        {/* Demo credentials helper */}
        <div style={{ ...s.card, marginTop: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#4a5a3a', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Demo Accounts (password: password123)</div>
          {[
            { email: 'admin@mil.gov', role: 'Admin', color: '#f0c060' },
            { email: 'chen@mil.gov', role: 'Commander', color: '#80b8f0' },
            { email: 'okafor@mil.gov', role: 'Logistics', color: '#c8d4b0' },
          ].map(u => (
            <button key={u.email} onClick={() => { setEmail(u.email); setPassword('password123'); setError(''); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 6, padding: '8px 12px', marginBottom: 6, cursor: 'pointer', color: '#9aaa80', fontSize: 13, fontFamily: "'Courier New', monospace" }}>
              <span>{u.email}</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', color: u.color }}>{u.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}