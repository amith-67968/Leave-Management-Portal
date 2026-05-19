import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2, HiOutlineLogout } from 'react-icons/hi';

export default function DashboardNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = {
    admin: 'bg-amber-100 text-amber-800 border-amber-200',
    manager: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    employee: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6 lg:left-64 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <HiMenuAlt2 className="text-xl" />
        </button>
        <h2 className="truncate text-sm font-semibold text-foreground">
          Welcome back, <span className="text-primary">{user?.name}</span>
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${roleBadge[user?.role] || ''}`}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:px-3"
        >
          <HiOutlineLogout className="text-base" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
