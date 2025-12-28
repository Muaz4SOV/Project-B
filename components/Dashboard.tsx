import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut, Home, Users, Shield, Settings, ExternalLink } from 'lucide-react';
import { Home as HomePage } from './pages/Home';
import { Users as UsersPage } from './pages/Users';
import { Role as RolePage } from './pages/Role';
import { Settings as SettingsPage } from './pages/Settings';

type PageType = 'home' | 'users' | 'role' | 'settings';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth0();
  const [activePage, setActivePage] = useState<PageType>('home');

  // Auth0 credentials
  const domain = "dev-4v4hx3vrjxrwitlc.us.auth0.com";
  const clientId = "vpnqpt3AOLZM5dgt3i84LcMTJUNeANzM";

  // Federated logout function - clears SSO session for all apps
  const handleLogout = () => {
    const returnTo = window.location.origin;
    
    // Set logout timestamp FIRST - this helps detect logout across tabs/domains
    const logoutTime = Date.now().toString();
    localStorage.setItem('auth0_logout_timestamp', logoutTime);
    
    // Set logout flag in cookie (helps with cross-domain detection)
    document.cookie = `auth0_logout=${logoutTime}; path=/; max-age=600; SameSite=Lax`;
    
    // Clear ALL Auth0 cache from localStorage
    const keysToRemove: string[] = [];
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth0') || 
          key.includes('@@auth0spajs@@') || 
          key.toLowerCase().includes('auth') ||
          key.includes(clientId) ||
          key.includes(domain.replace(/\./g, '_'))) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear ALL session storage
    const sessionKeysToRemove: string[] = [];
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('ss_check_') || 
          key.toLowerCase().includes('auth') ||
          key.includes(clientId)) {
        sessionKeysToRemove.push(key);
      }
    });
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Redirect to Auth0 logout endpoint for federated logout
    const logoutUrl = `https://${domain}/v2/logout?` +
      `client_id=${clientId}&` +
      `returnTo=${encodeURIComponent(returnTo)}&` +
      `federated`;
    
    window.location.href = logoutUrl;
  };

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const switchToProjectA = () => {
    if (isLocalhost) {
      const targetPort = window.location.port === '3000' ? '3001' : '3000';
      window.location.href = `http://localhost:${targetPort}`;
    } else {
      window.location.href = 'https://project-a-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/';
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'users':
        return <UsersPage />;
      case 'role':
        return <RolePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">AuthNexus</span>
        </div>

        <nav className="space-y-1">
          <NavItem 
            icon={<Home className="w-5 h-5" />} 
            label="Home" 
            active={activePage === 'home'}
            onClick={() => setActivePage('home')}
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            label="Users" 
            active={activePage === 'users'}
            onClick={() => setActivePage('users')}
          />
          <NavItem 
            icon={<Shield className="w-5 h-5" />} 
            label="Role" 
            active={activePage === 'role'}
            onClick={() => setActivePage('role')}
          />
          <NavItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            active={activePage === 'settings'}
            onClick={() => setActivePage('settings')}
          />
        </nav>

        <div className="pt-8 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-white text-sm">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={switchToProjectA}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Go to Project A
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);
