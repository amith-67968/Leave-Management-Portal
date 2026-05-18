import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/holidays?year=${year}`)
      .then(r => setHolidays(r.data.holidays || []))
      .catch(console.error).finally(() => setLoading(false));
  }, [year]);

  const months = {};
  holidays.forEach(h => {
    const m = new Date(h.date).toLocaleString('en', { month: 'long' });
    if (!months[m]) months[m] = [];
    months[m].push(h);
  });

  const isPast = (d) => new Date(d) < new Date();

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Holiday Calendar</h1>
          <p>Company holidays for {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y - 1)}>← {year - 1}</button>
          <button className="btn btn-primary btn-sm">{year}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y + 1)}>{year + 1} →</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : Object.keys(months).length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No holidays found for {year}</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {Object.entries(months).map(([month, hols]) => (
            <div key={month} className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>{month}</h3>
              {hols.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border-color)', opacity: isPast(h.date) ? 0.5 : 1 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: isPast(h.date) ? 'var(--bg-tertiary)' : 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontSize: '0.8rem', fontWeight: 700, color: isPast(h.date) ? 'var(--text-muted)' : 'var(--primary-400)', lineHeight: 1.1, flexShrink: 0 }}>
                    <span style={{ fontSize: '1.1rem' }}>{new Date(h.date).getDate()}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>{new Date(h.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(h.date).toLocaleDateString('en', { weekday: 'long' })}
                      {h.is_optional && <span className="badge" style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.65rem', background: 'var(--warning-bg)', color: '#92400e' }}>Optional</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
