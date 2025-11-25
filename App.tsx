
import React, { useState, useEffect } from 'react';
import { Staff, Movement, UserRole } from './types';
import { db } from './services/mockDatabase';
import Dashboard from './components/Dashboard';
import MovementForm from './components/MovementForm';
import AdminPanel from './components/AdminPanel';
import Search from './components/Search';
import Profile from './components/Profile';
import Reports from './components/Reports';
import { LayoutDashboard, FileText, Search as SearchIcon, Settings, LogOut, UserCircle, Loader2, RefreshCw, WifiOff, UserCog, PlusCircle, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

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
    setNetworkError(false);
    try {
        const staff = await db.getStaff();
        const moves = await db.getMovements();
        
        // Run sync logic
        const syncedStaff = await db.syncStaffStatus(staff, moves);
        
        setStaffList(syncedStaff);
        setMovements(moves);
    } catch (e) {
        console.error("Failed to load data", e);
        setNetworkError(true);
    } finally {
        if (!silent) setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
        const staffData = await db.getStaff();
        
        if (staffData.length === 0) throw new Error("Empty data returned");
        
        const inputUsername = loginForm.username.trim();
        const inputPassword = loginForm.password.trim();

        const staff = staffData.find(s => {
             const sUser = (s.username || '').trim();
             const sPass = (s.password || '').trim();
             return sUser.toLowerCase() === inputUsername.toLowerCase() && sPass === inputPassword;
        });
    
        if (staff) {
          localStorage.setItem('sppks_user', JSON.stringify(staff));
          setUser(staff);
          if (staffList.length === 0) refreshData();
          setActiveTab('dashboard');
        } else {
          setLoginError('Username atau Password salah.');
        }
    } catch (e) {
        setLoginError('Ralat sambungan. Sila cuba guna Hotspot.');
        setNetworkError(true);
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
                <h1 className="text-xl font-bold text-slate-800 mb-1 leading-tight">SISTEM PEMANTAUAN PERGERAKAN & KEBERADAAN STAF (SPPKS)</h1>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Jemaah Nazir Negeri Terengganu</p>
            </div>
            <div className="p-8 bg-slate-50">
                {networkError && (
                   <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs text-left flex gap-3 animate-pulse">
                      <WifiOff className="shrink-0 text-red-600" size={20} />
                      <div>
                        <p className="font-bold mb-1">Ralat Sambungan / Firewall</p>
                        <p>Gagal menghubungi pangkalan data. Sila cuba sambung ke Hotspot Telefon.</p>
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
                </form>
            </div>
        </div>
      </div>
    );
  }

  // --- Main App Interface (Responsive) ---
  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex bg-white w-64 border-r border-slate-200 flex-col h-full z-20 shadow-sm print:hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-auto drop-shadow-sm" />
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">SPPKS JNNT</h1>
          </div>
        </div>

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
          <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20}/>} active={activeTab} onClick={setActiveTab} />
          <NavItem id="search" label="Semakan" icon={<SearchIcon size={20}/>} active={activeTab} onClick={setActiveTab} />
          <NavItem id="movement" label="Pergerakan" icon={<PlusCircle size={20}/>} active={activeTab} onClick={setActiveTab} />
          <NavItem id="reports" label="Laporan" icon={<FileText size={20}/>} active={activeTab} onClick={setActiveTab} />
          <NavItem id="profile" label="Profil" icon={<UserCog size={20}/>} active={activeTab} onClick={setActiveTab} />
          
          {user.role === UserRole.ADMIN && (
             <NavItem id="admin" label="Admin Panel" icon={<Settings size={20}/>} active={activeTab} onClick={setActiveTab} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <button onClick={() => refreshData()} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
             <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} /> Kemaskini
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER (Visible only on Mobile) */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center z-30 shadow-sm shrink-0 h-16 print:hidden">
          <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="w-8 h-8" />
              <div>
                  <h1 className="font-bold text-slate-800 text-sm leading-none">SPPKS JNNT</h1>
                  <p className="text-[10px] text-slate-500">Jemaah Nazir Terengganu</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refreshData()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                <LogOut size={20} />
            </button>
          </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 relative pb-20 md:pb-0">
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-50 print:hidden">
                <div className="h-full bg-primary animate-progress"></div>
            </div>
        )}
        
        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-full print:p-0 print:max-w-none">
          {activeTab === 'dashboard' && <Dashboard staffList={staffList} />}
          {activeTab === 'search' && <Search staffList={staffList} movements={movements} />}
          {activeTab === 'movement' && (
             <MovementForm 
               currentUser={user} 
               onMovementAdded={refreshData} 
               myMovements={movements.filter(m => String(m.staffId) === String(user.id)).sort((a,b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime())}
             />
          )}
          {activeTab === 'reports' && <Reports staffList={staffList} movements={movements} />}
          {activeTab === 'profile' && <Profile currentUser={user} onUpdate={refreshData} />}
          {activeTab === 'admin' && user.role === UserRole.ADMIN && <AdminPanel staffList={staffList} onUpdate={refreshData} />}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Visible only on Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 grid grid-cols-5 items-center px-1 py-2 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden">
         <MobileNavItem id="dashboard" label="Utama" icon={<LayoutDashboard size={20}/>} active={activeTab} onClick={setActiveTab} />
         <MobileNavItem id="search" label="Carian" icon={<SearchIcon size={20}/>} active={activeTab} onClick={setActiveTab} />
         
         {/* Highlighted 'Add Movement' Button */}
         <div className="relative -top-5 flex justify-center">
             <button 
                onClick={() => setActiveTab('movement')}
                className={`flex flex-col items-center justify-center rounded-full w-14 h-14 shadow-lg border-4 border-slate-50 transition-all ${activeTab === 'movement' ? 'bg-primary text-white scale-110' : 'bg-blue-600 text-white'}`}
             >
                 <PlusCircle size={28} />
             </button>
         </div>

         <MobileNavItem id="reports" label="Laporan" icon={<FileText size={20}/>} active={activeTab} onClick={setActiveTab} />
         
         {user.role === UserRole.ADMIN ? (
             <MobileNavItem id="admin" label="Admin" icon={<Settings size={20}/>} active={activeTab} onClick={setActiveTab} />
         ) : (
             <MobileNavItem id="profile" label="Profil" icon={<UserCog size={20}/>} active={activeTab} onClick={setActiveTab} />
         )}
      </nav>

    </div>
  );
};

// Helper Components
const NavItem: React.FC<{id: string, label: string, icon: React.ReactNode, active: string, onClick: (id: string) => void}> = ({ id, label, icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active === id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon} {label}
  </button>
);

const MobileNavItem: React.FC<{id: string, label: string, icon: React.ReactNode, active: string, onClick: (id: string) => void}> = ({ id, label, icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex flex-col items-center justify-center py-1 gap-1 rounded-lg transition-colors min-w-0 ${
      active === id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium leading-none truncate w-full text-center px-0.5">{label}</span>
  </button>
);

export default App;
