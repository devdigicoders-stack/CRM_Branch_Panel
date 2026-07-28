import { lazy } from "react";
import {
  LayoutDashboard, GitBranch, Building2, TrendingUp, Users, User, BarChart3
} from "lucide-react";

const Dashboard        = lazy(() => import("../pages/Dashboard"));
const BranchManagement = lazy(() => import("../pages/BranchManagement"));
const MyBranch         = lazy(() => import("../pages/MyBranch"));
const BranchLeads      = lazy(() => import("../pages/BranchLeads"));
const BranchStaff      = lazy(() => import("../pages/BranchStaff"));
const BranchReports    = lazy(() => import("../pages/BranchReports"));
const Profile          = lazy(() => import("../pages/Profile"));

const routes = [
  { path: "/dashboard", component: Dashboard,        name: "Dashboard",         icon: LayoutDashboard },
  { path: "/branches",  component: BranchManagement, name: "Branch Management", icon: GitBranch,   superAdminOnly: true },
  { path: "/my-branch", component: MyBranch,         name: "My Branch",         icon: Building2,   managerOnly: true },
  { path: "/leads",     component: BranchLeads,      name: "Branch Leads",      icon: TrendingUp,  managerOnly: true },
  { path: "/staff",     component: BranchStaff,      name: "Staff Management",  icon: Users,       managerOnly: true },
  { path: "/reports",   component: BranchReports,    name: "Reports",           icon: BarChart3,   managerOnly: true },
  { path: "/profile",   component: Profile,          name: "My Profile",        icon: User },
];

export default routes;
