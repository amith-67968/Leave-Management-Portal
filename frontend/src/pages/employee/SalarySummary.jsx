import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function SalarySummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaves/salary-summary?year=' + new Date().getFullYear())
      .then(r => setSummary(r.data.salary_summary || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthName = (m) => new Date(2026, m - 1).toLocaleString('en', { month: 'long' });

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Salary Summary</h1>
        <p>View your salary deductions due to Loss of Pay (LOP)</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Monthly Salary</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>₹{parseFloat(user?.monthly_salary || 0).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Per Day Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-400)' }}>₹{(parseFloat(user?.monthly_salary || 0) / 30).toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Total LOP Deductions ({new Date().getFullYear()})</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
              ₹{summary.reduce((a, s) => a + parseFloat(s.deduction_amount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {summary.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>No salary deductions</h3>
          <p>Great! You have no LOP deductions this year.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Month</th><th>LOP Days</th><th>Deduction</th><th>Final Salary</th><th>Generated</th></tr></thead>
            <tbody>
              {summary.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{monthName(s.month)} {s.year}</td>
                  <td><span className="badge danger">{s.lop_days} days</span></td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-₹{parseFloat(s.deduction_amount).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(s.final_salary).toLocaleString()}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(s.generated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
