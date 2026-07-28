import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Search, Users } from 'lucide-react';

export default function BranchStaff() {
  const { themeColors } = useTheme();
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
              <Users size={20} />
            </div>
            Branch Staff
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>{staff.length} members in your branch</p>
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

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                {['Member', 'Email', 'Phone', 'Role', 'Status'].map(h => (
                  <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center font-medium text-sm" style={{ color: themeColors.textSecondary }}>No staff found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 group"
                  style={{ borderBottom: i !== filtered.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm" style={{ color: themeColors.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{u.email || '—'}</td>
                  <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{u.phone || '—'}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                      style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary, border: `1px solid ${themeColors.primary}30` }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${u.active ? 'bg-green-600 text-white shadow-sm' : 'bg-red-600 text-white shadow-sm'}`}>
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
