import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function SalarySummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaves/salary-summary').then(r => setSummary(r.data.salary_summary || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const monthName = (m) => new Date(2026, m - 1).toLocaleString('en', { month: 'long' });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Salary Summary</h1>
        <p className="text-muted-foreground mt-1">Track salary deductions due to Loss of Pay</p>
      </div>

      {summary.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <span className="text-5xl mb-4 block">🎉</span>
          <h3 className="text-lg font-semibold text-foreground">No deductions!</h3>
          <p className="text-sm text-muted-foreground mt-1">You haven't exceeded your paid leave balance.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-muted-foreground">Month</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Salary</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">LOP Days</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Deduction</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Final Salary</th>
              </tr></thead>
              <tbody>
                {summary.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-semibold text-foreground">{monthName(s.month)} {s.year}</td>
                    <td className="p-4 text-muted-foreground">₹{parseFloat(s.monthly_salary).toLocaleString()}</td>
                    <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">{s.lop_days}</span></td>
                    <td className="p-4 text-destructive font-bold">-₹{parseFloat(s.deduction_amount).toLocaleString()}</td>
                    <td className="p-4 font-bold text-foreground">₹{parseFloat(s.final_salary).toLocaleString()}</td>
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
