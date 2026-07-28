import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';

const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50";

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', form);
      const updated = res.data?.data?.user || res.data?.data?.admin;
      if (updated) {
        login({ ...user, ...updated });
        toast.success('Profile updated!');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPwd(false); }
  };

  const initials = (name = '') => {
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account details</p>
      </div>

      {/* Avatar + Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0">
          {initials(user?.name)}
        </div>
        <div>
          <p className="text-white font-black text-base">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 capitalize mt-1 inline-block">{user?.role}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><User size={15} className="text-blue-400" /> Personal Details</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Phone</label>
              <input className={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email (read-only)</label>
              <input className={inp} value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Lock size={15} className="text-blue-400" /> Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={inp + ' pr-10'}
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={savingPwd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
              <Lock size={15} /> {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
