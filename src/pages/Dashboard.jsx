import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { GitBranch, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={17} className="text-white" />
      </div>
    </div>
    <p className="text-white text-2xl font-black">{value ?? '—'}</p>
  </div>
);

// ── SuperAdmin Dashboard ──────────────────────────────────────────────────────
function SuperAdminDashboard() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data?.data?.branches || [])).finally(() => setLoading(false));
  }, []);

  const totalUsers = branches.reduce((s, b) => s + (b.assignedUsers?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">SuperAdmin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Overview of all branches</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Branches" value={branches.length} icon={GitBranch} color="bg-blue-600" />
        <StatCard label="Active Branches" value={branches.filter(b => b.active).length} icon={CheckCircle2} color="bg-green-600" />
        <StatCard label="Total Staff" value={totalUsers} icon={Users} color="bg-purple-600" />
        <StatCard label="With Admin" value={branches.filter(b => b.branchAdmin).length} icon={TrendingUp} color="bg-orange-600" />
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading branches...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-sm">All Branches</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {branches.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">No branches created yet.</div>
            ) : branches.map(b => (
              <div key={b._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{b.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">
                    Admin: {b.branchAdmin?.name || <span className="italic">Unassigned</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">{b.assignedUsers?.length || 0} staff</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${b.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {b.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── BranchAdmin Dashboard ─────────────────────────────────────────────────────
function BranchAdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    // Get branch admin's branch first
    api.get('/branches').then(r => {
      const branch = r.data?.data?.branches?.[0];
      if (!branch) { setError('No branch assigned to you yet.'); setLoading(false); return; }
      return api.get(`/branches/${branch._id}/dashboard`);
    }).then(r => {
      if (r) setData(r.data?.data);
    }).catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 text-sm">Loading dashboard...</div>;
  if (error)   return <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">{error}</div>;

  const { stats, branch } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">{branch.name}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{branch.description || 'Branch Dashboard'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads"    value={stats.totalLeads}    icon={TrendingUp}   color="bg-blue-600" />
        <StatCard label="Converted"      value={stats.converted}     icon={CheckCircle2} color="bg-green-600" />
        <StatCard label="Pending"        value={stats.pending}       icon={Clock}        color="bg-orange-600" />
        <StatCard label="Total Staff"    value={stats.totalUsers}    icon={Users}        color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4">Leads by Status</h3>
          <div className="space-y-2">
            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-slate-400 text-xs capitalize">{status.replace('_', ' ')}</span>
                <span className="text-white text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4">Branch Staff ({branch.assignedUsers?.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {branch.assignedUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{u.name}</p>
                  <p className="text-slate-500 text-xs capitalize">{u.role}</p>
                </div>
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${u.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
  return user?.role === 'superAdmin' ? <SuperAdminDashboard /> : <BranchAdminDashboard />;
}
