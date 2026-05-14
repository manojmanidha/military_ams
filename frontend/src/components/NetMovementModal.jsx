export default function NetMovementModal({ data, onClose }) {
  const max = Math.max(data.purchases, data.transfer_in, data.transfer_out, 1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#151910', border: '1px solid #3a4830', borderRadius: 12, width: '100%', maxWidth: 440, margin: 16, padding: 28 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a', marginBottom: 4 }}>Breakdown</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#c8d4b0' }}>Net Movement Detail</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5a3a', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>✕</button>
        </div>

        {/* Bars */}
        {[
          { label: 'Purchases',     value: Number(data.purchases),    color: '#80d4a0' },
          { label: 'Transfer In',   value: Number(data.transfer_in),  color: '#80b8f0' },
          { label: 'Transfer Out',  value: Number(data.transfer_out), color: '#f08080' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a' }}>
                {label}
              </span>
              <span style={{ fontWeight: 900, color, fontSize: 14 }}>
                {value.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 6, background: '#2e3828', borderRadius: 4 }}>
              <div style={{
                height: '100%', borderRadius: 4, background: color,
                width: `${(value / max) * 100}%`,
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>
        ))}

        {/* Net total */}
        <div style={{ borderTop: '1px solid #2e3828', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 900, color: '#4a5a3a' }}>
            Net Movement
          </span>
          <span style={{ fontSize: 22, fontWeight: 900, color: data.net_movement >= 0 ? '#80d4a0' : '#f08080' }}>
            {data.net_movement >= 0 ? '+' : ''}{Number(data.net_movement).toLocaleString()}
          </span>
        </div>

      </div>
    </div>
  );
}