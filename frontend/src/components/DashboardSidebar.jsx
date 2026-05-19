import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineDocumentAdd, HiOutlineClipboardList,
  HiOutlineCurrencyRupee, HiOutlineCalendar, HiOutlineUserGroup,
  HiOutlineCog, HiOutlineDocumentReport, HiOutlineChartBar,
  HiOutlineUsers, HiOutlineViewGrid, HiX, HiOutlineShieldCheck
} from 'react-icons/hi';

export default function DashboardSidebar({ open = false, onClose }) {
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

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-200 lg:z-40 lg:w-64 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between gap-3 px-5 sm:px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
              <HiOutlineShieldCheck />
            </span>
            <h2 className="text-lg font-bold text-foreground tracking-tight">LeaveFlow</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {sectionTitle}
          </p>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={onClose} className={linkClass}>
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          <p className="px-3 mt-6 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            General
          </p>
          <NavLink to="/holidays" onClick={onClose} className={linkClass}>
            <span className="text-lg"><HiOutlineCalendar /></span>
            Holiday Calendar
          </NavLink>
          <NavLink to="/leave-calendar" onClick={onClose} className={linkClass}>
            <span className="text-lg"><HiOutlineUserGroup /></span>
            Leave Calendar
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
