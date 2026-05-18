import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HolidayCalendar from './pages/HolidayCalendar';

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

import './index.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

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
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(148,163,184,0.15)' },
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Employee-only routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute roles={['employee']}><AppLayout><EmployeeDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/employee/apply-leave" element={<ProtectedRoute roles={['employee']}><AppLayout><ApplyLeave /></AppLayout></ProtectedRoute>} />
          <Route path="/employee/my-leaves" element={<ProtectedRoute roles={['employee']}><AppLayout><MyLeaves /></AppLayout></ProtectedRoute>} />
          <Route path="/employee/salary-summary" element={<ProtectedRoute roles={['employee']}><AppLayout><SalarySummary /></AppLayout></ProtectedRoute>} />

          {/* Manager-only routes */}
          <Route path="/manager/dashboard" element={<ProtectedRoute roles={['manager']}><AppLayout><ManagerDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/manager/team-leaves" element={<ProtectedRoute roles={['manager']}><AppLayout><TeamLeaves /></AppLayout></ProtectedRoute>} />
          <Route path="/manager/apply-leave" element={<ProtectedRoute roles={['manager']}><AppLayout><ApplyLeave /></AppLayout></ProtectedRoute>} />
          <Route path="/manager/my-leaves" element={<ProtectedRoute roles={['manager']}><AppLayout><MyLeaves /></AppLayout></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AppLayout><ManageUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/leave-types" element={<ProtectedRoute roles={['admin']}><AppLayout><ManageLeaveTypes /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/holidays" element={<ProtectedRoute roles={['admin']}><AppLayout><ManageHolidays /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/leave-history" element={<ProtectedRoute roles={['admin']}><AppLayout><LeaveHistory /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute roles={['admin']}><AppLayout><PayrollReport /></AppLayout></ProtectedRoute>} />

          {/* Shared routes — each role can access */}
          <Route path="/holidays" element={<ProtectedRoute roles={['employee','manager','admin']}><AppLayout><HolidayCalendar /></AppLayout></ProtectedRoute>} />

          {/* Catch all — redirect to role-appropriate dashboard */}
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
