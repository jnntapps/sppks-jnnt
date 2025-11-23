
// Helper to format date from YYYY-MM-DD to DD/MM/YYYY
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Helper to determine movement status (Active, Upcoming, Past)
export const getMovementTimeStatus = (dateOut: string, dateReturn: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dOut = new Date(dateOut);
  dOut.setHours(0, 0, 0, 0);
  
  const dRet = new Date(dateReturn);
  dRet.setHours(0, 0, 0, 0);

  if (today > dRet) return { label: 'TAMAT', color: 'bg-slate-100 text-slate-500' };
  if (today < dOut) return { label: 'AKAN DATANG', color: 'bg-blue-100 text-blue-700' };
  return { label: 'SEDANG BERLANGSUNG', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
};
