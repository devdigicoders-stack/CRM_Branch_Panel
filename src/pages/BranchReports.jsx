import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Users, IndianRupee, Download, X, Filter } from 'lucide-react';

const STATUS_COLORS = {
  new:            '#3182ce',
  assigned:       '#805ad5',
  interested:     '#d69e2e',
  in_process:     '#dd6b20',
  converted:      '#38a169',
  not_interested: '#e53e3e',
  lost:           '#71717a',
  closed:         '#2d3748',
};

function KpiCard({ label, value, icon: Icon, color, onClick, themeColors }) {
  return (
    <div onClick={onClick}
      className={`rounded-xl p-5 border shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
      style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: themeColors.textSecondary }}>{label}</p>
          <p className="text-2xl font-black" style={{ color: color || themeColors.text }}>{value ?? '—'}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: (color || themeColors.primary) + '15', color: color || themeColors.primary }}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function BranchReports() {
  const { themeColors } = useTheme();

  const [branchId, setBranchId]     = useState(null);
  const [branchName, setBranchName] = useState('');
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kpiModal, setKpiModal]     = useState(null);

  useEffect(() => {
    api.get('/branches')
      .then(r => {
        const b = r.data?.data?.branches?.[0];
        if (!b) { setError('No branch assigned.'); setLoading(false); return; }
        setBranchId(b._id);
        setBranchName(b.name);
        return api.get(`/branches/${b._id}/dashboard`);
      })
      .then(r => { if (r) setLeads(r.data?.data?.leads || []); })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => leads.filter(l => {
    const date = new Date(l.createdAt);
    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate + 'T23:59:59')) return false;
    if (statusFilter && l.status !== statusFilter) return false;
    return true;
  }), [leads, startDate, endDate, statusFilter]);

  const stats = useMemo(() => {
    const byStatus = {}, byPriority = {}, byUser = {};
    let totalDeal = 0, totalPaid = 0;
    filtered.forEach(l => {
      byStatus[l.status]     = (byStatus[l.status] || 0) + 1;
      byPriority[l.priority] = (byPriority[l.priority] || 0) + 1;
      totalDeal += l.dealValue || 0;
      totalPaid += l.amountPaid || 0;
      const name = l.assignedTo?.name || 'Unassigned';
      if (!byUser[name]) byUser[name] = { total: 0, converted: 0, dealValue: 0 };
      byUser[name].total++;
      if (l.status === 'converted') byUser[name].converted++;
      byUser[name].dealValue += l.dealValue || 0;
    });
    return {
      total: filtered.length,
      converted: byStatus['converted'] || 0,
      pending: (byStatus['new'] || 0) + (byStatus['assigned'] || 0) + (byStatus['interested'] || 0) + (byStatus['in_process'] || 0),
      totalDeal, totalPaid, byStatus, byPriority, byUser,
    };
  }, [filtered]);

  const handleExport = () => {
    if (filtered.length === 0) { toast.error('No data to export'); return; }
    const rows = [
      ['Name', 'Phone', 'Email', 'Status', 'Priority', 'Assigned To', 'Deal Value', 'Amount Paid', 'Created At'],
      ...filtered.map(l => [
        l.name, l.phone, l.email, l.status, l.priority,
        l.assignedTo?.name || '', l.dealValue || 0, l.amountPaid || 0,
        new Date(l.createdAt).toLocaleDateString('en-IN'),
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${branchName}_report.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
              <BarChart3 size={20} />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>{branchName} — branch performance</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
          style={{ backgroundColor: themeColors.primary, color: '#fff' }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border"
        style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <Filter size={15} style={{ color: themeColors.textSecondary }} />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="p-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
        <span className="text-xs font-bold" style={{ color: themeColors.textSecondary }}>to</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="p-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="p-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        {(startDate || endDate || statusFilter) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter(''); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold"
            style={{ backgroundColor: themeColors.danger + '15', color: themeColors.danger }}>
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs font-bold" style={{ color: themeColors.textSecondary }}>
          {filtered.length} / {leads.length} leads
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Leads"  value={stats.total}     icon={TrendingUp}   color={themeColors.primary} themeColors={themeColors}
          onClick={() => setKpiModal({ label: 'Total Leads', leads: filtered })} />
        <KpiCard label="Converted"    value={stats.converted} icon={CheckCircle2} color={themeColors.success} themeColors={themeColors}
          onClick={() => setKpiModal({ label: 'Converted', leads: filtered.filter(l => l.status === 'converted') })} />
        <KpiCard label="Pending"      value={stats.pending}   icon={Clock}        color={themeColors.warning} themeColors={themeColors}
          onClick={() => setKpiModal({ label: 'Pending', leads: filtered.filter(l => ['new','assigned','interested','in_process'].includes(l.status)) })} />
        <KpiCard label="Deal Value"   value={'₹' + stats.totalDeal.toLocaleString('en-IN')} icon={IndianRupee} color="#38a169" themeColors={themeColors} />
        <KpiCard label="Amount Paid"  value={'₹' + stats.totalPaid.toLocaleString('en-IN')} icon={IndianRupee} color="#3182ce" themeColors={themeColors} />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <p className="font-bold text-sm mb-4" style={{ color: themeColors.text }}>Leads by Status</p>
          {Object.keys(stats.byStatus).length === 0
            ? <p className="text-sm italic text-center py-8" style={{ color: themeColors.textSecondary }}>No data</p>
            : <div className="space-y-3">
                {Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                  const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const color = STATUS_COLORS[status] || themeColors.primary;
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold capitalize" style={{ color: themeColors.text }}>{status.replace('_', ' ')}</span>
                        <span className="text-xs font-bold" style={{ color: themeColors.textSecondary }}>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: themeColors.border }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Priority */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <p className="font-bold text-sm mb-4" style={{ color: themeColors.text }}>Leads by Priority</p>
          {Object.keys(stats.byPriority).length === 0
            ? <p className="text-sm italic text-center py-8" style={{ color: themeColors.textSecondary }}>No data</p>
            : <div className="space-y-3">
                {Object.entries(stats.byPriority).sort((a, b) => b[1] - a[1]).map(([priority, count]) => {
                  const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const color = priority === 'high' ? themeColors.danger : priority === 'medium' ? '#d69e2e' : themeColors.textSecondary;
                  return (
                    <div key={priority}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold capitalize" style={{ color: themeColors.text }}>{priority}</span>
                        <span className="text-xs font-bold" style={{ color: themeColors.textSecondary }}>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: themeColors.border }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Staff Performance */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: themeColors.border }}>
          <Users size={15} style={{ color: themeColors.primary }} />
          <p className="font-bold text-sm" style={{ color: themeColors.text }}>Staff Performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                {['Staff Member', 'Total Leads', 'Converted', 'Conversion %', 'Deal Value'].map(h => (
                  <th key={h} className="py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(stats.byUser).length === 0
                ? <tr><td colSpan={5} className="py-8 text-center text-sm" style={{ color: themeColors.textSecondary }}>No data</td></tr>
                : Object.entries(stats.byUser).sort((a, b) => b[1].total - a[1].total).map(([name, d], i, arr) => (
                    <tr key={name} className="hover:bg-black/5 transition-colors"
                      style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                            {name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: themeColors.text }}>{name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-sm font-bold" style={{ color: themeColors.text }}>{d.total}</td>
                      <td className="py-3 px-5 text-sm font-bold" style={{ color: themeColors.success }}>{d.converted}</td>
                      <td className="py-3 px-5">
                        <span className="text-sm font-bold" style={{ color: themeColors.primary }}>
                          {d.total > 0 ? Math.round((d.converted / d.total) * 100) : 0}%
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm font-bold" style={{ color: '#38a169' }}>
                        ₹{d.dealValue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Detail Modal */}
      {kpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeColors.border }}>
              <p className="font-black text-lg" style={{ color: themeColors.text }}>{kpiModal.label} ({kpiModal.leads.length})</p>
              <button onClick={() => setKpiModal(null)} className="p-2 rounded-lg hover:opacity-70 transition"
                style={{ color: themeColors.textSecondary }}><X size={18} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {kpiModal.leads.length === 0
                ? <p className="text-center text-sm italic py-8" style={{ color: themeColors.textSecondary }}>No records found</p>
                : (
                  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: themeColors.border }}>
                    <table className="w-full text-left text-sm min-w-[600px]">
                      <thead style={{ backgroundColor: themeColors.background }}>
                        <tr style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                          {['Name', 'Phone', 'Status', 'Priority', 'Assigned To', 'Deal Value', 'Date'].map(h => (
                            <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {kpiModal.leads.map((l, i) => (
                          <tr key={l._id} className="hover:bg-black/5 transition-colors"
                            style={{ borderBottom: i !== kpiModal.leads.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                            <td className="px-4 py-3 font-semibold" style={{ color: themeColors.text }}>{l.name || '—'}</td>
                            <td className="px-4 py-3" style={{ color: themeColors.textSecondary }}>{l.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-md text-xs font-bold capitalize"
                                style={{ backgroundColor: (STATUS_COLORS[l.status] || themeColors.primary) + '15', color: STATUS_COLORS[l.status] || themeColors.primary }}>
                                {l.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 capitalize text-xs font-semibold" style={{ color: themeColors.textSecondary }}>{l.priority || '—'}</td>
                            <td className="px-4 py-3" style={{ color: themeColors.textSecondary }}>{l.assignedTo?.name || '—'}</td>
                            <td className="px-4 py-3 font-bold" style={{ color: '#38a169' }}>₹{(l.dealValue || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: themeColors.textSecondary }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
            <div className="p-4 border-t flex justify-end" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
              <button onClick={() => setKpiModal(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                style={{ backgroundColor: themeColors.primary, color: '#fff' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
