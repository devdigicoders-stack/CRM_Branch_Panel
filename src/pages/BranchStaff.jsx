import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Search, Users, TrendingUp, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_COLORS = {
  sales:        '#3182ce',
  calling:      '#805ad5',
  accountant:   '#d69e2e',
  installation: '#38a169',
  crmuser:      '#dd6b20',
};

export default function BranchStaff() {
  const { themeColors } = useTheme();
  const [branchId, setBranchId]   = useState(null);
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null); // staff detail modal
  const [staffLeads, setStaffLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const loadBranch = useCallback(async () => {
    try {
      const r = await api.get('/branches');
      const b = r.data?.data?.branches?.[0];
      if (!b) { setError('No branch assigned.'); setLoading(false); return; }
      setBranchId(b._id);
      setStaff(b.assignedUsers || []);
    } catch { setError('Failed to load staff.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBranch(); }, [loadBranch]);

  const handleToggle = async (user) => {
    try {
      await api.put(`/users/${user._id}/toggle-status`);
      toast.success(`${user.name} ${user.active ? 'deactivated' : 'activated'}`);
      loadBranch();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update status'); }
  };

  const openDetail = async (user) => {
    setSelected(user);
    setLeadsLoading(true);
    setStaffLeads([]);
    try {
      // Get branch dashboard and filter leads for this user
      const r = await api.get(`/branches/${branchId}/dashboard`);
      const leads = r.data?.data?.leads || [];
      setStaffLeads(leads.filter(l =>
        l.assignedTo?._id === user._id || l.assignedTo === user._id
      ));
    } catch { setStaffLeads([]); }
    finally { setLeadsLoading(false); }
  };

  const filtered = staff.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = (leads) => leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1; return acc;
  }, {});

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

  const activeCount = staff.filter(u => u.active).length;

  return (
    <div className="p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
              <Users size={20} />
            </div>
            Staff Management
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            {staff.length} members · {activeCount} active
          </p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
          <input
            className="pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
            placeholder="Search by name, email or role..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff',  value: staff.length },
          { label: 'Active',       value: activeCount },
          { label: 'Inactive',     value: staff.length - activeCount },
          { label: 'Roles',        value: [...new Set(staff.map(u => u.role))].length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: themeColors.textSecondary }}>{label}</p>
            <p className="text-2xl font-black" style={{ color: themeColors.text }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Staff Table */}
      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                {['Member', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center font-medium text-sm" style={{ color: themeColors.textSecondary }}>No staff found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
                  style={{ borderBottom: i !== filtered.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm" style={{ color: themeColors.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{u.email || '—'}</td>
                  <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{u.phone || '—'}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold capitalize"
                      style={{ backgroundColor: (ROLE_COLORS[u.role] || themeColors.primary) + '15', color: ROLE_COLORS[u.role] || themeColors.primary }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleToggle(u)} className="flex items-center gap-1.5 transition hover:opacity-80">
                      {u.active
                        ? <><ToggleRight size={20} style={{ color: themeColors.success }} /><span className="text-xs font-bold" style={{ color: themeColors.success }}>Active</span></>
                        : <><ToggleLeft size={20} style={{ color: themeColors.danger }} /><span className="text-xs font-bold" style={{ color: themeColors.danger }}>Inactive</span></>}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => openDetail(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80"
                      style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
                      <TrendingUp size={13} /> Performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Performance Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeColors.border }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color: themeColors.text }}>{selected.name}</p>
                  <p className="text-xs capitalize" style={{ color: themeColors.textSecondary }}>{selected.role} · {selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:opacity-70 transition"
                style={{ color: themeColors.textSecondary }}><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {leadsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }} />
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Assigned Leads', value: staffLeads.length },
                      { label: 'Converted',      value: staffLeads.filter(l => l.status === 'converted').length },
                      { label: 'Deal Value',     value: '₹' + staffLeads.reduce((s, l) => s + (l.dealValue || 0), 0).toLocaleString('en-IN') },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-4 border text-center"
                        style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: themeColors.textSecondary }}>{label}</p>
                        <p className="text-xl font-black" style={{ color: themeColors.text }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status breakdown */}
                  {staffLeads.length > 0 && (
                    <div className="rounded-xl p-4 border" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColors.textSecondary }}>Leads by Status</p>
                      <div className="space-y-2">
                        {Object.entries(byStatus(staffLeads)).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm capitalize" style={{ color: themeColors.textSecondary }}>{status.replace('_', ' ')}</span>
                            <span className="text-sm font-bold" style={{ color: themeColors.text }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent leads */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: themeColors.textSecondary }}>
                      Recent Leads ({staffLeads.length})
                    </p>
                    {staffLeads.length === 0 ? (
                      <p className="text-sm italic text-center py-4" style={{ color: themeColors.textSecondary }}>No leads assigned yet</p>
                    ) : (
                      <div className="rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
                        <div className="max-h-52 overflow-y-auto divide-y" style={{ borderColor: themeColors.border }}>
                          {staffLeads.slice(0, 20).map(l => (
                            <div key={l._id} className="flex items-center justify-between px-4 py-3">
                              <div>
                                <p className="text-sm font-semibold" style={{ color: themeColors.text }}>{l.name || '—'}</p>
                                <p className="text-xs" style={{ color: themeColors.textSecondary }}>{l.phone || '—'}</p>
                              </div>
                              <span className="text-xs font-bold px-2 py-1 rounded-lg capitalize"
                                style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
                                {l.status?.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t flex justify-end" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
              <button onClick={() => setSelected(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                style={{ backgroundColor: themeColors.primary, color: '#fff' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
