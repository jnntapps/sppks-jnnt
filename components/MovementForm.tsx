
import React, { useState } from 'react';
import { Staff, MALAYSIA_STATES, Movement } from '../types';
import { db } from '../services/mockDatabase';
import { formatDate, getMovementTimeStatus } from '../utils';
import { Calendar, MapPin, Clock, Save, AlertCircle, Loader2, History } from 'lucide-react';

interface MovementFormProps {
  currentUser: Staff;
  onMovementAdded: () => void;
  myMovements: Movement[];
}

const MovementForm: React.FC<MovementFormProps> = ({ currentUser, onMovementAdded, myMovements }) => {
  const [formData, setFormData] = useState({
    dateOut: '',
    dateReturn: '',
    timeOut: '',
    timeReturn: '',
    location: '',
    state: 'Kuala Lumpur',
    purpose: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (new Date(formData.dateOut) > new Date(formData.dateReturn)) {
      setError('Tarikh Keluar tidak boleh selepas Tarikh Balik.');
      return;
    }
    if (!formData.dateOut || !formData.dateReturn || !formData.location || !formData.purpose) {
      setError('Sila isi semua maklumat wajib.');
      return;
    }

    setIsSubmitting(true);

    try {
        await db.addMovement({
          staffId: currentUser.id,
          staffName: currentUser.name,
          ...formData
        });
    
        setSuccess('Rekod pergerakan berjaya disimpan!');
        setFormData({
          dateOut: '',
          dateReturn: '',
          timeOut: '',
          timeReturn: '',
          location: '',
          state: 'Kuala Lumpur',
          purpose: ''
        });
        
        // Refresh parent data
        await onMovementAdded();
    } catch (err) {
        setError('Gagal menyimpan rekod. Sila cuba lagi.');
    } finally {
        setIsSubmitting(false);
        setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
           <MapPin className="text-primary" /> Rekod Pergerakan Baru
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <Save size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dates */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tarikh Keluar *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="date" 
                name="dateOut"
                value={formData.dateOut}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tarikh Balik *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="date" 
                name="dateReturn"
                value={formData.dateReturn}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Times (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Masa Keluar (Pilihan)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="time" 
                name="timeOut"
                value={formData.timeOut}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Masa Balik (Pilihan)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="time" 
                name="timeReturn"
                value={formData.timeReturn}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Lokasi / Tempat *</label>
            <input 
              type="text" 
              name="location"
              placeholder="Contoh: Pejabat Daerah Hulu Langat"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Negeri *</label>
            <select 
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Tujuan / Urusan *</label>
            <textarea 
              name="purpose"
              rows={3}
              placeholder="Contoh: Menghadiri mesyuarat penyelarasan..."
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            ></textarea>
          </div>

          <div className="md:col-span-2">
             <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2 disabled:opacity-70"
             >
                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                {isSubmitting ? 'Sedang Simpan...' : 'Simpan Rekod'}
             </button>
          </div>
        </form>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <History size={18} className="text-slate-400"/>
          <h3 className="font-semibold text-slate-700">Sejarah Pergerakan Saya</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Tarikh</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3">Tujuan</th>
                <th className="px-6 py-3 text-center">Status Masa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myMovements.map(m => {
                 const timeStatus = getMovementTimeStatus(m.dateOut, m.dateReturn);
                 return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-800">{formatDate(m.dateOut)}</div>
                        <div className="text-xs text-slate-500">Hingga {formatDate(m.dateReturn)}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium">{m.location}</div>
                        <div className="text-xs text-slate-500">{m.state}</div>
                      </td>
                      <td className="px-6 py-3 max-w-xs truncate" title={m.purpose}>{m.purpose}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${timeStatus.color}`}>
                          {timeStatus.label}
                        </span>
                      </td>
                    </tr>
                 );
              })}
              {myMovements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Tiada rekod pergerakan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovementForm;
