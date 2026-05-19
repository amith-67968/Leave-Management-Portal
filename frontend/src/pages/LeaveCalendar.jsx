import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const statusColors = {
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
};

const dayPartLabel = {
  full: 'Full',
  first_half: 'AM',
  second_half: 'PM',
};

function toISODate(date) {
  return date.toISOString().split('T')[0];
}

function formatMonthInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function expandLeaveDates(leave) {
  const dates = [];
  const start = new Date(leave.from_date);
  const end = new Date(leave.to_date);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(toISODate(d));
  }

  return dates;
}

export default function LeaveCalendar() {
  const [month, setMonth] = useState(formatMonthInput(new Date()));
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const { monthStart, monthEnd, cells } = useMemo(() => {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = new Date(year, monthNumber - 1, 1);
    const last = new Date(year, monthNumber, 0);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + i);
      days.push(current);
    }

    return {
      monthStart: toISODate(first),
      monthEnd: toISODate(last),
      cells: days,
    };
  }, [month]);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaves/calendar?start=${monthStart}&end=${monthEnd}`)
      .then((r) => setLeaves(r.data.leaves || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthStart, monthEnd]);

  const leavesByDate = useMemo(() => {
    const map = {};
    leaves.forEach((leave) => {
      expandLeaveDates(leave).forEach((date) => {
        map[date] = map[date] || [];
        map[date].push(leave);
      });
    });
    return map;
  }, [leaves]);

  const currentMonthNumber = Number(month.split('-')[1]) - 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Leave Calendar</h1>
          <p className="text-muted-foreground mt-1">See approved and pending leaves before planning yours.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground sm:w-auto"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <div className="min-w-[680px]">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-muted-foreground">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((date) => {
              const key = toISODate(date);
              const dayLeaves = leavesByDate[key] || [];
              const muted = date.getMonth() !== currentMonthNumber;

              return (
                <div key={key} className={`min-h-28 border-r border-b border-border p-2 sm:min-h-32 ${muted ? 'bg-muted/20 text-muted-foreground' : 'bg-card'}`}>
                  <div className="text-xs font-bold mb-2">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayLeaves.slice(0, 3).map((leave) => (
                      <div key={`${leave.id}-${key}`} className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusColors[leave.status] || 'bg-muted text-muted-foreground border-border'}`}>
                        <div className="truncate">{leave.employee_name}</div>
                        <div className="truncate opacity-80">{dayPartLabel[leave.day_part] || 'Full'} · {leave.leave_type_name}</div>
                      </div>
                    ))}
                    {dayLeaves.length > 3 && (
                      <div className="text-[11px] text-muted-foreground font-semibold">+{dayLeaves.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
