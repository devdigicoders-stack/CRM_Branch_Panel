import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const { themeColors } = useTheme();
  const [form, setForm]           = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const inp = {
    className: "w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm",
    style: { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border },
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', form);
      const updated = res.data?.data?.user || res.data?.data?.admin;
      if (updated) { login({ ...user, ...updated }); toast.success('Profile updated!'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="p-6 animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>Manage your account details</p>
      </div>

      {/* Avatar Card */}
      <div className="rounded-xl p-6 shadow-sm border flex items-center gap-4" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shrink-0"
          style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: themeColors.text }}>{user?.name}</p>
          <p className="text-sm" style={{ color: themeColors.textSecondary }}>{user?.email}</p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md mt-1 inline-block capitalize"
            style={{ backgroundColor: `${themeColors.primary}15`, color: themeColors.primary }}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <h2 className="text-md font-bold mb-4 flex items-center gap-2" style={{ color: themeColors.text }}>
          <User size={16} style={{ color: themeColors.primary }} /> Personal Details
        </h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Full Name</label>
              <input {...inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Phone</label>
              <input {...inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>Email (read-only)</label>
              <input {...inp} value={user?.email || ''} disabled className={inp.className + ' opacity-60 cursor-not-allowed'} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-70 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <h2 className="text-md font-bold mb-4 flex items-center gap-2" style={{ color: themeColors.text }}>
          <Lock size={16} style={{ color: themeColors.primary }} /> Change Password
        </h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-1" style={{ color: themeColors.text }}>{label}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={inp.className + ' pr-10'}
                  style={inp.style}
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••" minLength={6} required
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ color: themeColors.textSecondary }}>
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={savingPwd}
              className="py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-70 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
              {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
