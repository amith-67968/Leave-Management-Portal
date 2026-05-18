import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLeaves = () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/leaves/my${params}`).then(r => setLeaves(r.data.leaves || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this leave?')) return;
    try { await api.delete(`/leaves/${id}`); toast.success('Leave cancelled'); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusColors = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">My Leaves</h1>
        <p className="text-muted-foreground mt-1">Track all your leave requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{s}</button>
        ))}
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : leaves.length === 0 ? (
        <div className="text-center py-16"><span className="text-5xl mb-4 block">📋</span><h3 className="text-lg font-semibold text-foreground">No leaves found</h3></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">From</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">To</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Days</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Remark</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{l.leave_type_name}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(l.from_date)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(l.to_date)}</td>
                    <td className="p-4 font-bold text-foreground">{l.total_days}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[l.status] || ''}`}>{l.status}</span></td>
                    <td className="p-4 text-muted-foreground text-xs max-w-[150px] truncate">{l.decision_remark || '—'}</td>
                    <td className="p-4">
                      {(l.status === 'pending' || l.status === 'approved') && (
                        <button onClick={() => handleCancel(l.id)} className="px-3 py-1 text-xs font-semibold text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
