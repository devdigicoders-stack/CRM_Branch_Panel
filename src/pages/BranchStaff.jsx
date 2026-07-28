import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Search, Mail, Phone } from 'lucide-react';

export default function BranchStaff() {
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/branches')
      .then(r => {
        const b = r.data?.data?.branches?.[0];
        if (!b) { setError('No branch assigned.'); setLoading(false); return; }
        setStaff(b.assignedUsers || []);
      })
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-slate-400 text-sm">Loading staff...</div>;
  if (error)   return <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Branch Staff</h1>
        <p className="text-slate-400 text-sm mt-0.5">{staff.length} members in your branch</p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40">
                {['Member', 'Email', 'Phone', 'Role', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">No staff found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 text-xs font-black shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="text-white font-bold text-sm">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{u.email || '—'}</td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{u.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 capitalize">{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${u.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
