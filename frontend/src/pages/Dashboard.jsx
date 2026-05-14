import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NetMovementModal from '../components/NetMovementModal';
import api from '../api/axios';

const BASES = [{ id: 1, name: 'Alpha Base' }, { id: 2, name: 'Bravo Base' }, { id: 3, name: 'Charlie Base' }];
const EQUIP = [{ id: 1, name: 'M4 Rifle' }, { id: 2, name: 'Humvee' }, { id: 3, name: '5.56mm Ammo' }, { id: 4, name: 'M9 Pistol' }, { id: 5, name: 'APC' }];

function MetricCard({ label, value, accent, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#1a1f14', border: '1px solid #2e3828', borderRadius: 10, padding: 20, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: accent || '#c8d4b0' }}>{Number(value || 0).toLocaleString()}</div>
      {onClick && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, color: '#4a5a3a', letterSpacing: '0.1em' }}>DETAILS →</div>}
    </div>
  );
}

function Modal({ data, onClose }) {
  const max = Math.max(data.purchases, data.transfer_in, data.transfer_out, 1);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#151910', border: '1px solid #3a4830', borderRadius: 12, width: '100%', maxWidth: 440, margin: 16, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#c8d4b0' }}>Net Movement Breakdown</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5a3a', cursor: 'pointer', fontSize: 22 }}>✕</button>
        </div>
        {[
          { label: 'Purchases', value: data.purchases, color: '#80d4a0' },
          { label: 'Transfer In', value: data.transfer_in, color: '#80b8f0' },
          { label: 'Transfer Out', value: data.transfer_out, color: '#f08080' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, letterSpacing: '0.15em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>{label}</span>
              <span style={{ fontWeight: 900, color }}>{Number(value).toLocaleString()}</span>
            </div>
            <div style={{ height: 6, background: '#2e3828', borderRadius: 4 }}>
              <div style={{ height: '100%', borderRadius: 4, background: color, width: `${(value / max) * 100}%`, transition: 'width 0.6s' }} />
            </div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #2e3828', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.15em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>Net Movement</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: data.net_movement >= 0 ? '#80d4a0' : '#f08080' }}>
            {data.net_movement >= 0 ? '+' : ''}{Number(data.net_movement).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({ base_id: '', equipment_type_id: '', start_date: '2024-01-01', end_date: new Date().toISOString().split('T')[0] });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters };
    api.get('/dashboard', { params }).then(r => setMetrics(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [filters]);

  const s = { label: { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 4, display: 'block' }, select: { background: '#1a1f14', border: '1px solid #2e3828', color: '#c8d4b0', fontSize: 13, borderRadius: 6, padding: '6px 10px', fontFamily: "'Courier New', monospace" } };

  return (
    <div>
      {showModal && metrics && (
        <NetMovementModal
            data={{
            purchases:    Number(metrics.purchases),
            transfer_in:  Number(metrics.transfer_in),
            transfer_out: Number(metrics.transfer_out),
            net_movement: Number(metrics.net_movement),
            }}
            onClose={() => setShowModal(false)}
        />
     )}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#4a5a3a', textTransform: 'uppercase', fontWeight: 900 }}>Command Overview</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#c8d4b0' }}>Asset Dashboard</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'flex-end' }}>
        {user.role === 'admin' && (
          <div><label style={s.label}>Base</label>
            <select style={s.select} value={filters.base_id} onChange={e => setFilters(f => ({ ...f, base_id: e.target.value }))}>
              <option value="">All Bases</option>
              {BASES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div><label style={s.label}>Equipment</label>
          <select style={s.select} value={filters.equipment_type_id} onChange={e => setFilters(f => ({ ...f, equipment_type_id: e.target.value }))}>
            <option value="">All Equipment</option>
            {EQUIP.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div><label style={s.label}>From</label><input type="date" style={s.select} value={filters.start_date} onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} /></div>
        <div><label style={s.label}>To</label><input type="date" style={s.select} value={filters.end_date} onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} /></div>
      </div>

      {loading ? <div style={{ color: '#4a5a3a', fontSize: 14, letterSpacing: '0.1em' }}>Loading metrics...</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
            <MetricCard label="Opening Balance" value={metrics?.opening_balance} />
            <MetricCard label="Net Movement" value={metrics?.net_movement} accent={metrics?.net_movement >= 0 ? '#80d4a0' : '#f08080'} onClick={() => setShowModal(true)} />
            <MetricCard label="Closing Balance" value={metrics?.closing_balance} accent="#f0c060" />
            <MetricCard label="Assigned" value={metrics?.assigned} accent="#80b8f0" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <MetricCard label="Purchases" value={metrics?.purchases} accent="#80d4a0" />
            <MetricCard label="Transfer In" value={metrics?.transfer_in} accent="#80b8f0" />
            <MetricCard label="Transfer Out" value={metrics?.transfer_out} accent="#f08080" />
            <MetricCard label="Expended" value={metrics?.expended} accent="#f08080" />
          </div>
        </>
      )}
    </div>
  );
}