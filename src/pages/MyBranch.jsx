import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Building2, Users, User, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react';

export default function MyBranch() {
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

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;
  if (error)   return <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">My Branch</h1>
        <p className="text-slate-400 text-sm mt-0.5">Branch details and assigned staff</p>
      </div>

      {/* Branch Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
            <Building2 size={22} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg">{branch.name}</h2>
            {branch.description && <p className="text-slate-400 text-sm">{branch.description}</p>}
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-lg ${branch.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {branch.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Branch Admin</p>
            <p className="text-white text-sm font-bold">{branch.branchAdmin?.name || 'You'}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Admin Email</p>
            <p className="text-white text-sm font-bold truncate">{branch.branchAdmin?.email || '—'}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Total Staff</p>
            <p className="text-white text-sm font-bold">{branch.assignedUsers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <h3 className="text-white font-bold text-sm">Assigned Staff</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {branch.assignedUsers?.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">No staff assigned yet.</div>
          ) : branch.assignedUsers?.map(u => (
            <div key={u._id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 text-sm font-black shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-bold truncate">{u.name}</p>
                <p className="text-slate-500 text-xs capitalize">{u.role}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-slate-400 text-xs">
                <Mail size={12} />
                <span className="truncate max-w-[160px]">{u.email}</span>
              </div>
              {u.phone && (
                <div className="hidden md:flex items-center gap-1 text-slate-400 text-xs">
                  <Phone size={12} />
                  <span>{u.phone}</span>
                </div>
              )}
              <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${u.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {u.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
