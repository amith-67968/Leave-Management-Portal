import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineDocumentAdd, HiOutlineClipboardList,
  HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineUserGroup,
  HiOutlineCog, HiOutlineDocumentReport, HiOutlineChartBar,
  HiOutlineUsers, HiOutlineViewGrid
} from 'react-icons/hi';

export default function Sidebar() {
  const { user } = useAuth();

  const employeeLinks = [
    { to: '/employee/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/employee/apply-leave', icon: <HiOutlineDocumentAdd />, label: 'Apply Leave' },
    { to: '/employee/my-leaves', icon: <HiOutlineClipboardList />, label: 'My Leaves' },
    { to: '/employee/salary-summary', icon: <HiOutlineCurrencyRupee />, label: 'Salary Summary' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/manager/team-leaves', icon: <HiOutlineUserGroup />, label: 'Team Leaves' },
    { to: '/manager/apply-leave', icon: <HiOutlineDocumentAdd />, label: 'Apply Leave' },
    { to: '/manager/my-leaves', icon: <HiOutlineClipboardList />, label: 'My Leaves' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/admin/users', icon: <HiOutlineUsers />, label: 'Manage Users' },
    { to: '/admin/leave-types', icon: <HiOutlineCog />, label: 'Leave Types' },
    { to: '/admin/holidays', icon: <HiOutlineCalendar />, label: 'Holidays' },
    { to: '/admin/leave-history', icon: <HiOutlineDocumentReport />, label: 'Leave History' },
    { to: '/admin/payroll', icon: <HiOutlineChartBar />, label: 'Payroll Report' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'manager' ? managerLinks
    : employeeLinks;

  const sectionTitle = user?.role === 'admin' ? 'Administration'
    : user?.role === 'manager' ? 'Management'
    : 'My Workspace';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏖️</div>
        <h2>LeaveFlow</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">{sectionTitle}</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <div className="sidebar-section-title">General</div>
        <NavLink to="/holidays" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon"><HiOutlineCalendar /></span>
          Holiday Calendar
        </NavLink>
      </nav>
    </aside>
  );
}
