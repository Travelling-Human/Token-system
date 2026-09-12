import { useState, useEffect, useCallback } from 'react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(length = 5) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export default function Captcha({ onChange }) {
  const [code, setCode] = useState(generateCode());
  const [input, setInput] = useState('');

  const refresh = useCallback(() => {
    setCode(generateCode());
    setInput('');
  }, []);

  useEffect(() => {
    onChange(input.trim().toUpperCase() === code);
  }, [input, code, onChange]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <svg width="140" height="44" viewBox="0 0 140 44" className="border border-line rounded-sm bg-paper">
          <line x1="10" y1="8" x2="130" y2="36" stroke="#D7DCD4" strokeWidth="1" />
          <line x1="10" y1="34" x2="130" y2="10" stroke="#D7DCD4" strokeWidth="1" />
          {code.split('').map((ch, i) => (
            <text
              key={i}
              x={20 + i * 22}
              y={28}
              fontFamily="IBM Plex Mono, monospace"
              fontSize="20"
              fontWeight="600"
              fill="#10222E"
              transform={`rotate(${(i % 2 === 0 ? -1 : 1) * (6 + i)} ${20 + i * 22} 28)`}
            >
              {ch}
            </text>
          ))}
        </svg>
        <button
          type="button"
          onClick={refresh}
          className="text-sm text-teal border border-teal rounded-sm px-2 py-1 hover:bg-teal hover:text-white transition-colors"
        >
          New code
        </button>
      </div>
      <input
        className="w-full border border-line rounded-sm px-3 py-2 font-mono tracking-widest"
        placeholder="Type the code above"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={5}
      />
    </div>
  );
}