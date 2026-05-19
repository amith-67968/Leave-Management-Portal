import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineDocumentAdd, HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const [balances, setBalances] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/leaves/balance'),
      api.get('/leaves/my'),
    ]).then(([balRes, leavesRes]) => {
      setBalances(balRes.data.balances || []);
      const leaves = leavesRes.data.leaves || [];
      setStats({
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        total: leaves.length,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your leaves and track balances</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><HiOutlineClock /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats.pending}</h3><p className="text-xs text-muted-foreground">Pending</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl"><HiOutlineCheckCircle /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats.approved}</h3><p className="text-xs text-muted-foreground">Approved</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl"><HiOutlineClipboardList /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{stats.total}</h3><p className="text-xs text-muted-foreground">Total Requests</p></div>
        </div>
        <Link to="/employee/apply-leave" className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl p-5 flex items-center gap-4 hover:bg-primary/15 transition-colors group">
          <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl group-hover:scale-110 transition-transform"><HiOutlineDocumentAdd /></div>
          <div><h3 className="text-sm font-bold text-primary">Apply Leave</h3><p className="text-xs text-muted-foreground">Request time off</p></div>
        </Link>
      </div>

      {/* Leave Balances */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-5">Leave Balances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map(b => {
            const total = parseFloat(b.allocated) + parseFloat(b.carried_forward || 0);
            const used = parseFloat(b.used);
            const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
            return (
              <div key={b.id} className="p-4 rounded-lg bg-background border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{b.leave_type_name}</h4>
                    <p className="text-xs text-muted-foreground">{b.is_paid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                  <span className="text-xl font-bold text-primary">{parseFloat(b.remaining)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{used} used</span>
                  <span>{total} total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
