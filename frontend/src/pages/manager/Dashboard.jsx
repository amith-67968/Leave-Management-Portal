import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';

export default function ManagerDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaves/team').then(r => setLeaves(r.data.leaves || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter(l => l.status === 'pending');
  const approved = leaves.filter(l => l.status === 'approved');

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Team leave overview & pending approvals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><HiOutlineUserGroup /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{leaves.length}</h3><p className="text-xs text-muted-foreground">Total Requests</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl"><HiOutlineClock /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{pending.length}</h3><p className="text-xs text-muted-foreground">Pending Approval</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl"><HiOutlineCheckCircle /></div>
          <div><h3 className="text-2xl font-bold text-foreground">{approved.length}</h3><p className="text-xs text-muted-foreground">Approved</p></div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">⚡ Requires Your Action</h3>
          <div className="space-y-3">
            {pending.slice(0, 5).map(l => (
              <div key={l.id} className="flex flex-col gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{l.employee_name}</h4>
                  <p className="text-xs text-muted-foreground">{l.leave_type_name} · {l.total_days} day(s) · {new Date(l.from_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(l.to_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <a href="/manager/team-leaves" className="w-full px-4 py-1.5 text-center bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors sm:w-auto">Review</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
