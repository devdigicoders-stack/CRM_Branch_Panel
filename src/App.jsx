import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BranchManagement from './pages/BranchManagement';
import MyBranch from './pages/MyBranch';
import BranchLeads from './pages/BranchLeads';
import BranchStaff from './pages/BranchStaff';
import Profile from './pages/Profile';

function AppRoutes() {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      {isLoggedIn ? (
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {user?.role === 'superAdmin' && (
            <Route path="/branches" element={<BranchManagement />} />
          )}
          {user?.role === 'admin' && (
            <>
              <Route path="/my-branch" element={<MyBranch />} />
              <Route path="/leads" element={<BranchLeads />} />
              <Route path="/staff" element={<BranchStaff />} />
            </>
          )}
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
