import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeamLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [remark, setRemark] = useState('');

  const fetchLeaves = () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/leaves/team${params}`)
      .then(r => setLeaves(r.data.leaves || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/leaves/${id}/approve`, { remark: 'Approved' });
      toast.success('Leave approved!');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!remark.trim()) { toast.error('Remark is required'); return; }
    try {
      await api.patch(`/leaves/${rejectModal}/reject`, { remark });
      toast.success('Leave rejected');
      setRejectModal(null);
      setRemark('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Team Leaves</h1>
        <p>Manage your team's leave requests</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : leaves.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No {filter} requests</h3></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.employee_name}</td>
                  <td>{l.leave_type_name}</td>
                  <td>{formatDate(l.from_date)}</td>
                  <td>{formatDate(l.to_date)}</td>
                  <td>{l.total_days}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                  <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                  <td>
                    {l.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(l.id)}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(l.id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reject Leave</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
              Please provide a reason for rejection (mandatory):
            </p>
            <div className="form-group">
              <textarea className="form-textarea" placeholder="Enter rejection reason..." value={remark}
                onChange={e => setRemark(e.target.value)} rows={3} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setRejectModal(null); setRemark(''); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
