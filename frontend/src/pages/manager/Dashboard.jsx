import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineUserGroup, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function ManagerDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaves/team')
      .then(r => setLeaves(r.data.leaves || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter(l => l.status === 'pending');
  const approved = leaves.filter(l => l.status === 'approved');
  const rejected = leaves.filter(l => l.status === 'rejected');
  const uniqueEmployees = new Set(leaves.map(l => l.user_id)).size;

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manager Dashboard</h1>
        <p>Overview of your team's leave activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon primary"><HiOutlineUserGroup /></div>
          <div className="stat-content"><h3>{uniqueEmployees}</h3><p>Team Members</p></div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><HiOutlineClock /></div>
          <div className="stat-content"><h3>{pending.length}</h3><p>Pending Requests</p></div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><HiOutlineCheckCircle /></div>
          <div className="stat-content"><h3>{approved.length}</h3><p>Approved</p></div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger"><HiOutlineXCircle /></div>
          <div className="stat-content"><h3>{rejected.length}</h3><p>Rejected</p></div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏳ Pending Requests ({pending.length})</h3>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th></tr></thead>
              <tbody>
                {pending.slice(0, 5).map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.employee_name}</td>
                    <td>{l.leave_type_name}</td>
                    <td>{new Date(l.from_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>{new Date(l.to_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>{l.total_days}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
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
