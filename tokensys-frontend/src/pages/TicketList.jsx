import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useTicketSocket from '../hooks/useTicketSocket';

const statusStyles = {
  open: 'bg-amber/10 text-amber border-amber/30',
  in_progress: 'bg-teal/10 text-teal border-teal/30',
  resolved: 'bg-green/10 text-green border-green/30',
  closed: 'bg-slate/10 text-slate border-slate/30',
};

const statusLabels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(() => {
    api.get('/tickets/').then((res) => {
      setTickets(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useTicketSocket(loadTickets);

  const filtered = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets;

  if (loading) return <div className="p-8 text-slate">Loading tickets...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-ink">Tickets</h1>
        <Link to="/tickets/new" className="bg-teal text-white px-4 py-2 rounded-sm hover:opacity-90">
          + New ticket
        </Link>
      </div>

      <select
        className="border border-line rounded-sm px-3 py-2 mb-4 bg-white"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-slate">No tickets found.</p>}
        {filtered.map((t) => (
          <Link
            to={`/tickets/${t.id}`}
            key={t.id}
            className="block border border-line bg-white rounded-sm p-4 hover:border-teal transition-colors"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-ink">{t.title}</h2>
              <span className={`text-sm px-2 py-1 rounded-sm border ${statusStyles[t.status]}`}>
                {statusLabels[t.status]}
              </span>
            </div>
            <p className="text-sm text-slate mt-1">Priority: {t.priority}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}