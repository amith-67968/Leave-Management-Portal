import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PayrollReport() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/payroll').then(r => setPayroll(r.data.payroll || [])).catch(console.error).finally(() => setLoading(false)); }, []);
  const mn = (m) => new Date(2026, m - 1).toLocaleString('en', { month: 'long' });

  if (loading) return <p className="text-muted-foreground p-8">Loading...</p>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-foreground">Payroll Report</h1><p className="text-muted-foreground mt-1">Salary deductions from excess leave</p></div>
      {payroll.length === 0 ? <div className="text-center py-16 bg-card border border-border rounded-xl"><span className="text-5xl block mb-4">🎉</span><h3 className="font-semibold text-foreground">No deductions recorded</h3></div> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden"><table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="text-left p-4 font-semibold text-muted-foreground">Employee</th><th className="text-left p-4 font-semibold text-muted-foreground">Month</th><th className="text-left p-4 font-semibold text-muted-foreground">LOP Days</th><th className="text-left p-4 font-semibold text-muted-foreground">Deduction</th><th className="text-left p-4 font-semibold text-muted-foreground">Final Salary</th></tr></thead>
          <tbody>{payroll.map(p=>(<tr key={p.id} className="border-b last:border-0"><td className="p-4 font-semibold">{p.employee_name}</td><td className="p-4 text-muted-foreground">{mn(p.month)} {p.year}</td><td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">{p.lop_days}</span></td><td className="p-4 text-destructive font-bold">-₹{parseFloat(p.deduction_amount).toLocaleString()}</td><td className="p-4 font-bold">₹{parseFloat(p.final_salary).toLocaleString()}</td></tr>))}</tbody>
        </table></div>
      )}
    </div>
  );
}
