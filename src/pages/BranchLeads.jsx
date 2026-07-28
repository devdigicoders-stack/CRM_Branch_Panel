import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Search, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
  new:            { bg: '#3182ce15', text: '#3182ce' },
  assigned:       { bg: '#805ad515', text: '#805ad5' },
  interested:     { bg: '#d69e2e15', text: '#d69e2e' },
  in_process:     { bg: '#dd6b2015', text: '#dd6b20' },
  converted:      { bg: '#38a16915', text: '#38a169' },
  not_interested: { bg: '#e53e3e15', text: '#e53e3e' },
  lost:           { bg: '#71717a15', text: '#71717a' },
};

export default function BranchLeads() {
  const { themeColors } = useTheme();
  const [leads, setLeads]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="px-6 py-4 rounded-xl border font-medium text-sm"
        style={{ backgroundColor: themeColors.danger + '15', color: themeColors.danger, borderColor: themeColors.danger + '30' }}>
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>Branch Leads</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>{leads.length} total leads in your branch</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
            <input
              className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              placeholder="Search by name or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-3 pr-8 py-2 rounded-lg border text-sm focus:outline-none appearance-none"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: themeColors.textSecondary }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                {['Lead', 'Phone', 'Assigned To', 'Status', 'Priority'].map(h => (
                  <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center font-medium text-sm" style={{ color: themeColors.textSecondary }}>No leads found.</td></tr>
              ) : filtered.map((l, i) => {
                const sc = STATUS_COLORS[l.status] || { bg: '#71717a15', text: '#71717a' };
                return (
                  <tr key={l._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ borderBottom: i !== filtered.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm" style={{ color: themeColors.text }}>{l.name || '—'}</p>
                      {l.email && <p className="text-xs mt-0.5 truncate max-w-[160px]" style={{ color: themeColors.textSecondary }}>{l.email}</p>}
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{l.phone || '—'}</td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{l.assignedTo?.name || '—'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                        style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.text}30` }}>
                        {l.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                        style={{
                          backgroundColor: l.priority === 'high' ? `${themeColors.danger}15` : l.priority === 'medium' ? `${themeColors.warning}15` : `${themeColors.border}80`,
                          color: l.priority === 'high' ? themeColors.danger : l.priority === 'medium' ? themeColors.warning : themeColors.textSecondary,
                        }}>
                        {l.priority || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
