
import React, { useState } from 'react';
import { Staff } from '../types';
import { db } from '../services/mockDatabase';
import { UserCog, Save, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileProps {
  currentUser: Staff;
  onUpdate: () => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    position: currentUser.position,
    password: currentUser.password || '',
    confirmPassword: currentUser.password || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Kata laluan baru tidak sepadan.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create updated user object
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        position: formData.position,
        password: formData.password
      };

      await db.updateStaff(updatedUser);
      
      // Update local storage session immediately so they don't get logged out on refresh
      localStorage.setItem('sppks_user', JSON.stringify(updatedUser));
      
      await onUpdate();
      setMessage({ type: 'success', text: 'Profil berjaya dikemaskini!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Gagal mengemaskini profil. Sila cuba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <UserCog className="text-slate-600" size={20} />
          <h2 className="font-bold text-slate-800">Tetapan Profil Saya</h2>
        </div>
        
        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Maklumat Asas */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Maklumat Asas</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penuh</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jawatan</label>
                <input 
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username (Tidak boleh diubah)</label>
                <input 
                  type="text"
                  value={currentUser.username}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Keselamatan */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Keselamatan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kata Laluan Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="password" // Changed to password type for security
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Masukkan password baru"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sahkan Kata Laluan</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="password" // Changed to password type for security
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Ulang password baru"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Sila gunakan kata laluan yang mudah diingat tetapi sukar diteka.
              </p>
            </div>

            <div className="pt-4">
               <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                  {isSubmitting ? 'Sedang Kemaskini...' : 'Simpan Perubahan'}
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
