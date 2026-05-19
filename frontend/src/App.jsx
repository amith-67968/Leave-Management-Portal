import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardNavbar from './components/DashboardNavbar';

// Landing pages (teammate's)
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';

// Auth pages
import LoginPage from './pages/LoginPage';
import RoleLoginPage from './pages/RoleLoginPage';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import SalarySummary from './pages/employee/SalarySummary';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import TeamLeaves from './pages/manager/TeamLeaves';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageLeaveTypes from './pages/admin/ManageLeaveTypes';
import ManageHolidays from './pages/admin/ManageHolidays';
import LeaveHistory from './pages/admin/LeaveHistory';
import PayrollReport from './pages/admin/PayrollReport';

// Shared pages
import HolidayCalendar from './pages/HolidayCalendar';
import LeaveCalendar from './pages/LeaveCalendar';

import './index.css';

/* ─── Landing Page (public) ─── */
function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

/* ─── Dashboard Layout (authenticated) ─── */
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="pt-16 min-h-screen lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ─── Role-based redirect ─── */
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const map = { admin: '/admin/dashboard', manager: '/manager/dashboard', employee: '/employee/dashboard' };
  return <Navigate to={map[user.role] || '/login'} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' },
        }} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:role" element={<RoleLoginPage />} />

          {/* Employee-only routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute roles={['employee']}><DashboardLayout><EmployeeDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/employee/apply-leave" element={<ProtectedRoute roles={['employee']}><DashboardLayout><ApplyLeave /></DashboardLayout></ProtectedRoute>} />
          <Route path="/employee/my-leaves" element={<ProtectedRoute roles={['employee']}><DashboardLayout><MyLeaves /></DashboardLayout></ProtectedRoute>} />
          <Route path="/employee/salary-summary" element={<ProtectedRoute roles={['employee']}><DashboardLayout><SalarySummary /></DashboardLayout></ProtectedRoute>} />

          {/* Manager-only routes */}
          <Route path="/manager/dashboard" element={<ProtectedRoute roles={['manager']}><DashboardLayout><ManagerDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/manager/team-leaves" element={<ProtectedRoute roles={['manager']}><DashboardLayout><TeamLeaves /></DashboardLayout></ProtectedRoute>} />
          <Route path="/manager/apply-leave" element={<ProtectedRoute roles={['manager']}><DashboardLayout><ApplyLeave /></DashboardLayout></ProtectedRoute>} />
          <Route path="/manager/my-leaves" element={<ProtectedRoute roles={['manager']}><DashboardLayout><MyLeaves /></DashboardLayout></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><DashboardLayout><ManageUsers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/leave-types" element={<ProtectedRoute roles={['admin']}><DashboardLayout><ManageLeaveTypes /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/holidays" element={<ProtectedRoute roles={['admin']}><DashboardLayout><ManageHolidays /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/leave-history" element={<ProtectedRoute roles={['admin']}><DashboardLayout><LeaveHistory /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute roles={['admin']}><DashboardLayout><PayrollReport /></DashboardLayout></ProtectedRoute>} />

          {/* Shared routes */}
          <Route path="/holidays" element={<ProtectedRoute roles={['employee','manager','admin']}><DashboardLayout><HolidayCalendar /></DashboardLayout></ProtectedRoute>} />
          <Route path="/leave-calendar" element={<ProtectedRoute roles={['employee','manager','admin']}><DashboardLayout><LeaveCalendar /></DashboardLayout></ProtectedRoute>} />

          {/* Authenticated home redirect */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
