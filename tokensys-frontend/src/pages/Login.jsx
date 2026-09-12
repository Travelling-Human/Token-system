import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Captcha from '../components/Captcha';

const infoTiles = [
  { label: 'New updates', accent: 'bg-teal', description: 'Announcements from the IT department, posted here as they happen.' },
  { label: 'Dashboard', accent: 'bg-amber', description: 'A snapshot of pending and resolved requests, plus equipment on file.' },
  { label: 'Tickets', accent: 'bg-red', description: 'Report a problem with any hospital device or system, and track it.' },
  { label: 'Issue category', accent: 'bg-green', description: 'Requests are sorted by type, like hardware, software, or network.' },
];

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaOk, setCaptchaOk] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCaptchaChange = useCallback((ok) => setCaptchaOk(ok), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaOk) {
      setError('The verification code does not match.');
      return;
    }
    try {
      await login(id, password);
      navigate('/dashboard');
    } catch {
      setError('Incorrect ID or password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-ink text-paper md:w-3/5 p-10 flex flex-col justify-center">
        <p className="text-sm text-slate mb-1">Hospital IT Helpdesk</p>
        <h1 className="text-2xl font-semibold mb-8 max-w-sm">Support and equipment tracking for hospital staff</h1>
        <div className="space-y-3 max-w-md">
          {infoTiles.map((tile) => (
            <div key={tile.label} className="flex bg-white/5 rounded-sm overflow-hidden">
              <div className={`w-1.5 ${tile.accent}`} />
              <div className="px-4 py-3">
                <p className="font-medium">{tile.label}</p>
                <p className="text-sm text-slate">{tile.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:w-2/5 flex items-center justify-center p-10 bg-paper">
        <form onSubmit={handleSubmit} className="w-full max-w-sm border border-line bg-white p-8">
          <h2 className="text-lg font-semibold mb-1">Staff sign-in</h2>
          <p className="text-sm text-slate mb-6">Use your hospital staff ID.</p>

          {error && <p className="text-red text-sm mb-4">{error}</p>}

          <label className="block text-sm font-medium mb-1">Staff ID</label>
          <input
            className="w-full border border-line rounded-sm px-3 py-2 mb-4"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-line rounded-sm px-3 py-2 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="block text-sm font-medium mb-1">Verification code</label>
          <Captcha onChange={handleCaptchaChange} />

          <button className="w-full bg-teal text-white rounded-sm py-2 mt-5 hover:opacity-90">
            Sign in
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="block text-sm text-slate mt-4 underline"
          >
            Forgot password
          </button>
          {showForgot && (
            <p className="text-sm text-slate mt-2">Contact the IT helpdesk to reset your password.</p>
          )}
        </form>
      </div>
    </div>
  );
}