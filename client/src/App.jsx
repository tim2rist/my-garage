import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Wrench, LogOut, Home, Bell, History, Sun, Moon, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard      from './pages/Dashboard';
import Community      from './pages/Community';
import Auth           from './pages/Auth';
import ServiceHistory from './pages/ServiceHistory';
import './App.css';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  if (loading) return null;
  if (!user)   return <Auth />;

  const pageMeta = {
    '/':          { title: `Cześć, ${user.username}! 👋`, subtitle: 'Oto podsumowanie twojego garażu.' },
    '/community': { title: 'Społeczność MyGarage 🌍',      subtitle: 'Inspiruj się projektami innych.'  },
    '/history':   { title: 'Historia Serwisowa 🔧',         subtitle: 'Pełna historia wszystkich wpisów.' },
  };
  const meta = pageMeta[location.pathname] || pageMeta['/'];

  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors duration-300">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen z-40 transition-colors duration-300">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
              <Wrench size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">MyGarage</h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/"          className={navLinkClass}><Home    size={20} /> Start</NavLink>
            <NavLink to="/community" className={navLinkClass}><Users   size={20} /> Społeczność</NavLink>
            <NavLink to="/history"   className={navLinkClass}><History size={20} /> Historia Serwisowa</NavLink>
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* User chip */}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">@{user.username}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut size={18} /> Wyloguj się
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-x-hidden">

          {/* Mobile top bar */}
          <nav className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Wrench size={18} /></div>
                <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">MyGarage</h1>
              </div>
              <button
                onClick={() => setIsDarkMode(d => !d)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </nav>

          {/* Desktop page header */}
          <header className="hidden md:flex justify-between items-center p-8 pb-0 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{meta.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{meta.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(d => !d)}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm relative cursor-pointer">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
            </div>
          </header>

          <main className="p-5 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/community" element={<Community />} />
              <Route path="/history"   element={<ServiceHistory />} />
              <Route path="*"          element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

        {/* ── Mobile bottom nav ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40">
          <div className="flex justify-around items-center px-2 py-2">
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 cursor-pointer ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <Home size={22} /><span className="text-[10px] font-bold">Start</span>
            </NavLink>
            <NavLink to="/community" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 cursor-pointer ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <Users size={22} /><span className="text-[10px] font-bold">Społeczność</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 cursor-pointer ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <History size={22} /><span className="text-[10px] font-bold">Historia</span>
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
