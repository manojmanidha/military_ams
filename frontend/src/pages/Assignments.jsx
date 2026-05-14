import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BASES = [{ id: 1, name: 'Alpha Base' }, { id: 2, name: 'Bravo Base' }, { id: 3, name: 'Charlie Base' }];
const EQUIP = [{ id: 1, name: 'M4 Rifle' }, { id: 2, name: 'Humvee' }, { id: 3, name: '5.56mm Ammo' }, { id: 4, name: 'M9 Pistol' }, { id: 5, name: 'APC' }];

export default function Assignments() {
  const { user } = useAuth();
  const canCreate = ['admin', 'base_commander'].includes(user.role);
  const [tab, setTab] = useState('active');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ base_id: user.base_id || '', equipment_type_id: '', assigned_to: '', quantity: '', assignment_date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/assignments', { params: { is_expended: tab === 'expended' } }).then(r => setRows(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const submit = async () => {
    if (!form.base_id || !form.equipment_type_id || !form.assigned_to || !form.quantity) return alert('Fill all required fields');
    setSaving(true);
    try {
      await api.post('/assignments', { ...form, base_id: Number(form.base_id), equipment_type_id: Number(form.equipment_type_id), quantity: Number(form.quantity) });
      setShowForm(false); load();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const markExpended = async (id) => {
    if (!confirm('Mark this assignment as expended?')) return;
    try { await api.patch(`/assignments/${id}/expend`); load(); }
    catch (e) { alert(e.response?.data?.error || 'Error'); }
  };

  const s = { input: { width: '100%', background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 6, padding: '8px 12px', color: '#c8d4b0', fontSize: 14, fontFamily: "'Courier New', monospace", outline: 'none', boxSizing: 'border-box' }, label: { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 4 } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>Personnel</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#c8d4b0' }}>Assignments & Expenditures</div>
        </div>
        {canCreate && <button onClick={() => setShowForm(true)} style={{ background: '#4a6a28', border: 'none', borderRadius: 6, color: '#c8d4b0', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer' }}>+ Assign Asset</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {['active', 'expended'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#2e3828' : 'transparent', border: 'none', borderRadius: 6, color: tab === t ? '#c8d4b0' : '#4a5a3a', fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer' }}>{t}</button>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#151910', border: '1px solid #3a4830', borderRadius: 12, width: '100%', maxWidth: 420, margin: 16, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#c8d4b0' }}>Assign Asset</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#4a5a3a', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={s.label}>Base *</label>
                <select style={s.input} value={form.base_id} disabled={user.role === 'base_commander'} onChange={e => setForm(f => ({ ...f, base_id: e.target.value }))}>
                  <option value="">Select...</option>{BASES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Equipment *</label>
                <select style={s.input} value={form.equipment_type_id} onChange={e => setForm(f => ({ ...f, equipment_type_id: e.target.value }))}>
                  <option value="">Select...</option>{EQUIP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              {[{ k: 'assigned_to', l: 'Assigned To *', t: 'text' }, { k: 'quantity', l: 'Quantity *', t: 'number' }, { k: 'assignment_date', l: 'Date *', t: 'date' }, { k: 'notes', l: 'Notes', t: 'text' }].map(({ k, l, t }) => (
                <div key={k}><label style={s.label}>{l}</label><input type={t} style={s.input} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={submit} disabled={saving} style={{ flex: 1, background: '#4a6a28', border: 'none', borderRadius: 6, color: '#c8d4b0', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: 10, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Assign'}</button>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#2e3828', border: 'none', borderRadius: 6, color: '#6b7a5a', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: 10, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e3828' }}>
              {['Date', 'Base', 'Equipment', 'Assigned To', 'Quantity', 'Status', ...(canCreate && tab === 'active' ? ['Action'] : [])].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 13 }}>Loading...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 13 }}>No records found</td></tr>
              : rows.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #1e2418' }}>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.assignment_date?.split('T')[0]}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.base_name}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.equipment_name}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.assigned_to}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{Number(r.quantity).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4, background: r.is_expended ? '#3a1010' : '#1e3a5c', color: r.is_expended ? '#f08080' : '#80b8f0' }}>
                      {r.is_expended ? 'Expended' : 'Active'}
                    </span>
                  </td>
                  {canCreate && tab === 'active' && (
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => markExpended(r.id)} style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 4, border: '1px solid #5c1e1e', background: 'transparent', color: '#f08080', cursor: 'pointer' }}>Mark Expended</button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}