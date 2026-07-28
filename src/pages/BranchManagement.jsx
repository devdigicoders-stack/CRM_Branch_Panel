import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { GitBranch, Plus, Edit2, Trash2, X, Check, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

export default function BranchManagement() {
  const { themeColors } = useTheme();
  const [branches, setBranches]       = useState([]);
  const [admins, setAdmins]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({ name: '', description: '', branchAdmin: '', assignedUsers: [] });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, uRes] = await Promise.all([api.get('/branches'), api.get('/branches/available-users')]);
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
    setSelected(null); setModal('create');
  };
  const openEdit = (b) => {
    setSelected(b);
    setForm({ name: b.name, description: b.description || '', branchAdmin: b.branchAdmin?._id || '', assignedUsers: b.assignedUsers?.map(u => u._id) || [] });
    setModal('edit');
  };
  const openView  = (b) => { setSelected(b); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const toggleUser = (id) => setForm(p => ({
    ...p,
    assignedUsers: p.assignedUsers.includes(id) ? p.assignedUsers.filter(x => x !== id) : [...p.assignedUsers, id],
  }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Branch name is required');
    setSaving(true);
    try {
      if (modal === 'create') { await api.post('/branches', form); toast.success('Branch created!'); }
      else { await api.put(`/branches/${selected._id}`, form); toast.success('Branch updated!'); }
      closeModal(); fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!confirm(`Delete branch "${b.name}"?`)) return;
    try { await api.delete(`/branches/${b._id}`); toast.success('Branch deleted'); fetchAll(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const handleToggle = async (b) => {
    try { await api.put(`/branches/${b._id}`, { active: !b.active }); toast.success(`Branch ${!b.active ? 'activated' : 'deactivated'}`); fetchAll(); }
    catch { toast.error('Failed to update status'); }
  };

  const availableUsers = users.filter(u =>
    !assignedIds.includes(u._id) || (selected?.assignedUsers?.some(x => (x._id || x) === u._id))
  );

  const inp = {
    className: "w-full p-2.5 rounded-lg border focus:outline-none focus:ring-2 shadow-sm text-sm",
    style: { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border },
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
              <GitBranch size={20} />
            </div>
            Branch Management
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>Create and manage all branches</p>
        </div>
        <button onClick={openCreate}
          className="py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
          style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
          <Plus size={16} /> New Branch
        </button>
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr style={{ backgroundColor: `${themeColors.primary}08`, borderBottom: `1px solid ${themeColors.border}` }}>
                  {['Branch', 'Admin', 'Staff', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-6 font-semibold text-sm" style={{ color: themeColors.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center font-medium text-sm" style={{ color: themeColors.textSecondary }}>No branches yet. Click 'New Branch' to add one.</td></tr>
                ) : branches.map((b, i) => (
                  <tr key={b._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 group"
                    style={{ borderBottom: i !== branches.length - 1 ? `1px solid ${themeColors.border}` : 'none' }}>
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm" style={{ color: themeColors.text }}>{b.name}</p>
                      {b.description && <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: themeColors.textSecondary }}>{b.description}</p>}
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{b.branchAdmin?.name || <span className="italic">Unassigned</span>}</td>
                    <td className="py-4 px-6 text-sm" style={{ color: themeColors.textSecondary }}>{b.assignedUsers?.length || 0}</td>
                    <td className="py-4 px-6">
                      <button onClick={() => handleToggle(b)} className="flex items-center gap-1.5">
                        {b.active
                          ? <><ToggleRight size={20} style={{ color: themeColors.success }} /><span className="text-xs font-bold" style={{ color: themeColors.success }}>Active</span></>
                          : <><ToggleLeft size={20} style={{ color: themeColors.danger }} /><span className="text-xs font-bold" style={{ color: themeColors.danger }}>Inactive</span></>}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openView(b)} className="p-2 rounded-md transition-all hover:scale-110" style={{ color: themeColors.info, backgroundColor: `${themeColors.info}10` }} title="View"><Eye size={15} /></button>
                        <button onClick={() => openEdit(b)} className="p-2 rounded-md transition-all hover:scale-110" style={{ color: themeColors.primary, backgroundColor: `${themeColors.primary}10` }} title="Edit"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(b)} className="p-2 rounded-md transition-all hover:scale-110" style={{ color: themeColors.danger, backgroundColor: `${themeColors.danger}10` }} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: themeColors.surface }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
                <GitBranch size={18} style={{ color: themeColors.primary }} />
                {modal === 'create' ? 'Create Branch' : 'Edit Branch'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: themeColors.textSecondary }}><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Branch Name *</label>
                  <input {...inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Delhi Branch" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Branch Admin</label>
                  <select {...inp} value={form.branchAdmin} onChange={e => setForm(p => ({ ...p, branchAdmin: e.target.value }))}>
                    <option value="">— Select Admin —</option>
                    {admins.map(a => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Description</label>
                <textarea {...inp} rows={2} className={inp.className + ' resize-none'} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: themeColors.text }}>Assign Staff ({form.assignedUsers.length} selected)</label>
                  <button onClick={() => setForm(p => ({ ...p, assignedUsers: availableUsers.map(u => u._id) }))}
                    className="text-xs font-semibold hover:underline" style={{ color: themeColors.primary }}>Select All</button>
                </div>
                <div className="rounded-lg border max-h-48 overflow-y-auto divide-y" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
                  {availableUsers.length === 0 ? (
                    <p className="px-4 py-3 text-xs" style={{ color: themeColors.textSecondary }}>No available users</p>
                  ) : availableUsers.map(u => {
                    const checked = form.assignedUsers.includes(u._id);
                    return (
                      <div key={u._id} onClick={() => toggleUser(u._id)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                        style={{ backgroundColor: checked ? `${themeColors.primary}08` : 'transparent' }}>
                        <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                          style={{ backgroundColor: checked ? themeColors.primary : 'transparent', borderColor: checked ? themeColors.primary : themeColors.border }}>
                          {checked && <Check size={10} color="#fff" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: themeColors.text }}>{u.name}</p>
                          <p className="text-xs capitalize" style={{ color: themeColors.textSecondary }}>{u.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
              <button onClick={closeModal} className="py-2.5 px-5 rounded-xl font-bold text-sm transition-all border hover:bg-black/5"
                style={{ borderColor: themeColors.border, color: themeColors.text }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="py-2.5 px-6 rounded-xl font-bold text-sm transition-all disabled:opacity-70 flex items-center gap-2"
                style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
                {saving ? 'Saving...' : modal === 'create' ? 'Create Branch' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundColor: themeColors.surface }}>
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>{selected.name}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: themeColors.textSecondary }}><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Status</p>
                  <p className="text-sm font-bold" style={{ color: selected.active ? themeColors.success : themeColors.danger }}>{selected.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Branch Admin</p>
                  <p className="text-sm font-bold" style={{ color: themeColors.text }}>{selected.branchAdmin?.name || 'Unassigned'}</p>
                </div>
                {selected.description && (
                  <div className="p-3 rounded-lg border col-span-2" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: themeColors.textSecondary }}>Description</p>
                    <p className="text-sm" style={{ color: themeColors.text }}>{selected.description}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: themeColors.textSecondary }}>Staff ({selected.assignedUsers?.length || 0})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.assignedUsers?.length === 0 ? (
                    <p className="text-sm italic" style={{ color: themeColors.textSecondary }}>No staff assigned</p>
                  ) : selected.assignedUsers?.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
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
            <div className="p-5 border-t flex justify-end" style={{ borderColor: themeColors.border, backgroundColor: themeColors.background }}>
              <button onClick={closeModal} className="py-2.5 px-6 rounded-xl font-bold text-sm transition-all border hover:bg-black/5"
                style={{ borderColor: themeColors.border, color: themeColors.text }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
