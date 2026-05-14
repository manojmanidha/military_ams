import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditLog from './pages/AuditLog';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><Layout><Purchases /></Layout></ProtectedRoute>} />
      <Route path="/transfers" element={<ProtectedRoute><Layout><Transfers /></Layout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute roles={['admin','base_commander']}><Layout><Assignments /></Layout></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute roles={['admin']}><Layout><AuditLog /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}