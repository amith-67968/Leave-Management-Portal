import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from 'react-icons/hi';

export default function DashboardNavbar() {
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
    <header className="fixed top-0 left-64 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Welcome back, <span className="text-primary">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${roleBadge[user?.role] || ''}`}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <HiOutlineLogout className="text-base" />
          Logout
        </button>
      </div>
    </header>
  );
}
