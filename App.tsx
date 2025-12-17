
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { User, Announcement } from './types';
import { storageService } from './services/storage';
import { LandingPage, LoginPage, RegisterPage } from './pages/PublicPages';
import { EventsPage, EventDetailsPage, CreateEventPage } from './pages/EventPages';
import { Dashboard } from './pages/Dashboard';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Button, Modal } from './components/UI';
import { Menu, X, User as UserIcon, LogOut, Facebook, Twitter, Instagram, Linkedin, Mail, Home, Trophy, Calendar, LayoutDashboard, MessageCircle, Settings } from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (e: string, p: string) => void;
  register: (u: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = storageService.getSession();
    if (session) setUser(session);
  }, []);

  const login = (email: string, pass: string) => {
    const u = storageService.login(email, pass);
    if (!u) throw new Error('Invalid credentials');
    setUser(u);
  };

  const register = (data: any) => {
    const u = storageService.register(data);
    setUser(u);
  };

  const logout = () => {
    storageService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Top Navbar ---
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-slate-900 shadow-lg sticky top-0 z-40 border-b border-gray-800 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="bg-cyan-500 text-white p-1 rounded mr-2">
                 <Trophy size={20} fill="currentColor" />
              </div>
              <span className="text-xl md:text-2xl font-black text-white tracking-tight">Skope<span className="text-cyan-500">Sports</span></span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/settings" className="h-9 w-9 rounded-full overflow-hidden border-2 border-cyan-500 active:scale-90 transition">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-cyan-900 flex items-center justify-center text-cyan-300"><UserIcon size={18} /></div>
                    )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium">Log in</Link>
                <Link to="/register" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-cyan-500/20">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const BottomNav: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    
    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/results', label: 'Scores', icon: Trophy },
    ];

    if (user) {
        navItems.push({ path: '/dashboard', label: 'Dash', icon: LayoutDashboard });
        navItems.push({ path: '/settings', label: 'Account', icon: Settings });
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-t-[2rem]">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link key={item.path} to={item.path} className="flex flex-col items-center group w-12 no-underline outline-none">
                            <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-cyan-500 text-slate-900 scale-110 translate-y-[-10px] shadow-[0_8px_20px_rgba(6,182,212,0.4)]' : 'active:scale-95'}`}>
                                <Icon 
                                    size={20} 
                                    className={`transition-colors ${isActive ? 'text-slate-900' : 'text-gray-500'}`} 
                                    strokeWidth={isActive ? 3 : 2}
                                />
                            </div>
                            <span className={`text-[9px] mt-1 font-black uppercase tracking-tighter transition-opacity duration-300 ${isActive ? 'text-cyan-400 opacity-100' : 'text-gray-500 opacity-70'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-white pt-12 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="flex items-center mb-4 md:mb-0">
                         <span className="text-xl font-black text-white tracking-tight">Skope<span className="text-cyan-500">Sports</span></span>
                    </div>
                    <p className="opacity-40 text-xs">© {new Date().getFullYear()} SkopeSports Platform.</p>
                    <div className="mt-4 md:mt-0 text-xs font-bold">
                        Developed by <a href="https://skoppedesigns.co.ke" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors underline underline-offset-4">Skope Designs</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const WhatsAppButton: React.FC = () => {
    return (
        <a 
            href="https://wa.me/254742380183?text=Hi%20SkopeSports%20Support%2C%20I%20have%20an%20inquiry%20regarding%20the%20platform."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] md:bottom-8 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        >
            <MessageCircle size={30} fill="white" />
        </a>
    );
};

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-cyan-500 selection:text-white">
          <Navbar />
          <WhatsAppButton />
          <div className="flex-grow">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/results" element={<ResultsPage />} />
                
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path="/admin/create-event" element={<PrivateRoute><CreateEventPage /></PrivateRoute>} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
