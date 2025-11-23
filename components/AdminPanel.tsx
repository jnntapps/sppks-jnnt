import React, { useState } from 'react';
import { Staff, UserRole } from '../types';
import { db } from '../services/mockDatabase';
import { UserPlus, Trash2, Edit2, Shield, X, Save, AlertTriangle, Loader2 } from 'lucide-react';

interface AdminPanelProps {
  staffList: Staff[];
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ staffList, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    username: '',
    password: '',
    role: UserRole.STAFF
  });

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingId(staff.id);
      setFormData({
        name: staff.name,
        position: staff.position,
        username: staff.username,
        password: staff.password || '',
        role: staff.role
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        position: '',
        username: '',
        password: '',
        role: UserRole.STAFF
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setDeleteTarget(staff);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      setIsSubmitting(true);
      try {
        await db.deleteStaff(deleteTarget.id);
        await onUpdate();
        setDeleteTarget(null);
      } catch (e) {
        alert('Gagal memadam. Sila cuba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (editingId) {
            // Update logic needs full object, retrieving original to keep status intact
            const original = staffList.find(s => s.id === editingId);
            if (original) {
                await db.updateStaff({
                ...original,
                ...formData
                });
            }
        } else {
            await db.addStaff(formData);
        }
        await onUpdate();
        setIsModalOpen(false);
    } catch (e) {
        alert('Ralat menyimpan data. Pastikan sambungan internet stabil.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-4 border-b">
        <h2 className="text-2xl font-bold text-slate-800">Pengurusan Staf</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
        >
          <UserPlus size={18} /> Daftar Staf Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3">Jawatan</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Peranan</th>
              <th className="px-6 py-3 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map(staff => (
              <tr key={staff.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">{staff.name}</td>
                <td className="px-6 py-3">{staff.position}</td>
                <td className="px-6 py-3 font-mono text-xs">{staff.username}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    staff.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {staff.role === UserRole.ADMIN && <Shield size={10} />}
                    {staff.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenModal(staff)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                    title="Kemaskini"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(staff)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    title="Padam"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">Tiada data staf.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? 'Kemaskini Staf' : 'Daftar Staf Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penuh</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jawatan</label>
                <input 
                  type="text" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password/PIN</label>
                    <input 
                    type="text" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peranan</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={UserRole.STAFF}>Staf Biasa</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-2 rounded-lg flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                  {isSubmitting ? 'Sedang Simpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Padam Staf?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Adakah anda pasti mahu memadam rekod <b>{deleteTarget.name}</b>? <br/>Tindakan ini tidak boleh dipulihkan.
            </p>
            <div className="flex gap-3 justify-center">
                <button 
                    onClick={() => setDeleteTarget(null)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm disabled:opacity-70"
                >
                    Batal
                </button>
                <button 
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : 'Ya, Padam'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;