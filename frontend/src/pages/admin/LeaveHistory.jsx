import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/admin/leaves${params}`)
      .then(r => setLeaves(r.data.leaves || []))
      .catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Leave History</h1>
        <p>Complete leave history across the organization</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : leaves.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No leaves found</h3></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Decided By</th><th>Remark</th></tr></thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.employee_name}</td>
                  <td>{l.leave_type_name}</td>
                  <td>{formatDate(l.from_date)}</td>
                  <td>{formatDate(l.to_date)}</td>
                  <td>{l.total_days}</td>
                  <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                  <td>{l.decided_by_name || '—'}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {l.decision_remark || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
