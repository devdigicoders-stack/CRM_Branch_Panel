import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { GitBranch, Users, TrendingUp, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, themeColors, isPositive = true }) => (
  <div
    className="rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: themeColors.textSecondary }}>{label}</p>
        <h3 className="text-2xl font-bold" style={{ color: themeColors.text }}>{value ?? '—'}</h3>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: isPositive ? `${themeColors.primary}15` : `${themeColors.danger}15`,
          color: isPositive ? themeColors.primary : themeColors.danger,
        }}
      >
        <Icon size={20} />
      </div>
    </div>
  </div>
);

function SuperAdminDashboard({ themeColors }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data?.data?.branches || [])).finally(() => setLoading(false));
  }, []);

  const totalUsers = branches.reduce((s, b) => s + (b.assignedUsers?.length || 0), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>SuperAdmin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>Overview of all branches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Branches"   value={branches.length}                              icon={GitBranch}   themeColors={themeColors} />
        <StatCard label="Active Branches"  value={branches.filter(b => b.active).length}        icon={CheckCircle2} themeColors={themeColors} />
        <StatCard label="Total Staff"      value={totalUsers}                                   icon={Users}       themeColors={themeColors} />
        <StatCard label="With Admin"       value={branches.filter(b => b.branchAdmin).length}   icon={TrendingUp}  themeColors={themeColors} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }} />
        </div>
      ) : (
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: themeColors.border }}>
            <h2 className="font-bold text-sm" style={{ color: themeColors.text }}>All Branches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                  {['Branch', 'Admin', 'Staff', 'Status'].map(h => (
                    <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: themeColors.textSecondary }}>No branches created yet.</td></tr>
                ) : branches.map((b, i) => (
                  <tr key={b._id} className="hover:bg-black/5 transition-colors"
                    style={{ borderBottom: i !== branches.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm" style={{ color: themeColors.text }}>{b.name}</p>
                      {b.description && <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: themeColors.textSecondary }}>{b.description}</p>}
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{b.branchAdmin?.name || <span className="italic">Unassigned</span>}</td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{b.assignedUsers?.length || 0}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {b.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchAdminDashboard({ themeColors }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/branches')
      .then(r => {
        const branch = r.data?.data?.branches?.[0];
        if (!branch) { setError('No branch assigned to you yet.'); setLoading(false); return; }
        return api.get(`/branches/${branch._id}/dashboard`);
      })
      .then(r => { if (r) setData(r.data?.data); })
      .catch(() => setError('Failed to load dashboard data.'))
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

  const { stats, branch } = data;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>{branch.name}</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>{branch.description || 'Branch Dashboard'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Leads"  value={stats.totalLeads}  icon={TrendingUp}  themeColors={themeColors} />
        <StatCard label="Converted"    value={stats.converted}   icon={CheckCircle2} themeColors={themeColors} />
        <StatCard label="Pending"      value={stats.pending}     icon={Clock}       themeColors={themeColors} isPositive={false} />
        <StatCard label="Total Staff"  value={stats.totalUsers}  icon={Users}       themeColors={themeColors} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text }}>Leads by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize" style={{ color: themeColors.textSecondary }}>{status.replace('_', ' ')}</span>
                <span className="text-sm font-bold" style={{ color: themeColors.text }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff List */}
        <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: themeColors.border }}>
            <h3 className="font-bold text-sm" style={{ color: themeColors.text }}>Branch Staff ({branch.assignedUsers?.length})</h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: themeColors.border }}>
            {branch.assignedUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: themeColors.text }}>{u.name}</p>
                  <p className="text-xs capitalize" style={{ color: themeColors.textSecondary }}>{u.role}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {u.active ? 'Active' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { themeColors } = useTheme();
  return user?.role === 'superAdmin'
    ? <SuperAdminDashboard themeColors={themeColors} />
    : <BranchAdminDashboard themeColors={themeColors} />;
}
