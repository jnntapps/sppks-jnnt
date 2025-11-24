
import React, { useState } from 'react';
import { Staff, StaffStatus } from '../types';
import { Users, Briefcase, Building2, Printer, PieChart, Smartphone, X, Share } from 'lucide-react';

interface DashboardProps {
  staffList: Staff[];
}

const Dashboard: React.FC<DashboardProps> = ({ staffList }) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  const totalStaff = staffList.length;
  const inOffice = staffList.filter(s => s.currentStatus === StaffStatus.IN_OFFICE).length;
  const outOffice = staffList.filter(s => s.currentStatus === StaffStatus.OUT_OF_OFFICE).length;

  const inOfficePercent = totalStaff > 0 ? (inOffice / totalStaff) * 100 : 0;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in print:p-0 pb-16 md:pb-0">
      <div className="flex flex-row justify-between items-center pb-2 md:pb-4 gap-2 print:hidden">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Utama</h2>
           <p className="text-xs md:text-sm text-slate-500 md:hidden">Ringkasan status harian.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowInstallGuide(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm font-medium transition-colors border border-blue-200 whitespace-nowrap"
            >
                <Smartphone size={16} /> <span className="hidden xs:inline">Install App</span>
            </button>
            <button 
                onClick={handlePrint}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
                <Printer size={18} /> Cetak
            </button>
        </div>
      </div>
      
      {/* Header for Print Only */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold uppercase">Laporan Keberadaan Pegawai</h1>
        <p className="text-slate-500">Jemaah Nazir Negeri Terengganu</p>
        <p className="text-xs text-slate-400 mt-1">Dicetak pada: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Left Col: Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Card 1: Total */}
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 flex items-center justify-between">
            <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Staf</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{totalStaff}</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-50 rounded-full text-blue-600">
                <Users size={20} className="md:w-6 md:h-6" />
            </div>
            </div>

            {/* Card 2: In Office */}
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Dalam Pejabat</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-1">{inOffice}</p>
            </div>
            <div className="p-2 md:p-3 bg-emerald-50 rounded-full text-emerald-600">
                <Building2 size={20} className="md:w-6 md:h-6" />
            </div>
            </div>

            {/* Card 3: Out of Office */}
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500 flex items-center justify-between">
            <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Keluar</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{outOffice}</p>
            </div>
            <div className="p-2 md:p-3 bg-red-50 rounded-full text-red-600">
                <Briefcase size={20} className="md:w-6 md:h-6" />
            </div>
            </div>
        </div>

        {/* Right Col: Visual Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border border-slate-100 print:border-slate-300">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                <PieChart size={16}/> Peratusan Kehadiran
            </h3>
            <div className="relative w-28 h-28 md:w-32 md:h-32">
                <div 
                    className="w-full h-full rounded-full"
                    style={{
                        background: `conic-gradient(#10b981 ${inOfficePercent}%, #ef4444 0)`
                    }}
                ></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col">
                    <span className="text-lg md:text-xl font-bold text-slate-800">{Math.round(inOfficePercent)}%</span>
                    <span className="text-[10px] text-slate-400 uppercase">Pejabat</span>
                </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600">Pejabat</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-slate-600">Keluar</span>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Status Overview List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6 border border-slate-200">
        <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700 text-sm md:text-base">Status Semasa Pegawai</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap md:whitespace-normal">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 md:px-6 py-3">Nama Pegawai</th>
                <th className="px-4 md:px-6 py-3">Jawatan</th>
                <th className="px-4 md:px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 font-medium text-slate-800">{staff.name}</td>
                  <td className="px-4 md:px-6 py-3 text-xs md:text-sm">{staff.position}</td>
                  <td className="px-4 md:px-6 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${
                      staff.currentStatus === StaffStatus.IN_OFFICE 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {staff.currentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Tiada data staf dijumpai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><Smartphone size={20}/> Pasang di Telefon</h3>
                    <button onClick={() => setShowInstallGuide(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                             <span className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-slate-300">1</span>
                             Pengguna iPhone (iOS)
                        </h4>
                        <p className="text-sm text-slate-600 ml-8 mb-2">
                            Tekan butang <b className="text-blue-600">Share</b> <Share size={12} className="inline"/> di bar bawah Safari, kemudian pilih <b className="text-slate-800">Add to Home Screen</b>.
                        </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                             <span className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-slate-300">2</span>
                             Pengguna Android
                        </h4>
                        <p className="text-sm text-slate-600 ml-8">
                            Tekan butang <b className="text-blue-600">Menu (3 titik)</b> di Chrome, kemudian pilih <b className="text-slate-800">Add to Home Screen</b> atau <b className="text-slate-800">Install App</b>.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800">
                        Aplikasi ini akan muncul di skrin utama telefon anda seperti aplikasi biasa.
                    </div>
                    <button 
                        onClick={() => setShowInstallGuide(false)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                    >
                        Faham, Terima Kasih
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
