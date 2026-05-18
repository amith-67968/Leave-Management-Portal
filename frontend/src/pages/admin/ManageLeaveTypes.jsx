import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageLeaveTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', annual_quota: 0, carry_forward_max: 0, is_paid: true, description: '' });

  const fetchTypes = () => {
    setLoading(true);
    api.get('/admin/leave-types').then(r => setTypes(r.data.leave_types || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/leave-types', form);
      toast.success('Leave type created!');
      setShowForm(false);
      setForm({ name: '', annual_quota: 0, carry_forward_max: 0, is_paid: true, description: '' });
      fetchTypes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Leave Types</h1><p>Configure leave type policies and quotas</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Type'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 640 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Quota</label>
                <input type="number" className="form-input" value={form.annual_quota} onChange={e => setForm({ ...form, annual_quota: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Max Carry Forward</label>
                <input type="number" className="form-input" value={form.carry_forward_max} onChange={e => setForm({ ...form, carry_forward_max: parseInt(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Is Paid?</label>
                <select className="form-select" value={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.value === 'true' })}>
                  <option value="true">Yes - Paid Leave</option>
                  <option value="false">No - Unpaid Leave</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">Create Leave Type</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Annual Quota</th><th>Carry Forward</th><th>Paid</th><th>Description</th><th>Status</th></tr></thead>
            <tbody>
              {types.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.annual_quota} days</td>
                  <td>{t.carry_forward_max} days</td>
                  <td><span className={`badge ${t.is_paid ? 'approved' : 'rejected'}`}>{t.is_paid ? 'Paid' : 'Unpaid'}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.description || '—'}</td>
                  <td><span className={`badge ${t.is_active ? 'approved' : 'cancelled'}`}>{t.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
