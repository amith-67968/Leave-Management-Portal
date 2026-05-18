import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Welcome back 👋
        </span>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
          <HiOutlineLogout size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}
