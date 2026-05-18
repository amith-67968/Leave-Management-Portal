import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', manager_id: '', monthly_salary: '' });

  const fetchUsers = () => { setLoading(true); api.get('/admin/users').then(r => setUsers(r.data.users || [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchUsers(); }, []);

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/users', { ...form, monthly_salary: parseFloat(form.monthly_salary) || 0 }); toast.success('User created!'); setShowForm(false); setForm({ name: '', email: '', password: '', role: 'employee', manager_id: '', monthly_salary: '' }); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const roleColors = { admin: 'bg-amber-100 text-amber-800', manager: 'bg-emerald-100 text-emerald-800', employee: 'bg-blue-100 text-blue-800' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div><h1 className="text-3xl font-bold text-foreground tracking-tight">Manage Users</h1><p className="text-muted-foreground mt-1">Add and manage organization users</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">{showForm ? 'Close Form' : '+ Add User'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Full Name</label><input name="name" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.name} onChange={handleChange} required /></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Email</label><input name="email" type="email" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.email} onChange={handleChange} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Password</label><input name="password" type="password" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.password} onChange={handleChange} required /></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Role</label><select name="role" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.role} onChange={handleChange}><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Manager</label><select name="manager_id" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.manager_id} onChange={handleChange}><option value="">None</option>{managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-sm font-semibold text-foreground">Monthly Salary (₹)</label><input name="monthly_salary" type="number" className="w-full h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm" value={form.monthly_salary} onChange={handleChange} /></div>
          </div>
          <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Create User</button>
        </form>
      )}

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left p-4 font-semibold text-muted-foreground">Name</th><th className="text-left p-4 font-semibold text-muted-foreground">Email</th><th className="text-left p-4 font-semibold text-muted-foreground">Role</th><th className="text-left p-4 font-semibold text-muted-foreground">Manager</th><th className="text-left p-4 font-semibold text-muted-foreground">Salary</th><th className="text-left p-4 font-semibold text-muted-foreground">Status</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="p-4 font-semibold text-foreground">{u.name}</td><td className="p-4 text-muted-foreground">{u.email}</td>
              <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${roleColors[u.role] || ''}`}>{u.role}</span></td>
              <td className="p-4 text-muted-foreground">{u.manager_name || '—'}</td><td className="p-4 text-muted-foreground">₹{parseFloat(u.monthly_salary || 0).toLocaleString()}</td>
              <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
    </div>
  );
}
