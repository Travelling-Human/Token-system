import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusLabels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved', closed: 'Closed' };

export default function TicketDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'manager';

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [staff, setStaff] = useState([]);

  const loadTicket = () => api.get(`/tickets/${id}/`).then((res) => setTicket(res.data));
  const loadComments = () => api.get(`/tickets/${id}/comments/`).then((res) => setComments(res.data));

  useEffect(() => { loadTicket(); loadComments(); }, [id]);
  useEffect(() => {
    if (canManage) api.get('/accounts/staff/').then((res) => setStaff(res.data));
  }, [canManage]);

  const updateStatus = async (status) => {
    await api.patch(`/tickets/${id}/update_status/`, { status });
    loadTicket();
  };

  const assignTo = async (userId) => {
    await api.patch(`/tickets/${id}/assign/`, { assigned_to: userId || null });
    loadTicket();
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await api.post(`/tickets/${id}/comments/`, { message });
    setMessage('');
    loadComments();
  };

  if (!ticket) return <div className="p-8 text-slate">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink">{ticket.title}</h1>
      <p className="text-slate mt-2">{ticket.description}</p>
      <p className="text-sm text-slate mt-2">Priority: {ticket.priority}</p>

      <div className="mt-4">
        <label className="text-sm font-medium text-ink mr-2">Status:</label>
        {canManage ? (
          <select className="border border-line rounded-sm px-2 py-1" value={ticket.status} onChange={(e) => updateStatus(e.target.value)}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-ink">{statusLabels[ticket.status]}</span>
        )}
      </div>

      {canManage && (
        <div className="mt-3">
          <label className="text-sm font-medium text-ink mr-2">Assigned to:</label>
          <select className="border border-line rounded-sm px-2 py-1" value={ticket.assigned_to || ''} onChange={(e) => assignTo(e.target.value)}>
            <option value="">Unassigned</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.username}</option>)}
          </select>
        </div>
      )}

      {!canManage && (
        <p className="text-sm text-slate mt-3">Only IT admins or managers can change the status or assignment of this ticket.</p>
      )}

      {ticket.resolved_by_username && (
        <p className="text-sm text-slate mt-3">
          Resolved by {ticket.resolved_by_username} on {new Date(ticket.resolved_at).toLocaleString()}
        </p>
      )}

      <h2 className="text-lg font-medium text-ink mt-8 mb-2">Comments</h2>
      <div className="space-y-2 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="border border-line rounded-sm p-3 text-sm">
            <span className="font-medium text-ink">{c.author_username}</span>: {c.message}
          </div>
        ))}
      </div>
      <form onSubmit={addComment} className="flex gap-2">
        <input className="flex-1 border border-line rounded-sm px-3 py-2" placeholder="Add a comment..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="bg-teal text-white px-4 rounded-sm hover:opacity-90">Post</button>
      </form>
    </div>
  );
}