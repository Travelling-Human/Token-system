import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateTicket() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tickets/', form);
      navigate('/tickets');
    } catch {
      setError('Could not create ticket. Check all fields are filled in.');
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-4">New ticket</h1>
      {error && <p className="text-red text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-line rounded-sm p-6">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Title</label>
          <input
            className="w-full border border-line rounded-sm px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea
            className="w-full border border-line rounded-sm px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Priority</label>
          <select
            className="w-full border border-line rounded-sm px-3 py-2"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Category</label>
          <select
            className="w-full border border-line rounded-sm px-3 py-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button className="w-full bg-teal text-white rounded-sm py-2 hover:opacity-90">
          Submit ticket
        </button>
      </form>
    </div>
  );
}