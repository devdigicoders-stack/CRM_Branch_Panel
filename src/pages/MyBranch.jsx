import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Building2, Users, Mail, Phone } from 'lucide-react';

export default function MyBranch() {
  const { themeColors } = useTheme();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/branches')
      .then(r => {
        const b = r.data?.data?.branches?.[0];
        if (!b) { setError('No branch assigned to you yet.'); return; }
        setBranch(b);
      })
      .catch(() => setError('Failed to load branch details.'))
      .finally(() => setLoading(false));
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>My Branch</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>Branch details and assigned staff</p>
      </div>

      {/* Branch Info Card */}
      <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
            <Building2 size={26} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>{branch.name}</h2>
            {branch.description && <p className="text-sm mt-0.5" style={{ color: themeColors.textSecondary }}>{branch.description}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${branch.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {branch.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: themeColors.border }}>
          <div className="p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
            <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Branch Manager</p>
            <p className="text-sm font-bold" style={{ color: themeColors.text }}>{branch.branchManager?.name || 'You'}</p>
          </div>
          <div className="p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
            <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Manager Email</p>
            <p className="text-sm font-bold truncate" style={{ color: themeColors.text }}>{branch.branchManager?.email || '—'}</p>
          </div>
          <div className="p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
            <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Total Staff</p>
            <p className="text-sm font-bold" style={{ color: themeColors.text }}>{branch.assignedUsers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: themeColors.border }}>
          <Users size={16} style={{ color: themeColors.primary }} />
          <h3 className="font-bold text-sm" style={{ color: themeColors.text }}>Assigned Staff</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                {['Member', 'Email', 'Phone', 'Role', 'Status'].map(h => (
                  <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branch.assignedUsers?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-sm" style={{ color: themeColors.textSecondary }}>No staff assigned yet.</td></tr>
              ) : branch.assignedUsers?.map((u, i) => (
                <tr key={u._id} className="hover:bg-black/5 transition-colors"
                  style={{ borderBottom: i !== branch.assignedUsers.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                        {u.name?.[0]?.toUpperCase()}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
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
