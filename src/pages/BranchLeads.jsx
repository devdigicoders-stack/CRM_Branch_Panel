import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrendingUp, Search, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
  new:         'bg-blue-500/10 text-blue-400',
  assigned:    'bg-purple-500/10 text-purple-400',
  interested:  'bg-yellow-500/10 text-yellow-400',
  in_process:  'bg-orange-500/10 text-orange-400',
  converted:   'bg-green-500/10 text-green-400',
  not_interested: 'bg-red-500/10 text-red-400',
  lost:        'bg-slate-500/10 text-slate-400',
};

export default function BranchLeads() {
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/branches')
      .then(r => {
        const b = r.data?.data?.branches?.[0];
        if (!b) { setError('No branch assigned.'); setLoading(false); return; }
        return api.get(`/branches/${b._id}/dashboard`);
      })
      .then(r => { if (r) setLeads(r.data?.data?.leads || []); })
      .catch(() => setError('Failed to load leads.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = [...new Set(leads.map(l => l.status))];

  if (loading) return <div className="text-slate-400 text-sm">Loading leads...</div>;
  if (error)   return <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Branch Leads</h1>
        <p className="text-slate-400 text-sm mt-0.5">{leads.length} total leads in your branch</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none pr-8"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40">
                {['Lead', 'Phone', 'Assigned To', 'Status', 'Priority'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">No leads found.</td></tr>
              ) : filtered.map(l => (
                <tr key={l._id} className="hover:bg-slate-800/30 transition">
                  <td className="px-5 py-4">
                    <p className="text-white font-bold text-sm">{l.name || '—'}</p>
                    {l.email && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[160px]">{l.email}</p>}
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-sm">{l.phone || '—'}</td>
                  <td className="px-5 py-4 text-slate-300 text-sm">{l.assignedTo?.name || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${STATUS_COLORS[l.status] || 'bg-slate-500/10 text-slate-400'}`}>
                      {l.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${
                      l.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      l.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{l.priority || '—'}</span>
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
