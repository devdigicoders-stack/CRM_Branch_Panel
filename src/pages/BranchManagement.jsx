import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/axios';
import {
  GitBranch, Plus, Edit2, Trash2, X, Check, Users, ChevronDown,
  ToggleLeft, ToggleRight, Eye
} from 'lucide-react';

const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500";

export default function BranchManagement() {
  const [branches, setBranches]         = useState([]);
  const [admins, setAdmins]             = useState([]);
  const [users, setUsers]               = useState([]);
  const [assignedIds, setAssignedIds]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(null); // null | 'create' | 'edit' | 'view'
  const [selected, setSelected]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState({ name: '', description: '', branchAdmin: '', assignedUsers: [] });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([
        api.get('/branches'),
        api.get('/branches/available-users'),
      ]);
      setBranches(bRes.data?.data?.branches || []);
      setAdmins(uRes.data?.data?.admins || []);
      setUsers(uRes.data?.data?.users || []);
      setAssignedIds(uRes.data?.data?.assignedUserIds || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', branchAdmin: '', assignedUsers: [] });
    setSelected(null);
    setModal('create');
  };

  const openEdit = (b) => {
    setSelected(b);
    setForm({
      name: b.name,
      description: b.description || '',
      branchAdmin: b.branchAdmin?._id || '',
      assignedUsers: b.assignedUsers?.map(u => u._id) || [],
    });
    setModal('edit');
  };

  const openView = (b) => { setSelected(b); setModal('view'); };

  const closeModal = () => { setModal(null); setSelected(null); };

  const toggleUser = (id) => {
    setForm(p => ({
      ...p,
      assignedUsers: p.assignedUsers.includes(id)
        ? p.assignedUsers.filter(x => x !== id)
        : [...p.assignedUsers, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Branch name is required');
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/branches', form);
        toast.success('Branch created!');
      } else {
        await api.put(`/branches/${selected._id}`, form);
        toast.success('Branch updated!');
      }
      closeModal();
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return;
    try {
      await api.delete(`/branches/${b._id}`);
      toast.success('Branch deleted');
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const handleToggle = async (b) => {
    try {
      await api.put(`/branches/${b._id}`, { active: !b.active });
      toast.success(`Branch ${!b.active ? 'activated' : 'deactivated'}`);
      fetchAll();
    } catch { toast.error('Failed to update status'); }
  };

  // Users available for this branch (not assigned elsewhere OR already in this branch)
  const availableUsers = users.filter(u =>
    !assignedIds.includes(u._id) ||
    (selected?.assignedUsers?.some(x => (x._id || x) === u._id))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Branch Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create and manage all branches</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
          <Plus size={16} /> New Branch
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40">
                  {['Branch', 'Admin', 'Staff', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {branches.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-sm">No branches yet. Create one!</td></tr>
                ) : branches.map(b => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <p className="text-white font-bold text-sm">{b.name}</p>
                      {b.description && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px]">{b.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{b.branchAdmin?.name || <span className="italic text-slate-500">Unassigned</span>}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{b.assignedUsers?.length || 0}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(b)} className="flex items-center gap-1.5 text-xs font-bold">
                        {b.active
                          ? <><ToggleRight size={18} className="text-green-400" /><span className="text-green-400">Active</span></>
                          : <><ToggleLeft size={18} className="text-red-400" /><span className="text-red-400">Inactive</span></>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openView(b)} className="p-1.5 text-sky-400 hover:bg-sky-400/10 rounded-lg transition" title="View"><Eye size={15} /></button>
                        <button onClick={() => openEdit(b)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition" title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(b)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-white font-black text-base flex items-center gap-2">
                <GitBranch size={18} className="text-blue-400" />
                {modal === 'create' ? 'Create Branch' : 'Edit Branch'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Branch Name *</label>
                  <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Delhi Branch" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Branch Admin</label>
                  <select className={inp} value={form.branchAdmin} onChange={e => setForm(p => ({ ...p, branchAdmin: e.target.value }))}>
                    <option value="">— Select Admin —</option>
                    {admins.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea className={inp + ' resize-none'} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assign Staff ({form.assignedUsers.length} selected)</label>
                  <button onClick={() => setForm(p => ({ ...p, assignedUsers: availableUsers.map(u => u._id) }))}
                    className="text-xs text-blue-400 hover:underline">Select All</button>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-700">
                  {availableUsers.length === 0 ? (
                    <p className="px-4 py-3 text-slate-500 text-xs">No available users</p>
                  ) : availableUsers.map(u => {
                    const checked = form.assignedUsers.includes(u._id);
                    return (
                      <div key={u._id} onClick={() => toggleUser(u._id)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${checked ? 'bg-blue-600/10' : 'hover:bg-slate-700/50'}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
                          {checked && <Check size={10} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{u.name}</p>
                          <p className="text-slate-500 text-xs capitalize">{u.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 rounded-xl transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl transition">
                {saving ? 'Saving...' : modal === 'create' ? 'Create Branch' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-white font-black text-base">{selected.name}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <p className={`text-sm font-bold ${selected.active ? 'text-green-400' : 'text-red-400'}`}>{selected.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1">Branch Admin</p>
                  <p className="text-white text-sm font-bold">{selected.branchAdmin?.name || 'Unassigned'}</p>
                </div>
                {selected.description && (
                  <div className="bg-slate-800 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 text-xs mb-1">Description</p>
                    <p className="text-white text-sm">{selected.description}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Staff ({selected.assignedUsers?.length || 0})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.assignedUsers?.length === 0 ? (
                    <p className="text-slate-500 text-xs">No staff assigned</p>
                  ) : selected.assignedUsers?.map(u => (
                    <div key={u._id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2">
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
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
              <button onClick={closeModal} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 rounded-xl transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
