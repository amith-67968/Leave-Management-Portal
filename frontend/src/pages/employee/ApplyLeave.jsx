import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({ leave_type_id: '', from_date: '', to_date: '', reason: '' });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/leaves/balance').then(r => {
      const types = (r.data.balances || []).map(b => ({ id: b.leave_type_id, name: b.leave_type_name, remaining: b.remaining }));
      setLeaveTypes(types);
      if (types.length > 0) setForm(f => ({ ...f, leave_type_id: types[0].id }));
    });
  }, []);

  useEffect(() => {
    if (form.from_date && form.to_date && new Date(form.to_date) >= new Date(form.from_date)) {
      const start = new Date(form.from_date);
      const end = new Date(form.to_date);
      let days = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) days++;
      }
      setPreview(days);
    } else {
      setPreview(null);
    }
  }, [form.from_date, form.to_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted!');
      setForm({ leave_type_id: leaveTypes[0]?.id || '', from_date: '', to_date: '', reason: '' });
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Apply for Leave</h1>
        <p className="text-muted-foreground mt-1">Submit a new leave request</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Leave Type</label>
            <select className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={form.leave_type_id} onChange={e => setForm({ ...form, leave_type_id: e.target.value })}>
              {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.remaining} days left)</option>)}
            </select>
          </div>
          {preview !== null && (
            <div className="flex items-end">
              <div className="w-full p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <span className="text-2xl font-bold text-primary">{preview}</span>
                <p className="text-xs text-muted-foreground">working day(s)</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">From Date</label>
            <input type="date" className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">To Date</label>
            <input type="date" className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} min={form.from_date} required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Reason</label>
          <textarea className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" rows={3} placeholder="Describe your reason for leave..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
        </div>

        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
