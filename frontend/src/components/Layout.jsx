import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ name, size = 18 }) => {
  const paths = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    purchase: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z",
    transfer: "M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z",
    assignment: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
    audit: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[name] || paths.dashboard} />
    </svg>
  );
};

const NAV = [
  { path: '/',            label: 'Dashboard',   icon: 'dashboard',  roles: ['admin','base_commander','logistics_officer'] },
  { path: '/purchases',   label: 'Purchases',   icon: 'purchase',   roles: ['admin','base_commander','logistics_officer'] },
  { path: '/transfers',   label: 'Transfers',   icon: 'transfer',   roles: ['admin','base_commander','logistics_officer'] },
  { path: '/assignments', label: 'Assignments', icon: 'assignment', roles: ['admin','base_commander'] },
  { path: '/audit',       label: 'Audit Log',   icon: 'audit',      roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = NAV.filter(n => n.roles.includes(user?.role));

  const roleLabel = { admin: 'Administrator', base_commander: 'Base Commander', logistics_officer: 'Logistics Officer' };
  const roleBadgeColor = { admin: '#f0c060', base_commander: '#80b8f0', logistics_officer: '#c8d4b0' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1209', fontFamily: "'Courier New', monospace", color: '#c8d4b0' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 220 : 60, background: '#0c1008', borderRight: '1px solid #1e2818', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid #1e2818', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#6b8c3e', flexShrink: 0 }}><Icon name="shield" size={22} /></span>
          {sidebarOpen && <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: '#6b8c3e' }}>MIL-AMS</span>}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4a5a3a', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="menu" size={18} />
          </button>
        </div>

        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2818' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9aaa80', marginBottom: 4 }}>{user?.name}</div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', padding: '2px 8px', borderRadius: 4, background: '#1a1f14', color: roleBadgeColor[user?.role] }}>
              {roleLabel[user?.role]}
            </span>
          </div>
        )}

        <nav style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(n => {
            const active = location.pathname === n.path;
            return (
              <button key={n.path} onClick={() => navigate(n.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: active ? '#2e3828' : 'transparent', color: active ? '#c8d4b0' : '#4a5a3a', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ flexShrink: 0 }}><Icon name={n.icon} size={16} /></span>
                {sidebarOpen && n.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 8, borderTop: '1px solid #1e2818' }}>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent', color: '#4a5a3a', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', width: '100%' }}>
            <Icon name="logout" size={16} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}