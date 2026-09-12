import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import useTicketSocket from '../hooks/useTicketSocket';

export default function CompletedTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCompleted = useCallback(() => {
    api.get('/tickets/completed/').then((res) => {
      setTickets(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadCompleted(); }, [loadCompleted]);
  useTicketSocket(loadCompleted);

  if (loading) return <div className="p-8 text-slate">Loading completed tickets...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-6">Completed tickets</h1>

      {tickets.length === 0 && <p className="text-slate">No completed tickets yet.</p>}

      <div className="space-y-3">
        {tickets.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="w-full text-left border border-line bg-white rounded-sm p-4 hover:border-teal transition-colors"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-ink">{t.title}</h2>
              <span className="text-sm text-slate">
                {t.closed_at ? new Date(t.closed_at).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-sm text-slate mt-1">Resolved by {t.resolved_by_username || 'unknown'}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white border border-line rounded-sm p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink mb-1">{selected.title}</h2>
            <p className="text-sm text-slate mb-4">{selected.description}</p>
            <div className="text-sm space-y-1 border-t border-line pt-3">
              <p><span className="text-slate">Priority:</span> {selected.priority}</p>
              <p><span className="text-slate">Resolved by:</span> {selected.resolved_by_username || 'Unknown'}</p>
              <p><span className="text-slate">Resolved on:</span> {selected.resolved_at ? new Date(selected.resolved_at).toLocaleString() : '—'}</p>
              <p><span className="text-slate">Closed on:</span> {selected.closed_at ? new Date(selected.closed_at).toLocaleString() : '—'}</p>
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 w-full bg-ink text-white rounded-sm py-2 hover:opacity-90">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}