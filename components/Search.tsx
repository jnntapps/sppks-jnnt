
import React, { useState, useMemo } from 'react';
import { Staff, Movement, StaffStatus } from '../types';
import { formatDate } from '../utils';
import { Search as SearchIcon, MapPin, Calendar, User, Filter, Info } from 'lucide-react';

interface SearchProps {
  staffList: Staff[];
  movements: Movement[];
}

const Search: React.FC<SearchProps> = ({ staffList, movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Default to today (Local Time)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    return localISOTime;
  });

  const getMovementAtDate = (staffId: string, dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0,0,0,0);

    return movements.find(m => {
        if (String(m.staffId) !== String(staffId)) return false;
        
        const start = new Date(m.dateOut);
        start.setHours(0,0,0,0);
        
        const end = new Date(m.dateReturn);
        end.setHours(0,0,0,0);
        
        return targetDate >= start && targetDate <= end;
    });
  };

  // Process list based on filters
  const processedData = useMemo(() => {
     return staffList.map(staff => {
         const movementOnDate = getMovementAtDate(staff.id, selectedDate);
         return {
             ...staff,
             // Override currentStatus with status ON THE SELECTED DATE
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header & Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Semakan Keberadaan & Sejarah</h2>
        <p className="text-slate-500 text-sm mb-4">Lihat status pegawai pada tarikh tertentu.</p>
        
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                    type="text"
                    placeholder="Cari nama atau jawatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
            </div>
            <div className="relative w-full md:w-64">
                <div className="absolute left-3 top-3 text-slate-500 pointer-events-none">
                    <span className="text-xs font-semibold text-slate-400">TARIKH:</span>
                </div>
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-16 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium text-slate-700"
                />
            </div>
        </div>
      </div>

      {/* Daily Summary Stats */}
      <div className="flex items-center justify-between bg-blue-50 px-6 py-3 rounded-lg border border-blue-100 text-sm">
          <div className="flex items-center gap-2 text-blue-800">
              <Info size={18} />
              <span className="font-semibold">Status pada {formatDate(selectedDate)}:</span>
          </div>
          <div className="flex gap-4">
              <span className="text-emerald-700 font-medium">Dalam Pejabat: <b>{stats.in}</b></span>
              <span className="text-red-700 font-medium">Keluar: <b>{stats.out}</b></span>
          </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4">
        {processedData.map(staff => {
          const isOut = staff.displayedStatus === StaffStatus.OUT_OF_OFFICE;
          const move = staff.matchedMovement;

          return (
            <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1.5 ${isOut ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-slate-100 rounded-full text-slate-500">
                        <User size={18}/>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{staff.name}</h3>
                        <p className="text-slate-500 text-sm">{staff.position}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isOut ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {staff.displayedStatus}
                  </span>
                </div>

                {isOut && move ? (
                  <div className="ml-12 bg-slate-50 rounded-lg p-4 text-sm space-y-2 border border-slate-100 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold text-slate-700">Lokasi:</span> {move.location}, {move.state}
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold text-slate-700">Tarikh:</span> {formatDate(move.dateOut)} - {formatDate(move.dateReturn)}
                            </div>
                        </div>
                    </div>
                     <div className="flex items-start gap-2 pt-1 border-t border-slate-200 mt-1">
                        <div className="w-4 shrink-0" /> 
                        <div className="text-slate-600 italic">
                             "{move.purpose}"
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-12 text-sm text-slate-400 italic flex items-center gap-2 mt-2">
                     <MapPin size={14} /> 
                     {selectedDate === new Date().toISOString().slice(0,10) 
                        ? 'Berada di pejabat.' 
                        : 'Tiada rekod pergerakan pada tarikh ini.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {processedData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Filter className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500">Tiada pegawai dijumpai dengan kriteria carian ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
