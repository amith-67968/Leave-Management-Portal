import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineUsers, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCurrencyRupee } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Organization-wide leave management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><HiOutlineUsers /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats?.total_users || 0}</h3><p className="text-xs text-muted-foreground">Total Users</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl"><HiOutlineClock /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats?.pending_leaves || 0}</h3><p className="text-xs text-muted-foreground">Pending Leaves</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl"><HiOutlineCheckCircle /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats?.approved_leaves || 0}</h3><p className="text-xs text-muted-foreground">Approved Leaves</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl"><HiOutlineCurrencyRupee /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats?.total_lop_days || 0}</h3><p className="text-xs text-muted-foreground">Total LOP Days</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">📊 Quick Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <div className="text-3xl font-bold text-primary">₹{(stats?.total_deductions || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Deductions</div>
          </div>
          <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{stats?.total_users > 0 ? ((stats?.approved_leaves / stats?.total_users) || 0).toFixed(1) : 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Leaves per User</div>
          </div>
        </div>
      </div>
    </div>
  );
}
