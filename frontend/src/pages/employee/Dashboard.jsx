import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { HiOutlineClipboardList, HiOutlineCalendar, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';

export default function EmployeeDashboard() {
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/leaves/balance'),
      api.get('/leaves/my'),
      api.get('/holidays?year=' + new Date().getFullYear()),
    ]).then(([b, l, h]) => {
      setBalances(b.data.balances || []);
      setLeaves(l.data.leaves || []);
      setHolidays(h.data.holidays || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 5);

  const getColor = (i) => ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4];

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your leave balances and recent activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon primary"><HiOutlineClipboardList /></div>
          <div className="stat-content"><h3>{leaves.length}</h3><p>Total Leaves</p></div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning"><HiOutlineClock /></div>
          <div className="stat-content"><h3>{pending}</h3><p>Pending</p></div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><HiOutlineCheckCircle /></div>
          <div className="stat-content"><h3>{approved}</h3><p>Approved</p></div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon info"><HiOutlineCalendar /></div>
          <div className="stat-content"><h3>{upcoming.length}</h3><p>Upcoming Holidays</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Leave Balances</h3></div>
          <div className="balance-grid" style={{ gridTemplateColumns: '1fr' }}>
            {balances.map((b, i) => {
              const total = parseFloat(b.allocated) + parseFloat(b.carried_forward);
              const used = parseFloat(b.used);
              const pct = total > 0 ? ((total - used) / total) * 100 : 0;
              const circumference = 2 * Math.PI * 42;
              const offset = circumference - (pct / 100) * circumference;
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="balance-ring" style={{ width: 64, height: 64, margin: 0 }}>
                    <svg style={{ width: 64, height: 64 }}>
                      <circle className="ring-bg" cx="32" cy="32" r="26" strokeWidth="6" />
                      <circle className="ring-fill" cx="32" cy="32" r="26" strokeWidth="6"
                        stroke={getColor(i)} strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 - (pct / 100) * 2 * Math.PI * 26} />
                    </svg>
                    <span className="balance-ring-text" style={{ fontSize: '0.85rem' }}>{Math.round(pct)}%</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.leave_type_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {b.remaining} / {total} remaining · {used} used
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Upcoming Holidays</h3></div>
          {upcoming.length === 0 ? (
            <div className="empty-state"><p>No upcoming holidays</p></div>
          ) : (
            upcoming.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-400)', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span>{new Date(h.date).toLocaleDateString('en', { day: 'numeric' })}</span>
                  <span style={{ fontSize: '0.6rem' }}>{new Date(h.date).toLocaleDateString('en', { month: 'short' })}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(h.date).toLocaleDateString('en', { weekday: 'long' })}
                    {h.is_optional && <span className="badge" style={{ marginLeft: 8, padding: '2px 8px', background: 'var(--warning-bg)', color: '#92400e' }}>Optional</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
