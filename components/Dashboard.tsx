
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut, LayoutDashboard, User, Shield, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { getGeminiGreeting } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth0();
  const [aiGreeting, setAiGreeting] = useState<string>('Initializing secure session...');
  const [isLoadingAi, setIsLoadingAi] = useState(true);

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
    // Note: For cross-domain cookies, you need SameSite=None and Secure
    document.cookie = `auth0_logout=${logoutTime}; path=/; max-age=600; SameSite=Lax`;
    
    // Clear ALL Auth0 cache from localStorage (aggressive cleanup)
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
    
    // Clear ALL session storage flags and data
    const sessionKeysToRemove: string[] = [];
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('ss_check_') || 
          key.toLowerCase().includes('auth') ||
          key.includes(clientId)) {
        sessionKeysToRemove.push(key);
      }
    });
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Clear Auth0 SDK's local cache manually (since localOnly option may not be available)
    // The actual logout will happen via the redirect below
    
    // Immediately redirect to Auth0 logout endpoint for federated logout
    // The 'federated' parameter ensures Auth0 session is cleared server-side
    const logoutUrl = `https://${domain}/v2/logout?` +
      `client_id=${clientId}&` +
      `returnTo=${encodeURIComponent(returnTo)}&` +
      `federated`; // CRITICAL: This clears Auth0 session server-side
    
    // Redirect immediately to logout endpoint
    window.location.href = logoutUrl;
  };

  useEffect(() => {
    const fetchGreeting = async () => {
      if (user?.name) {
        const greeting = await getGeminiGreeting(user.name);
        setAiGreeting(greeting);
        setIsLoadingAi(false);
      }
    };
    fetchGreeting();
  }, [user]);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const switchToProjectA = () => {
    if (isLocalhost) {
      // Local development: switch between ports
      const targetPort = window.location.port === '3000' ? '3001' : '3000';
      window.location.href = `http://localhost:${targetPort}`;
    } else {
      // Production/Vercel: navigate to Project A
      window.location.href = 'https://project-a-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/';
    }
  };

  const getProjectButtonText = () => {
    if (isLocalhost) {
      return `Go to Project ${window.location.port === '3000' ? 'B (3001)' : 'A (3000)'}`;
    }
    return 'Go to Project A';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AuthNexus</span>
        </div>

        <nav className="space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
          <NavItem icon={<User className="w-5 h-5" />} label="Profile" />
          <NavItem icon={<Shield className="w-5 h-5" />} label="Security" />
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

      <main className="flex-1 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              {isLoadingAi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-sm font-medium italic">"{aiGreeting}"</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
            <img 
              src={user?.picture || `https://picsum.photos/seed/${user?.sub}/100/100`} 
              alt="Profile" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="pr-4">
              <p className="font-bold text-white">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
            <h3 className="text-lg font-bold mb-4 text-white">Active Session</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SSO Status</span>
                <span className="text-green-400 font-medium">Synchronized</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Current Port</span>
                <span className="text-indigo-400 font-bold">{window.location.port || '80'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Handshake</span>
                <span className="text-white">Success</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/20">
            <h3 className="text-lg font-bold mb-2">SSO Switcher</h3>
            <p className="text-indigo-100 text-sm mb-6">Test the <b>Silent Handshake</b>. By clicking below, we navigate to Project A where the session is picked up automatically.</p>
            <button 
              onClick={switchToProjectA}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition px-6 py-2 rounded-xl font-semibold border border-white/20"
            >
              <ExternalLink className="w-4 h-4" />
              {getProjectButtonText()}
            </button>
          </div>
        </div>

        <div className="mt-12 bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-white">Security Context</h3>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs text-indigo-300 overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);
