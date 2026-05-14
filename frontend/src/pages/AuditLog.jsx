import { useState, useEffect } from 'react';
import api from '../api/axios';

const ACTION_COLORS = { CREATE_PURCHASE: '#80d4a0', TRANSFER: '#80b8f0', ASSIGN: '#f0c060', EXPEND: '#f08080' };

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs').then(r => setRows(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>Security</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#c8d4b0' }}>Audit Log</div>
      </div>
      <div style={{ background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e3828' }}>
              {['Timestamp', 'Action', 'Entity', 'Performed By', 'Details'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 11 }}>Loading...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 11 }}>No logs yet</td></tr>
              : rows.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #1e2418' }}>
                  <td style={{ padding: '12px 16px', color: '#9aaa80', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4, background: '#1a1f14', color: ACTION_COLORS[r.action] || '#c8d4b0', border: `1px solid ${ACTION_COLORS[r.action] || '#2e3828'}20` }}>{r.action}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.entity_type} #{r.entity_id}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.user_name || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7a5a', fontSize: 13 }}>{r.details ? JSON.stringify(r.details).slice(0, 60) + '...' : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}