import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ApplyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({ leave_type_id: '', from_date: '', to_date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get('/holidays').then(r => {
      // We just need leave types from balance endpoint
    });
    api.get('/leaves/balance').then(r => {
      const types = r.data.balances.map(b => ({ id: b.leave_type_id, name: b.leave_type_name, remaining: b.remaining }));
      setLeaveTypes(types);
      if (types.length > 0) setForm(f => ({ ...f, leave_type_id: types[0].id }));
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (form.from_date && form.to_date && new Date(form.to_date) >= new Date(form.from_date)) {
      const start = new Date(form.from_date);
      const end = new Date(form.to_date);
      let days = 0;
      const cur = new Date(start);
      while (cur <= end) {
        if (cur.getDay() !== 0 && cur.getDay() !== 6) days++;
        cur.setDate(cur.getDate() + 1);
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
      toast.error(err.response?.data?.error || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Apply for Leave</h1>
        <p>Submit a new leave request to your manager</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select name="leave_type_id" className="form-select" value={form.leave_type_id} onChange={handleChange} required>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name} ({lt.remaining} remaining)</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" name="from_date" className="form-input" value={form.from_date}
                onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" name="to_date" className="form-input" value={form.to_date}
                onChange={handleChange} required min={form.from_date || new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {preview !== null && (
            <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.9rem' }}>
              📅 Estimated working days: <strong style={{ color: 'var(--primary-400)' }}>{preview}</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> (excludes weekends, holidays may differ)</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea name="reason" className="form-textarea" placeholder="Describe the reason for your leave..."
              value={form.reason} onChange={handleChange} required rows={4} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
