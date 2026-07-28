import { useState, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import routes from "../route/SidebarRoute";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageTitle = useMemo(() => {
    const allRoutes = routes.flatMap(r => r.children || r);
    return allRoutes.find(r => r.path === location.pathname)?.name || "Dashboard";
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  // Filter routes based on role
  const visibleRoutes = routes.filter(r => {
    if (r.hide) return false;
    if (user?.role === 'superAdmin') return !r.adminOnly;
    if (r.superAdminOnly) return false;
    return true;
  });

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: themeColors.background,
        fontFamily: currentFont?.family || 'Inter, sans-serif',
      }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        routes={visibleRoutes}
        currentPath={location.pathname}
        user={user}
        logout={handleLogout}
        themeColors={themeColors}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          currentPageTitle={currentPageTitle}
        />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: themeColors.background }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
