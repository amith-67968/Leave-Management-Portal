import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineUsers, HiOutlineClock, HiOutlineCheckCircle, HiOutlineCurrencyRupee, HiOutlineChartBar } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Organization-wide leave management overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon primary"><HiOutlineUsers /></div>
          <div className="stat-content"><h3>{stats?.total_users || 0}</h3><p>Total Users</p></div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><HiOutlineClock /></div>
          <div className="stat-content"><h3>{stats?.pending_leaves || 0}</h3><p>Pending Leaves</p></div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><HiOutlineCheckCircle /></div>
          <div className="stat-content"><h3>{stats?.approved_leaves || 0}</h3><p>Approved Leaves</p></div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon danger"><HiOutlineCurrencyRupee /></div>
          <div className="stat-content"><h3>{stats?.total_lop_days || 0}</h3><p>Total LOP Days</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">📊 Quick Insights</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div style={{ padding: 20, background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <HiOutlineChartBar size={28} style={{ color: 'var(--primary-400)', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{(stats?.total_deductions || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Deductions</div>
          </div>
          <div style={{ padding: 20, background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <HiOutlineCheckCircle size={28} style={{ color: 'var(--success)', marginBottom: 8 }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {stats?.total_users > 0 ? ((stats?.approved_leaves / stats?.total_users) || 0).toFixed(1) : 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Leaves per User</div>
          </div>
        </div>
      </div>
    </div>
  );
}
