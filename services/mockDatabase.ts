import { Staff, Movement, StaffStatus, UserRole } from '../types';

// PENTING: Gantikan URL di bawah dengan Web App URL anda sendiri dari Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbz6KNXfZzJ9y4liIreE7Rj8KvqjfxC2Hjn9WPuraoa-3UxKpeQOwjeH_UGnToXn6Ib8yw/exec";

// Helper for status calculation (client-side logic)
const calculateStatus = (movements: Movement[]): StaffStatus => {
  if (!movements || movements.length === 0) return StaffStatus.IN_OFFICE;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find if there is any movement that covers today
  const activeMovement = movements.find(m => {
    const dOut = new Date(m.dateOut);
    const dRet = new Date(m.dateReturn);
    dOut.setHours(0,0,0,0);
    dRet.setHours(0,0,0,0);
    return today >= dOut && today <= dRet;
  });

  return activeMovement ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE;
};

export const db = {
  getStaff: async (): Promise<Staff[]> => {
    try {
        const response = await fetch(`${API_URL}?action=getStaff`);
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        
        // Robust mapping: Convert numbers/nulls to strings to avoid type mismatch during login
        return data.map((s: any) => ({
            ...s,
            id: String(s.id || ''), 
            name: String(s.name || ''),
            position: String(s.position || ''),
            username: String(s.username || '').trim(), // Trim whitespace
            password: String(s.password || '').trim(), // Trim whitespace & ensure string
            role: (s.role || 'staff') as UserRole,
            currentStatus: s.currentStatus || StaffStatus.IN_OFFICE
        }));
    } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
  },

  getMovements: async (): Promise<Movement[]> => {
    try {
        const response = await fetch(`${API_URL}?action=getMovements`);
        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((m: any) => ({
            ...m,
            id: String(m.id || ''),
            staffId: String(m.staffId || ''),
            dateOut: String(m.dateOut || ''),
            dateReturn: String(m.dateReturn || ''),
            location: String(m.location || ''),
            state: String(m.state || ''),
            purpose: String(m.purpose || ''),
        }));
    } catch (error) {
        console.error("Error fetching movements:", error);
        return [];
    }
  },

  addStaff: async (staff: Omit<Staff, 'id' | 'currentStatus'>) => {
    const id = Date.now().toString();
    const payload = { ...staff, id, currentStatus: StaffStatus.IN_OFFICE };
    
    // Using simple POST. For GAS, we often send as stringified body to avoid complex CORS preflight issues if text/plain
    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "addStaff", payload })
    });
    return payload;
  },

  updateStaff: async (staff: Staff) => {
    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStaff", payload: staff })
    });
  },

  deleteStaff: async (id: string) => {
    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteStaff", payload: { id } })
    });
  },

  addMovement: async (movement: Omit<Movement, 'id' | 'statusFrequency'>) => {
    const id = 'm' + Date.now().toString();
    
    // Status Frequency logic (for the movement record itself)
    const today = new Date();
    today.setHours(0,0,0,0);
    const dRet = new Date(movement.dateReturn);
    dRet.setHours(0,0,0,0);
    
    const statusFreq = dRet >= today ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE;

    const payload = { ...movement, id, statusFrequency: statusFreq };

    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "addMovement", payload })
    });
    return payload;
  },
  
  // Logic to sync status based on latest movements
  syncStaffStatus: async (staffList: Staff[], movementList: Movement[]) => {
      const updatedList = staffList.map(staff => {
          const staffMoves = movementList.filter(m => String(m.staffId) === String(staff.id));
          // Sort descending
          staffMoves.sort((a, b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());
          
          const computedStatus = calculateStatus(staffMoves);
          
          if (computedStatus !== staff.currentStatus) {
              // Fire and forget update to DB to keep it in sync
              db.updateStaff({ ...staff, currentStatus: computedStatus }).catch(err => console.error("Sync error", err));
              
              // Return updated object for UI
              return { ...staff, currentStatus: computedStatus };
          }
          return staff;
      });
      return updatedList;
  }
};