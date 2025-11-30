
// Helper to format date from YYYY-MM-DD or ISO string to DD/MM/YYYY
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  
  const clean = normalizeDate(dateStr);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// ULTRA ROBUST Date Normalizer
// Fungsi ini memaksa apa sahaja input menjadi format YYYY-MM-DD
// Menggunakan Regex untuk ketepatan yang lebih tinggi
export const normalizeDate = (dateStr: any): string => {
    if (dateStr === undefined || dateStr === null) return '';
    
    let s = String(dateStr).trim();
    
    // Buang invisible characters (BOM, zero-width space) yang mungkin datang dari copy-paste
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Regex 1: Format ISO atau Standard Database (YYYY-MM-DD atau YYYY/MM/DD)
    // Contoh: "2025-2-1", "2025-02-01", "2025/02/01 10:00:00"
    // Ditambah \s* untuk menangani typo spacing (cth: 2025 / 2 / 1)
    const isoMatch = s.match(/^(\d{4})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{1,2})/);
    if (isoMatch) {
        // Group 1: Year, Group 2: Month, Group 3: Day
        return `${isoMatch[1]}-${isoMatch[2].padStart(2,'0')}-${isoMatch[3].padStart(2,'0')}`;
    }

    // Regex 2: Format Malaysia/UK (DD-MM-YYYY atau DD/MM/YYYY)
    // Contoh: "1-2-2025", "01/02/2025", "25/2/2025 08:30"
    const myMatch = s.match(/^(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/);
    if (myMatch) {
        // Group 1: Day, Group 2: Month, Group 3: Year
        return `${myMatch[3]}-${myMatch[2].padStart(2,'0')}-${myMatch[1].padStart(2,'0')}`;
    }

    // Fallback: Jika format pelik (contoh: "Feb 25 2025")
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    // Jika gagal, pulangkan string asal (untuk elak crash, walau data mungkin salah)
    return s;
};

// Get today's date as YYYY-MM-DD string in LOCAL time
export const getTodayString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to determine movement status (Simplified to 2 statuses)
export const getMovementTimeStatus = (dateOut: string, dateReturn: string) => {
  const today = getTodayString();
  const end = normalizeDate(dateReturn);

  // Jika tarikh akhir < hari ini (sudah lepas) -> SELESAI (Hijau)
  if (end < today) {
      return { label: 'SELESAI', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  }
  
  // Jika hari ini <= tarikh akhir (sedang berlangsung atau akan datang) -> DALAM TUGAS (Merah)
  return { label: 'DALAM TUGAS', color: 'bg-red-100 text-red-700 border border-red-200' };
};
