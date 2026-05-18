import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, Mail, Lock, User, Users, ShieldCheck } from 'lucide-react';

const ROLE_CONFIG = {
  employee: {
    label: 'Employee',
    icon: User,
    description: 'Apply for leave, check balances & track status',
    color: 'from-blue-600 to-indigo-600',
    users: [
      { name: 'Amit Kumar', email: 'amit.kumar@company.com' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@company.com' },
      { name: 'Vikram Singh', email: 'vikram.singh@company.com' },
      { name: 'Neha Gupta', email: 'neha.gupta@company.com' },
      { name: 'Arjun Das', email: 'arjun.das@company.com' },
    ],
  },
  manager: {
    label: 'Manager',
    icon: Users,
    description: 'Approve/reject leaves & monitor team availability',
    color: 'from-emerald-600 to-teal-600',
    users: [
      { name: 'Rahul Sharma', email: 'rahul.sharma@company.com' },
      { name: 'Priya Patel', email: 'priya.patel@company.com' },
    ],
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    description: 'Manage users, policies, holidays & payroll reports',
    color: 'from-amber-600 to-orange-600',
    users: [
      { name: 'System Admin', email: 'admin@company.com' },
    ],
  },
};

export default function RoleLoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const isValidRole = Boolean(ROLE_CONFIG[role]);
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.employee;

  const Icon = config.icon;

  useEffect(() => {
    if (!isValidRole) navigate('/login');
  }, [isValidRole, navigate]);

  useEffect(() => {
    if (!isValidRole) return undefined;

    let cancelled = false;
    const fallbackUsers = config.users;

    setAccounts(fallbackUsers);
    setEmail(fallbackUsers[0]?.email || '');
    setAccountsLoading(true);

    api.get(`/auth/accounts/${role}`)
      .then((res) => {
        if (cancelled) return;

        const users = res.data.users?.length ? res.data.users : fallbackUsers;
        setAccounts(users);
        setEmail((currentEmail) => (
          users.some((user) => user.email === currentEmail)
            ? currentEmail
            : users[0]?.email || ''
        ));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load login accounts:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, config, isValidRole]);

  if (!isValidRole) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dashMap = { admin: '/admin/dashboard', manager: '/manager/dashboard', employee: '/employee/dashboard' };
      navigate(dashMap[user.role] || '/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start font-sans relative isolate px-4 pt-14 pb-6 sm:pt-16 lg:pt-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] bg-size-[32px_32px]" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck size={20} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">LeaveFlow</span>
        </div>
        <Link to="/login" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to roles
        </Link>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-[480px]">
        {/* Role Badge */}
        <div className="text-center mb-6">
          <div className={`inline-flex p-3.5 rounded-2xl bg-primary/10 mb-3`}>
            <Icon size={30} className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-[38px] font-extrabold tracking-tight leading-tight text-foreground mb-2">
            Sign in as {config.label}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">{config.description}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="min-h-[440px] sm:min-h-[470px] bg-card border border-border rounded-3xl p-7 py-8 sm:p-10 sm:py-11 shadow-lg flex flex-col gap-9">
          {/* Account Selector */}
          <div className="space-y-3">
            <label className="text-base sm:text-[17px] font-semibold text-foreground flex items-center gap-2">
              <Mail size={14} /> Select Account
            </label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[52px] px-5 rounded-xl bg-background border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            >
              {accounts.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {accountsLoading && (
              <p className="text-xs text-muted-foreground">Refreshing accounts...</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-3">
            <label className="text-base sm:text-[17px] font-semibold text-foreground flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              className="w-full h-[52px] px-5 rounded-xl bg-background border border-border text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {/* Submit */}
          <div className="mt-auto pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-[#C79B73] text-[#3F2818] text-base font-semibold tracking-wide shadow-sm transition-colors hover:bg-[#B9865E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C79B73]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : `Sign In as ${config.label}`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
