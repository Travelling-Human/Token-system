import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useTicketSocket from '../hooks/useTicketSocket';

const deviceStatusStyles = {
  available: 'bg-green/10 text-green border-green/30',
  in_use: 'bg-teal/10 text-teal border-teal/30',
  under_repair: 'bg-amber/10 text-amber border-amber/30',
  retired: 'bg-slate/10 text-slate border-slate/30',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);

  const loadStats = useCallback(() => {
    api.get('/dashboard/stats/').then((res) => setStats(res.data));
  }, []);

  const loadDevices = useCallback(() => {
    api.get('/devices/').then((res) => setDevices(res.data));
  }, []);

  useEffect(() => { loadStats(); loadDevices(); }, [loadStats, loadDevices]);
  useTicketSocket(() => { loadStats(); loadDevices(); });

  if (!stats) return <div className="p-8 text-slate">Loading dashboard...</div>;

  const countFor = (statuses) =>
    stats.status_counts
      .filter((s) => statuses.includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);

  const pending = countFor(['open', 'in_progress']);
  const resolved = countFor(['resolved', 'closed']);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-amber/10 border border-amber/30 rounded-sm p-5">
          <p className="text-3xl font-semibold text-amber">{pending}</p>
          <p className="text-sm text-slate mt-1">Pending complaints</p>
        </div>
        <div className="bg-green/10 border border-green/30 rounded-sm p-5">
          <p className="text-3xl font-semibold text-green">{resolved}</p>
          <p className="text-sm text-slate mt-1">Resolved complaints</p>
        </div>
        <Link
          to="/tickets/new"
          className="bg-ink text-white rounded-sm p-5 flex flex-col justify-center hover:opacity-90"
        >
          <p className="text-lg font-semibold">+ New ticket</p>
          <p className="text-sm text-white/70 mt-1">Report a problem</p>
        </Link>
      </div>

      <h2 className="text-lg font-medium text-ink mb-3">Hospital devices</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {devices.map((d) => (
          <div key={d.id} className={`border rounded-sm p-4 ${deviceStatusStyles[d.status]}`}>
            <p className="font-medium text-ink">{d.name}</p>
            <p className="text-sm text-slate">{d.device_type}, {d.location}</p>
            <p className="text-sm mt-1 capitalize">{d.status.replace('_', ' ')}</p>
          </div>
        ))}
        {devices.length === 0 && <p className="text-slate col-span-full">No devices on file yet.</p>}
      </div>
    </div>
  );
}