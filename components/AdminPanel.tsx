
import React, { useState, useEffect } from 'react';
import { Staff, UserRole, Movement } from '../types';
import { db } from '../services/mockDatabase';
import { formatDate } from '../utils';
import { UserPlus, Trash2, Edit2, Shield, X, Save, AlertTriangle, Loader2, List, FileText } from 'lucide-react';

interface AdminPanelProps {
  staffList: Staff[];
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ staffList, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'movements'>('staff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', position: '', username: '', password: '', role: UserRole.STAFF });

  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [deleteMovementTarget, setDeleteMovementTarget] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'movements') fetchAllMovements();
  }, [activeTab]);

  const fetchAllMovements = async () => {
    setLoadingMovements(true);
    const m = await db.getMovements();
    m.sort((a,b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());
    setAllMovements(m);
    setLoadingMovements(false);
  };

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingId(staff.id);
      setFormData({ name: staff.name, position: staff.position, username: staff.username, password: staff.password || '', role: staff.role });
    } else {
      setEditingId(null);
      setFormData({ name: '', position: '', username: '', password: '', role: UserRole.STAFF });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (editingId) {
            const original = staffList.find(s => s.id === editingId);
            if (original) await db.updateStaff({ ...original, ...formData });
        } else {
            await db.addStaff(formData);
        }
        await onUpdate();
        setIsModalOpen(false);
    } catch (e) {
        alert('Ralat menyimpan data.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteMovement = async (id: string) => {
     if(!window.confirm("Padam rekod pergerakan ini?")) return;
     setDeleteMovementTarget(id);
     try {
         await db.deleteMovement(id);
         await fetchAllMovements();
         onUpdate(); 
     } catch (e) {
         alert("Gagal memadam.");
     } finally {
         setDeleteMovementTarget(null);
     }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-2 md:pb-4 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Panel Admin</h2>
            <p className="text-slate-500 text-xs md:text-sm">Urus staf dan rekod pergerakan.</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg w-full md:w-auto">
            <button onClick={() => setActiveTab('staff')} className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'staff' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
                <List size={16}/> Staf
            </button>
            <button onClick={() => setActiveTab('movements')} className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'movements' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
                <FileText size={16}/> Rekod
            </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <>
            <div className="flex justify-end">
                <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                <UserPlus size={18} /> Daftar Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                        <th className="px-4 md:px-6 py-3">Nama</th>
                        <th className="px-4 md:px-6 py-3">Jawatan</th>
                        <th className="px-4 md:px-6 py-3">Username</th>
                        <th className="px-4 md:px-6 py-3">Peranan</th>
                        <th className="px-4 md:px-6 py-3 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {staffList.map(staff => (
                        <tr key={staff.id} className="hover:bg-slate-50">
                            <td className="px-4 md:px-6 py-3 font-medium text-slate-900">{staff.name}</td>
                            <td className="px-4 md:px-6 py-3">{staff.position}</td>
                            <td className="px-4 md:px-6 py-3 font-mono text-xs">{staff.username}</td>
                            <td className="px-4 md:px-6 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                staff.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {staff.role === UserRole.ADMIN && <Shield size={10} />}
                                {staff.role.toUpperCase()}
                            </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 text-right space-x-2">
                            <button onClick={() => handleOpenModal(staff)} className="text-blue-600 p-1 bg-blue-50 rounded"><Edit2 size={16} /></button>
                            <button onClick={() => setDeleteTarget(staff)} className="text-red-500 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
             {loadingMovements ? (
                 <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                     <Loader2 className="animate-spin mb-2" /> Loading...
                 </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 md:px-6 py-3">Nama</th>
                                <th className="px-4 md:px-6 py-3">Tarikh</th>
                                <th className="px-4 md:px-6 py-3">Lokasi & Tujuan</th>
                                <th className="px-4 md:px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allMovements.map(move => (
                                <tr key={move.id} className="hover:bg-slate-50">
                                    <td className="px-4 md:px-6 py-3 font-medium text-slate-900">{move.staffName}</td>
                                    <td className="px-4 md:px-6 py-3">
                                        <div>{formatDate(move.dateOut)}</div>
                                        <div className="text-xs text-slate-400">Hingga {formatDate(move.dateReturn)}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 max-w-[200px] truncate">
                                        <div className="font-medium text-slate-800">{move.location}</div>
                                        <div className="text-xs text-slate-500 truncate">{move.purpose}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 text-center">
                                        <button onClick={() => handleDeleteMovement(move.id)} className="text-red-500 bg-red-50 p-2 rounded-lg" disabled={deleteMovementTarget === move.id}>
                                            {deleteMovementTarget === move.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
          </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingId ? 'Kemaskini' : 'Daftar Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium">Nama</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Jawatan</label><input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="text-sm font-medium">Password</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div>
                <label className="text-sm font-medium">Peranan</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 border rounded-lg">
                  <option value={UserRole.STAFF}>Staf Biasa</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 rounded-lg flex justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold mb-2">Padam Data?</h3>
            <div className="flex gap-3 justify-center mt-6">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button onClick={async () => { setIsSubmitting(true); await db.deleteStaff(deleteTarget.id); await onUpdate(); setDeleteTarget(null); setIsSubmitting(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
