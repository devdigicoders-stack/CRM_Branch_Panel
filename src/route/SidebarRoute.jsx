import { lazy } from "react";
import { 
  FaTachometerAlt, FaUsers, FaShieldAlt, FaCog, FaBell, 
  FaBullhorn, FaUser, FaLock, FaUserPlus, FaCalendarAlt, 
  FaExclamationTriangle, FaChartLine, FaCodeBranch 
} from "react-icons/fa";

const Dashboard      = lazy(() => import("../pages/Dashboard"));
const CreateAdmin    = lazy(() => import("../pages/CreateAdmin"));
const CreateUser     = lazy(() => import("../pages/CreateUser"));
const GlobalSettings = lazy(() => import("../pages/GlobalSettings"));
const Notifications  = lazy(() => import("../pages/Notifications"));
const LeadManagement = lazy(() => import("../pages/LeadManagement"));
const Profile        = lazy(() => import("../pages/Profile"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const CalendarView   = lazy(() => import("../pages/CalendarView"));
const MissedFollowUps = lazy(() => import("../pages/MissedFollowUps"));
const UserHistory    = lazy(() => import("../pages/UserHistory"));
const Reports        = lazy(() => import("../pages/Reports"));
const BranchManagement = lazy(() => import("../pages/BranchManagement"));
const EmployeeReports = lazy(() => import("../pages/EmployeeReports"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  { path: "/create-admin", component: CreateAdmin, name: "Create Admin", icon: FaUserPlus, superAdminOnly: true },
  { path: "/branch-management", component: BranchManagement, name: "Branch Management", icon: FaCodeBranch, superAdminOnly: true },
  { path: "/lead-management", component: LeadManagement, name: "Lead Management", icon: FaBullhorn },
  { path: "/user-history", component: UserHistory, name: "Staff History", icon: FaUsers },
  { path: "/calendar", component: CalendarView, name: "Calendar", icon: FaCalendarAlt },
  { path: "/reports", component: Reports, name: "Reports & Analytics", icon: FaChartLine },
  { path: "/employee-reports", component: EmployeeReports, name: "Employee Reports", icon: FaUsers },
  { path: "/notifications", component: Notifications, name: "Notifications", icon: FaBell },
  { path: "/profile", component: Profile, name: "My Profile", icon: FaUser },
  { path: "/change-password", component: ChangePassword, name: "Change Password", icon: FaLock },
  { path: "/missed-follow-ups", component: MissedFollowUps, name: "Missed Follow-Ups", icon: FaExclamationTriangle, hide: true },
];

export default routes;
