import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusStyles = {
  available: 'bg-green/10 text-green border-green/30',
  in_use: 'bg-teal/10 text-teal border-teal/30',
  under_repair: 'bg-amber/10 text-amber border-amber/30',
  retired: 'bg-slate/10 text-slate border-slate/30',
};

export default function DeviceList() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    api.get('/devices/').then((res) => setDevices(res.data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-ink mb-6">Devices &amp; parts</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {devices.map((d) => (
          <div key={d.id} className={`border rounded-sm p-4 ${statusStyles[d.status]}`}>
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