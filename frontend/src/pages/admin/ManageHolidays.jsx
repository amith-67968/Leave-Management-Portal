import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', name: '', is_optional: false });

  const fetchHolidays = () => {
    setLoading(true);
    api.get('/holidays?year=' + new Date().getFullYear())
      .then(r => setHolidays(r.data.holidays || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays/admin', form);
      toast.success('Holiday added!');
      setShowForm(false);
      setForm({ date: '', name: '', is_optional: false });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add holiday');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/admin/${id}`);
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const isPast = (d) => new Date(d) < new Date();

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Manage Holidays</h1><p>Add and manage company holidays for {new Date().getFullYear()}</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add Holiday'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 500 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Holiday Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_optional} onChange={e => setForm({ ...form, is_optional: e.target.checked })} />
                <span className="form-label" style={{ margin: 0 }}>Optional Holiday</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Add Holiday</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Holiday</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id} style={{ opacity: isPast(h.date) ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{new Date(h.date).toLocaleDateString('en', { weekday: 'long' })}</td>
                  <td>{h.name}</td>
                  <td><span className={`badge ${h.is_optional ? 'pending' : 'approved'}`}>{h.is_optional ? 'Optional' : 'Mandatory'}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
