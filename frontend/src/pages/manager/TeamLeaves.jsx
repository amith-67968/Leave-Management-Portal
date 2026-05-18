import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeamLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [remarkModal, setRemarkModal] = useState({ open: false, leaveId: null, remark: '' });

  const fetchLeaves = () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/leaves/team${params}`).then(r => setLeaves(r.data.leaves || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleApprove = async (id) => {
    try { await api.patch(`/leaves/${id}/approve`, { remark: 'Approved' }); toast.success('Leave approved'); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const openReject = (id) => setRemarkModal({ open: true, leaveId: id, remark: '' });

  const handleReject = async () => {
    if (!remarkModal.remark.trim()) { toast.error('Remark is mandatory'); return; }
    try { await api.patch(`/leaves/${remarkModal.leaveId}/reject`, { remark: remarkModal.remark }); toast.success('Leave rejected'); setRemarkModal({ open: false, leaveId: null, remark: '' }); fetchLeaves(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusColors = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-600' };
  const dayPartLabel = { full: 'Full day', first_half: 'First half', second_half: 'Second half' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Team Leaves</h1>
        <p className="text-muted-foreground mt-1">Review and manage your team's leave requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{s}</button>
        ))}
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : leaves.length === 0 ? (
        <div className="text-center py-16"><span className="text-5xl mb-4 block">✅</span><h3 className="text-lg font-semibold text-foreground">No {filter} leaves</h3></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-muted-foreground">Employee</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">From</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">To</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Days</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Duration</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Reason</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                {filter === 'pending' && <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>}
              </tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{l.employee_name}</td>
                    <td className="p-4 text-muted-foreground">{l.leave_type_name}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(l.from_date)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(l.to_date)}</td>
                    <td className="p-4 font-bold text-foreground">{l.total_days}</td>
                    <td className="p-4 text-muted-foreground">{dayPartLabel[l.day_part] || 'Full day'}</td>
                    <td className="p-4 text-muted-foreground text-xs max-w-[150px] truncate">{l.reason}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[l.status]}`}>{l.status}</span></td>
                    {filter === 'pending' && (
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(l.id)} className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors">Approve</button>
                          <button onClick={() => openReject(l.id)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">Reject</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {remarkModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Reject Leave</h3>
            <p className="text-sm text-muted-foreground mb-4">Please provide a reason for rejection (mandatory).</p>
            <textarea className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={3} placeholder="Enter rejection reason..." value={remarkModal.remark} onChange={e => setRemarkModal({ ...remarkModal, remark: e.target.value })} autoFocus />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRemarkModal({ open: false, leaveId: null, remark: '' })} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors">Reject Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
