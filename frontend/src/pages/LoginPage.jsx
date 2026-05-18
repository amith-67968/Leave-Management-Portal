import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowLeft, HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineBriefcase } from 'react-icons/hi';

const ROLES = [
  {
    key: 'employee',
    label: 'Employee',
    icon: <HiOutlineBriefcase />,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    description: 'Apply for leave, check balances & track status',
    users: [
      { name: 'Amit Kumar', email: 'amit.kumar@company.com' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@company.com' },
      { name: 'Vikram Singh', email: 'vikram.singh@company.com' },
      { name: 'Neha Gupta', email: 'neha.gupta@company.com' },
      { name: 'Arjun Das', email: 'arjun.das@company.com' },
    ],
  },
  {
    key: 'manager',
    label: 'Manager',
    icon: <HiOutlineUserGroup />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    description: 'Approve/reject leaves & monitor team',
    users: [
      { name: 'Rahul Sharma', email: 'rahul.sharma@company.com' },
      { name: 'Priya Patel', email: 'priya.patel@company.com' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: <HiOutlineShieldCheck />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    description: 'Manage users, policies, holidays & reports',
    users: [
      { name: 'System Admin', email: 'admin@company.com' },
    ],
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(role.users[0].email);
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dashMap = { admin: '/admin/dashboard', manager: '/manager/dashboard', employee: '/employee/dashboard' };
      navigate(dashMap[user.role] || '/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: selectedRole ? 420 : 560 }}>
        <div className="login-logo">
          <div className="login-logo-icon">🏖️</div>
          <h1>LeavePort</h1>
          <p>Leave Management Portal</p>
        </div>

        {!selectedRole ? (
          /* ── STEP 1: Role Selection ── */
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Select your role to continue
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role)}
                  className="role-select-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s ease', width: '100%', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = role.color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${role.color}33`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 50, height: 50, borderRadius: 'var(--radius-md)',
                    background: role.gradient, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.5rem', color: 'white', flexShrink: 0,
                  }}>
                    {role.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{role.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{role.description}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* ── STEP 2: Login Form ── */
          <>
            <button onClick={handleBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
              <HiOutlineArrowLeft /> Back to roles
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: `${selectedRole.color}15`, borderRadius: 'var(--radius-md)',
              marginBottom: 20, border: `1px solid ${selectedRole.color}30`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: selectedRole.gradient, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem', color: 'white',
              }}>
                {selectedRole.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Login as {selectedRole.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedRole.description}</div>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <HiOutlineMail style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Select Account
                </label>
                <select className="form-select" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ padding: '12px 14px' }}>
                  {selectedRole.users.map((u) => (
                    <option key={u.email} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Password
                </label>
                <input type="password" className="form-input" placeholder="Enter password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus
                  style={{ padding: '12px 14px' }} />
              </div>

              <button type="submit" className="btn" disabled={loading}
                style={{
                  width: '100%', padding: 12, fontSize: '0.95rem',
                  background: selectedRole.gradient, color: 'white',
                  boxShadow: `0 4px 16px ${selectedRole.color}40`,
                }}>
                {loading ? 'Signing in...' : `Sign In as ${selectedRole.label}`}
              </button>
            </form>

            <div style={{
              marginTop: 16, padding: 12, background: 'rgba(99,102,241,0.06)',
              borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              Password: <code style={{ color: 'var(--primary-400)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>
                {selectedRole.key === 'admin' ? 'admin123' : selectedRole.key === 'manager' ? 'manager123' : 'employee123'}
              </code>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
