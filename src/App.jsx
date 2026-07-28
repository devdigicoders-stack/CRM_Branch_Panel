import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FontProvider } from './context/FontContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import routes from './route/SidebarRoute';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

function AppRoutes() {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  const allowedRoutes = routes.filter(r => {
    if (r.hide) return false;
    if (user?.role === 'superAdmin') return !r.managerOnly;
    if (r.superAdminOnly) return false;
    if (r.managerOnly && user?.role !== 'branchManager') return false;
    return true;
  });

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      {isLoggedIn ? (
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {allowedRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={
              <Suspense fallback={<LoadingSpinner />}><Component /></Suspense>
            } />
          ))}
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
    <ThemeProvider>
      <FontProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-right" richColors />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </FontProvider>
    </ThemeProvider>
  );
}
