import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageLeaveTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', annual_quota: 0, carry_forward_max: 0, is_paid: true, description: '' });

  const fetchTypes = () => { setLoading(true); api.get('/admin/leave-types').then(r => setTypes(r.data.leave_types || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/leave-types', form); toast.success('Leave type created!'); setShowForm(false); setForm({ name: '', annual_quota: 0, carry_forward_max: 0, is_paid: true, description: '' }); fetchTypes(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div><h1 className="text-3xl font-bold text-foreground tracking-tight">Leave Types</h1><p className="text-muted-foreground mt-1">Configure leave type policies and quotas</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{showForm ? 'Close' : '+ Add Type'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Name</label><input className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Annual Quota</label><input type="number" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.annual_quota} onChange={e => setForm({ ...form, annual_quota: parseInt(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Max Carry Forward</label><input type="number" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.carry_forward_max} onChange={e => setForm({ ...form, carry_forward_max: parseInt(e.target.value) })} /></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Is Paid?</label><select className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.value === 'true' })}><option value="true">Yes - Paid</option><option value="false">No - Unpaid</option></select></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Description</label><textarea className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Create Leave Type</button>
        </form>
      )}

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-semibold text-muted-foreground">Name</th><th className="text-left p-4 font-semibold text-muted-foreground">Quota</th><th className="text-left p-4 font-semibold text-muted-foreground">Carry Forward</th><th className="text-left p-4 font-semibold text-muted-foreground">Paid</th><th className="text-left p-4 font-semibold text-muted-foreground">Description</th></tr></thead>
          <tbody>{types.map(t => (
            <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="p-4 font-semibold text-foreground">{t.name}</td><td className="p-4 text-muted-foreground">{t.annual_quota} days</td><td className="p-4 text-muted-foreground">{t.carry_forward_max} days</td>
              <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${t.is_paid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{t.is_paid ? 'Paid' : 'Unpaid'}</span></td>
              <td className="p-4 text-xs text-muted-foreground">{t.description || '—'}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
