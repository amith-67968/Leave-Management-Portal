import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); const p = filter !== 'all' ? `?status=${filter}` : ''; api.get(`/admin/leaves${p}`).then(r => setLeaves(r.data.leaves || [])).catch(console.error).finally(() => setLoading(false)); }, [filter]);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const sc = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-foreground">Leave History</h1><p className="text-muted-foreground mt-1">Organization-wide leave history</p></div>
      <div className="flex gap-2 flex-wrap">{['all','pending','approved','rejected','cancelled'].map(s=>(<button key={s} onClick={()=>setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize ${filter===s?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'}`}>{s}</button>))}</div>
      {loading ? <p>Loading...</p> : leaves.length === 0 ? <div className="text-center py-16"><span className="text-5xl block mb-4">📋</span><h3 className="font-semibold text-foreground">No leaves found</h3></div> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="text-left p-4 font-semibold text-muted-foreground">Employee</th><th className="text-left p-4 font-semibold text-muted-foreground">Type</th><th className="text-left p-4 font-semibold text-muted-foreground">From</th><th className="text-left p-4 font-semibold text-muted-foreground">To</th><th className="text-left p-4 font-semibold text-muted-foreground">Days</th><th className="text-left p-4 font-semibold text-muted-foreground">Status</th><th className="text-left p-4 font-semibold text-muted-foreground">Remark</th></tr></thead>
          <tbody>{leaves.map(l=>(<tr key={l.id} className="border-b last:border-0 hover:bg-muted/30"><td className="p-4 font-semibold">{l.employee_name}</td><td className="p-4 text-muted-foreground">{l.leave_type_name}</td><td className="p-4 text-muted-foreground">{fmtDate(l.from_date)}</td><td className="p-4 text-muted-foreground">{fmtDate(l.to_date)}</td><td className="p-4 font-bold">{l.total_days}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${sc[l.status]||''}`}>{l.status}</span></td><td className="p-4 text-xs text-muted-foreground max-w-[120px] truncate">{l.decision_remark||'—'}</td></tr>))}</tbody>
        </table></div>
      )}
    </div>
  );
}
