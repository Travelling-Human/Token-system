import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <nav className="border-b border-line px-8 py-4 flex justify-between items-center bg-white">
      <div className="flex gap-6 items-center">
        <Link to="/dashboard" className="font-medium text-ink">Dashboard</Link>
        <Link to="/tickets" className="font-medium text-ink">Tickets</Link>
        <Link to="/completed" className="text-sm text-slate hover:text-ink">Completed</Link>
        <Link to="/devices" className="text-sm text-slate hover:text-ink">Devices</Link>
        <Link to="/contact" className="text-sm text-slate hover:text-ink">Contact</Link>
      </div>
      <button onClick={logout} className="text-sm text-slate hover:text-ink">Log out</button>
    </nav>
  );
}