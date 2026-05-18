import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PayrollReport() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payroll?year=' + new Date().getFullYear())
      .then(r => setPayroll(r.data.payroll || []))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const monthName = (m) => new Date(2026, m - 1).toLocaleString('en', { month: 'long' });
  const totalDeductions = payroll.reduce((a, p) => a + parseFloat(p.deduction_amount || 0), 0);
  const totalLop = payroll.reduce((a, p) => a + parseFloat(p.lop_days || 0), 0);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payroll Report</h1>
        <p>Salary deductions due to Loss of Pay across the organization</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card danger">
          <div className="stat-icon danger">📉</div>
          <div className="stat-content"><h3>₹{totalDeductions.toLocaleString()}</h3><p>Total Deductions</p></div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon warning">📅</div>
          <div className="stat-content"><h3>{totalLop}</h3><p>Total LOP Days</p></div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary">👥</div>
          <div className="stat-content"><h3>{new Set(payroll.map(p => p.user_id)).size}</h3><p>Affected Employees</p></div>
        </div>
      </div>

      {payroll.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>No payroll deductions</h3>
          <p>No employees have exceeded their paid leave balance this year.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Employee</th><th>Email</th><th>Month</th><th>Monthly Salary</th><th>LOP Days</th><th>Deduction</th><th>Final Salary</th></tr></thead>
            <tbody>
              {payroll.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{monthName(p.month)} {p.year}</td>
                  <td>₹{parseFloat(p.monthly_salary).toLocaleString()}</td>
                  <td><span className="badge danger">{p.lop_days}</span></td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-₹{parseFloat(p.deduction_amount).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(p.final_salary).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
