
import React, { useState, useEffect } from 'react';
import { Staff, Movement, UserRole } from './types';
import { db } from './services/mockDatabase';
import Dashboard from './components/Dashboard';
import MovementForm from './components/MovementForm';
import AdminPanel from './components/AdminPanel';
import Search from './components/Search';
import { LayoutDashboard, Users, FileText, Search as SearchIcon, Settings, LogOut, UserCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Logo URL
  const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Malaysia.svg";

  // Initial Load & Session Check
  useEffect(() => {
    // 1. Check for saved session
    const savedUser = localStorage.getItem('sppks_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('sppks_user');
      }
    }

    // 2. Fetch Initial Data
    refreshData();

    // 3. Set up Auto-Refresh every 60 seconds to keep dashboard live
    const intervalId = setInterval(() => {
        refreshData(true); // silent refresh
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const refreshData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
        const staff = await db.getStaff();
        const moves = await db.getMovements();
        
        // Run sync logic
        const syncedStaff = await db.syncStaffStatus(staff, moves);
        
        setStaffList(syncedStaff);
        setMovements(moves);
    } catch (e) {
        console.error("Failed to load data", e);
    } finally {
        if (!silent) setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
        // Fetch fresh data to ensure login is accurate
        const staffData = await db.getStaff();
        
        // Robust comparison: Trim inputs and ignore case for username
        const inputUsername = loginForm.username.trim();
        const inputPassword = loginForm.password.trim();

        const staff = staffData.find(s => {
             // Handle potential undefined/null data
             const sUser = (s.username || '').trim();
             const sPass = (s.password || '').trim();
             
             // Username case-insensitive, password case-sensitive
             return sUser.toLowerCase() === inputUsername.toLowerCase() && sPass === inputPassword;
        });
    
        if (staff) {
          // Save session
          localStorage.setItem('sppks_user', JSON.stringify(staff));
          
          setUser(staff);
          // Only refresh full data if we haven't already
          if (staffList.length === 0) refreshData();
          setActiveTab('dashboard');
        } else {
          setLoginError('Username atau Password salah. Sila semak ejaan (Case Sensitive pada password).');
        }
    } catch (e) {
        setLoginError('Ralat sambungan ke Google Sheets. Sila cuba lagi.');
    } finally {
        setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sppks_user');
    setUser(null);
    setLoginForm({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-white p-8 text-center border-b border-slate-100">
                <img src={LOGO_URL} alt="Jata Negara" className="h-24 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-slate-800 mb-1 leading-tight">SISTEM KEBERADAAN PEGAWAI JNNT</h1>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Jemaah Nazir Negeri Terengganu</p>
            </div>
            <div className="p-8 bg-slate-50">
                {!isLoading && staffList.length === 0 && (
                   <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-xs text-left flex gap-2">
                      <AlertCircle className="shrink-0 text-yellow-600" size={16} />
                      <div>
                        <p className="font-bold mb-1">Pangkalan Data Kosong</p>
                        <p>Data Admin mungkin belum dimasukkan atau gagal dibaca dari Google Sheets. Sila pastikan format data betul.</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1 opacity-80">
                          <li>Username: <b>admin</b></li>
                          <li>Password: <b>123456</b></li>
                        </ul>
                      </div>
                   </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Username anda"
                            value={loginForm.username}
                            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••"
                            value={loginForm.password}
                            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                        />
                    </div>
                    
                    {loginError && (
                        <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded px-2">{loginError}</p>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoggingIn}
                        className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Log Masuk'}
                    </button>
                    
                    <div className="mt-4 text-center text-xs text-slate-400">
                       <p>Sila log masuk untuk mengemaskini keberadaan.</p>
                    </div>
                </form>
            </div>
        </div>
      </div>
    );
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="bg-white w-full md:w-64 border-r border-slate-200 flex flex-col md:h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-auto drop-shadow-sm" />
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">SISTEM KEBERADAAN PEGAWAI JNNT</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Jemaah Nazir Negeri Terengganu</p>
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 bg-slate-50 m-4 rounded-xl border border-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <UserCircle size={24} />
             </div>
             <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                 <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
             </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          <NavItem 
            id="dashboard" 
            label="Dashboard" 
            icon={<LayoutDashboard size={20}/>} 
            active={activeTab} 
            onClick={setActiveTab} 
          />
          <NavItem 
            id="search" 
            label="Semakan Status" 
            icon={<SearchIcon size={20}/>} 
            active={activeTab} 
            onClick={setActiveTab} 
          />
          <NavItem 
            id="movement" 
            label="Rekod Pergerakan" 
            icon={<FileText size={20}/>} 
            active={activeTab} 
            onClick={setActiveTab} 
          />
          
          {user.role === UserRole.ADMIN && (
            <>
                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
                </div>
                <NavItem 
                    id="admin" 
                    label="Pengurusan Pegawai" 
                    icon={<Settings size={20}/>} 
                    active={activeTab} 
                    onClick={setActiveTab} 
                />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          {/* Manual Refresh Button */}
          <button
             onClick={() => refreshData()}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
          >
             <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} /> Kemaskini Data
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} /> Log Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-50">
                <div className="h-full bg-primary animate-progress"></div>
            </div>
        )}
        
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
             <Dashboard staffList={staffList} />
          )}

          {activeTab === 'search' && (
             <Search staffList={staffList} movements={movements} />
          )}

          {activeTab === 'movement' && (
             <MovementForm 
               currentUser={user} 
               onMovementAdded={refreshData} 
               myMovements={movements.filter(m => String(m.staffId) === String(user.id)).sort((a,b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime())}
             />
          )}

          {activeTab === 'admin' && user.role === UserRole.ADMIN && (
             <AdminPanel staffList={staffList} onUpdate={refreshData} />
          )}
        </div>
      </main>
    </div>
  );
};

// Sub-component for Navigation Item
const NavItem: React.FC<{id: string, label: string, icon: React.ReactNode, active: string, onClick: (id: string) => void}> = ({ id, label, icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active === id 
        ? 'bg-primary text-white shadow-md shadow-blue-900/20' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
