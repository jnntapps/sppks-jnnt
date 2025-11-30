
export enum StaffStatus {
  IN_OFFICE = 'Dalam Pejabat',
  OUT_OF_OFFICE = 'Keluar',
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  username: string;
  password?: string; // Optional for security when listing
  role: UserRole;
  currentStatus: StaffStatus;
  rank?: number; // Added for manual ordering
}

export interface Movement {
  id: string;
  staffId: string;
  staffName: string;
  dateOut: string; // YYYY-MM-DD
  dateReturn: string; // YYYY-MM-DD
  timeOut?: string;
  timeReturn?: string;
  location: string;
  state: string; // Negeri
  purpose: string;
  statusFrequency: StaffStatus; // Auto-generated status based on logic
}

export const MALAYSIA_STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", 
  "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", 
  "Labuan", "Putrajaya"
];
