import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/holidays?year=' + new Date().getFullYear()).then(r => setHolidays(r.data.holidays || [])).catch(console.error).finally(() => setLoading(false)); }, []);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  if (loading) return <p className="text-muted-foreground p-8">Loading...</p>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-foreground">Holiday Calendar {new Date().getFullYear()}</h1><p className="text-muted-foreground mt-1">{holidays.length} holidays scheduled this year</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(h => {
          const past = h.date < today;
          return (
            <div key={h.id} className={`p-5 rounded-xl border transition-all ${past ? 'opacity-50 bg-muted/30 border-border' : 'bg-card border-border hover:shadow-lg hover:-translate-y-0.5'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">{new Date(h.date).toLocaleDateString('en', { weekday: 'long' })}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.is_optional ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{h.is_optional ? 'Optional' : 'Mandatory'}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{h.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{fmtDate(h.date)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
