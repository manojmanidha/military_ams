import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BASES = [{ id: 1, name: 'Alpha Base' }, { id: 2, name: 'Bravo Base' }, { id: 3, name: 'Charlie Base' }];
const EQUIP = [{ id: 1, name: 'M4 Rifle' }, { id: 2, name: 'Humvee' }, { id: 3, name: '5.56mm Ammo' }, { id: 4, name: 'M9 Pistol' }, { id: 5, name: 'APC' }];

export default function Purchases() {
  const { user } = useAuth();
  const canCreate = ['admin', 'logistics_officer'].includes(user.role);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ base_id: '', equipment_type_id: '', start_date: '', end_date: '' });
  const [form, setForm] = useState({ base_id: user.base_id || '', equipment_type_id: '', quantity: '', purchase_date: new Date().toISOString().split('T')[0], supplier: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/purchases', { params: filters }).then(r => setRows(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filters]);

  const submit = async () => {
    if (!form.base_id || !form.equipment_type_id || !form.quantity) return alert('Fill all required fields');
    setSaving(true);
    try {
      await api.post('/purchases', { ...form, base_id: Number(form.base_id), equipment_type_id: Number(form.equipment_type_id), quantity: Number(form.quantity) });
      setShowForm(false);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const s = { input: { width: '100%', background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 6, padding: '8px 12px', color: '#c8d4b0', fontSize: 14, fontFamily: "'Courier New', monospace", outline: 'none', boxSizing: 'border-box' }, label: { display: 'block', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 4 } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>Inventory</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#c8d4b0' }}>Purchases</div>
        </div>
        {canCreate && <button onClick={() => setShowForm(true)} style={{ background: '#4a6a28', border: 'none', borderRadius: 6, color: '#c8d4b0', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer' }}>+ Record Purchase</button>}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {user.role === 'admin' && (
          <select style={{ ...s.input, width: 'auto' }} value={filters.base_id} onChange={e => setFilters(f => ({ ...f, base_id: e.target.value }))}>
            <option value="">All Bases</option>{BASES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select style={{ ...s.input, width: 'auto' }} value={filters.equipment_type_id} onChange={e => setFilters(f => ({ ...f, equipment_type_id: e.target.value }))}>
          <option value="">All Equipment</option>{EQUIP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input type="date" style={{ ...s.input, width: 'auto' }} value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
        <input type="date" style={{ ...s.input, width: 'auto' }} value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#151910', border: '1px solid #3a4830', borderRadius: 12, width: '100%', maxWidth: 420, margin: 16, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#c8d4b0' }}>New Purchase</div>
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
              {[{ k: 'quantity', l: 'Quantity *', t: 'number' }, { k: 'purchase_date', l: 'Date *', t: 'date' }, { k: 'supplier', l: 'Supplier', t: 'text' }, { k: 'notes', l: 'Notes', t: 'text' }].map(({ k, l, t }) => (
                <div key={k}><label style={s.label}>{l}</label><input type={t} style={s.input} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={submit} disabled={saving} style={{ flex: 1, background: '#4a6a28', border: 'none', borderRadius: 6, color: '#c8d4b0', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: 10, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Submit'}</button>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#2e3828', border: 'none', borderRadius: 6, color: '#6b7a5a', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: 10, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e3828' }}>
              {['Date', 'Base', 'Equipment', 'Category', 'Quantity', 'Supplier'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 13 }}>Loading...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#4a5a3a', fontSize: 13 }}>No records found</td></tr>
              : rows.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #1e2418' }}>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.purchase_date?.split('T')[0]}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.base_name}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.equipment_name}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4, background: '#2e3828', color: '#c8d4b0' }}>{r.category}</span></td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{Number(r.quantity).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#9aaa80' }}>{r.supplier || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}