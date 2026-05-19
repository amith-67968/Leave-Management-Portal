import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', name: '', is_optional: false });

  const fetch_ = () => { setLoading(true); api.get('/holidays?year=' + new Date().getFullYear()).then(r => setHolidays(r.data.holidays || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/holidays/admin', form); toast.success('Holiday added!'); setShowForm(false); setForm({ date: '', name: '', is_optional: false }); fetch_(); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/holidays/admin/${id}`); toast.success('Deleted'); fetch_(); } catch (err) { toast.error('Failed'); } };
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Holidays</h1><p className="text-muted-foreground mt-1">Company holidays for {new Date().getFullYear()}</p></div>
        <button onClick={() => setShowForm(!showForm)} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold sm:w-auto">{showForm ? 'Close' : '+ Add Holiday'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 max-w-md space-y-4">
          <div className="space-y-1"><label className="text-sm font-semibold">Date</label><input type="date" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
          <div className="space-y-1"><label className="text-sm font-semibold">Name</label><input className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_optional} onChange={e => setForm({...form, is_optional: e.target.checked})} /><span className="text-sm">Optional</span></label>
          <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">Add</button>
        </form>
      )}
      {loading ? <p>Loading...</p> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[640px] w-full text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="text-left p-4 font-semibold text-muted-foreground">Date</th><th className="text-left p-4 font-semibold text-muted-foreground">Day</th><th className="text-left p-4 font-semibold text-muted-foreground">Name</th><th className="text-left p-4 font-semibold text-muted-foreground">Type</th><th className="p-4">Actions</th></tr></thead>
          <tbody>{holidays.map(h => (<tr key={h.id} className="border-b last:border-0"><td className="p-4 font-semibold">{fmtDate(h.date)}</td><td className="p-4 text-muted-foreground">{new Date(h.date).toLocaleDateString('en',{weekday:'long'})}</td><td className="p-4">{h.name}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${h.is_optional?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800'}`}>{h.is_optional?'Optional':'Mandatory'}</span></td><td className="p-4"><button onClick={()=>handleDelete(h.id)} className="px-3 py-1 text-xs text-destructive bg-destructive/10 rounded-lg">Delete</button></td></tr>))}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
