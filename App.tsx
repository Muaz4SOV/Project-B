
import React, { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2, AlertCircle } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    loginWithRedirect 
  } = useAuth0();

  // Use a ref to prevent multiple simultaneous redirect attempts
  const hasAttemptedSilentAuth = useRef(false);

  // Identify errors that mean "Silent Auth is not possible right now"
  const isSilentAuthFailed = 
    error?.message?.toLowerCase().includes('login required') || 
    error?.message?.toLowerCase().includes('consent required') ||
    error?.message?.toLowerCase().includes('interaction_required') ||
    (error as any)?.error === 'login_required' ||
    (error as any)?.error === 'consent_required';

  useEffect(() => {
    // Logic for Silent SSO:
    // 1. User is not logged in.
    // 2. We are not currently loading the Auth0 state.
    // 3. We haven't already failed a silent attempt (prevents infinite loops).
    // 4. We haven't just been redirected back with a result (?code= or ?error=).
    if (!isLoading && !isAuthenticated && !isSilentAuthFailed && !hasAttemptedSilentAuth.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCallbackParams = urlParams.has('error') || urlParams.has('code') || urlParams.has('state');

      if (!hasCallbackParams) {
        console.log("🚀 SSO Handshake: Checking for existing session...");
        hasAttemptedSilentAuth.current = true;
        
        loginWithRedirect({
          authorizationParams: {
            prompt: 'none', // Try to login in the background
          },
        }).catch(err => {
          console.warn("Silent SSO skip:", err.message);
        });
      }
    }
  }, [isLoading, isAuthenticated, isSilentAuthFailed, loginWithRedirect]);

  // Handle genuine configuration or network errors (not login/consent issues)
  if (error && !isSilentAuthFailed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl max-w-md text-center shadow-2xl shadow-red-500/10">
          <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Auth Connection Error</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            We couldn't reach the identity provider. Please check your internet or configuration.
            <br/><span className="text-red-400/80 mt-2 block font-mono text-xs">{error.message}</span>
          </p>
          <button 
            onClick={() => window.location.href = window.location.origin}
            className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Elegant loading screen during the silent handshake
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-14 h-14 text-indigo-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold tracking-widest uppercase text-xs opacity-50">Enterprise Auth</p>
          <p className="text-slate-400 font-medium animate-pulse italic">Synchronizing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* If auth successful (manual or silent), show Dashboard. Else Landing. */}
      {isAuthenticated ? <Dashboard /> : <LandingPage />}
    </Layout>
  );
};

export default App;
