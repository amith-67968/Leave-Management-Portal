import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, User, Users, ShieldCheck } from 'lucide-react';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button';

const ROLE_CONFIG = {
  employee: {
    label: 'Employee',
    icon: User,
    description: 'Apply for leave, check balances & track status',
    color: 'from-blue-600 to-indigo-600',
    users: [
      { name: 'Amit Kumar', email: 'amit.kumar@company.com', password: 'employee123' },
      { name: 'Sneha Reddy', email: 'sneha.reddy@company.com', password: 'employee123' },
      { name: 'Vikram Singh', email: 'vikram.singh@company.com', password: 'employee123' },
      { name: 'Neha Gupta', email: 'neha.gupta@company.com', password: 'employee123' },
      { name: 'Arjun Das', email: 'arjun.das@company.com', password: 'employee123' },
    ],
  },
  manager: {
    label: 'Manager',
    icon: Users,
    description: 'Approve/reject leaves & monitor team availability',
    color: 'from-emerald-600 to-teal-600',
    users: [
      { name: 'Rahul Sharma', email: 'rahul.sharma@company.com', password: 'manager123' },
      { name: 'Priya Patel', email: 'priya.patel@company.com', password: 'manager123' },
    ],
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    description: 'Manage users, policies, holidays & payroll reports',
    color: 'from-amber-600 to-orange-600',
    users: [
      { name: 'System Admin', email: 'admin@company.com', password: 'admin123' },
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

  const config = ROLE_CONFIG[role];
  if (!config) {
    navigate('/login');
    return null;
  }

  const Icon = config.icon;

  // Pre-fill first user on initial load
  if (!email && config.users.length > 0) {
    setEmail(config.users[0].email);
  }

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans relative isolate p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:32px_32px]" />

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
      <div className="w-full max-w-md mt-16">
        {/* Role Badge */}
        <div className="text-center mb-8">
          <div className={`inline-flex p-4 rounded-2xl bg-primary/10 mb-4`}>
            <Icon size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sign in as {config.label}
          </h1>
          <p className="text-muted-foreground text-sm">{config.description}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-5">
          {/* Account Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail size={14} /> Select Account
            </label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            >
              {config.users.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>

          {/* Submit */}
          <MetalButton
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : `Sign In as ${config.label}`}
          </MetalButton>
        </form>

      </div>
    </div>
  );
}
