
import React, { useState, useMemo } from 'react';
import { Staff, Movement, StaffStatus } from '../types';
import { formatDate } from '../utils';
import { Search as SearchIcon, MapPin, Calendar, User, Filter, Info, Download } from 'lucide-react';

interface SearchProps {
  staffList: Staff[];
  movements: Movement[];
}

const Search: React.FC<SearchProps> = ({ staffList, movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
  });

  const getMovementAtDate = (staffId: string, dateStr: string) => {
    const targetTime = new Date(dateStr).getTime();
    return movements.find(m => {
        if (String(m.staffId) !== String(staffId)) return false;
        const start = new Date(m.dateOut); start.setHours(0,0,0,0);
        const end = new Date(m.dateReturn); end.setHours(0,0,0,0);
        const tDate = new Date(dateStr);
        const userTimezoneOffset = tDate.getTimezoneOffset() * 60000;
        const correctedTargetTime = new Date(tDate.getTime() + userTimezoneOffset).getTime();
        return correctedTargetTime >= start.getTime() && correctedTargetTime <= end.getTime();
    });
  };

  const processedData = useMemo(() => {
     return staffList.map(staff => {
         const movementOnDate = getMovementAtDate(staff.id, selectedDate);
         return {
             ...staff,
             displayedStatus: movementOnDate ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE,
             matchedMovement: movementOnDate
         };
     }).filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [staffList, movements, selectedDate, searchTerm]);

  const stats = {
      out: processedData.filter(s => s.displayedStatus === StaffStatus.OUT_OF_OFFICE).length,
      in: processedData.filter(s => s.displayedStatus === StaffStatus.IN_OFFICE).length
  };

  const handleExportCSV = () => {
    const headers = ['Nama Pegawai', 'Jawatan', 'Status', 'Lokasi', 'Tarikh Keluar', 'Tarikh Balik', 'Tujuan'];
    const rows = processedData.map(s => {
        const m = s.matchedMovement;
        return [
            `"${s.name}"`, `"${s.position}"`, `"${s.displayedStatus}"`,
            m ? `"${m.location}, ${m.state}"` : '"-"',
            m ? `"${m.dateOut}"` : '"-"', m ? `"${m.dateReturn}"` : '"-"',
            m ? `"${m.purpose.replace(/"/g, '""')}"` : '"-"'
        ].join(',');
    });
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_${selectedDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-12">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">Semakan Keberadaan</h2>
                <p className="text-slate-500 text-xs md:text-sm">Status pada tarikh tertentu.</p>
            </div>
            <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
                <Download size={18} /> Eksport
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                    type="text"
                    placeholder="Cari nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
            </div>
            <div className="relative w-full md:w-auto">
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full md:w-48 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-medium text-slate-700"
                />
            </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 text-xs md:text-sm">
          <div className="flex items-center gap-2 text-blue-800">
              <Info size={16} />
              <span className="font-semibold">{formatDate(selectedDate)}</span>
          </div>
          <div className="flex gap-3">
              <span className="text-emerald-700">Pejabat: <b>{stats.in}</b></span>
              <span className="text-red-700">Keluar: <b>{stats.out}</b></span>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {processedData.map(staff => {
          const isOut = staff.displayedStatus === StaffStatus.OUT_OF_OFFICE;
          const move = staff.matchedMovement;

          return (
            <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className={`h-1.5 ${isOut ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <div className="p-4 md:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-slate-100 rounded-full text-slate-500 hidden xs:block">
                        <User size={18}/>
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-slate-800">{staff.name}</h3>
                        <p className="text-slate-500 text-xs md:text-sm">{staff.position}</p>
                    </div>
                  </div>
                  <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide ${
                    isOut ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {staff.displayedStatus}
                  </span>
                </div>

                {isOut && move ? (
                  <div className="xs:ml-12 bg-slate-50 rounded-lg p-3 md:p-4 text-xs md:text-sm space-y-2 border border-slate-100 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <div>{move.location}, {move.state}</div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Calendar size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>{formatDate(move.dateOut)} - {formatDate(move.dateReturn)}</div>
                        </div>
                    </div>
                     <div className="pt-1 border-t border-slate-200 mt-1 italic text-slate-600">
                         "{move.purpose}"
                    </div>
                  </div>
                ) : (
                  <div className="xs:ml-12 text-xs text-slate-400 italic mt-2">
                     {isOut ? 'Tiada butiran.' : 'Berada di pejabat.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {processedData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Filter className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500">Tiada data dijumpai.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
