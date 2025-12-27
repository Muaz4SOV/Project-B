
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

  // Identify errors that mean "Silent Auth is not possible right now" - these are expected and should be ignored
  const isSilentAuthFailed = 
    error?.message?.toLowerCase().includes('login required') || 
    error?.message?.toLowerCase().includes('consent required') ||
    error?.message?.toLowerCase().includes('interaction_required') ||
    (error as any)?.error === 'login_required' ||
    (error as any)?.error === 'consent_required' ||
    (error as any)?.error === 'interaction_required';

  // Clean up URL parameters after callback handling (especially for silent auth failures and invalid state)
  useEffect(() => {
    if (!isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description') || '';
      const isCallbackRoute = window.location.pathname === '/callback' || window.location.pathname.endsWith('/callback');
      
      // If we have a login_required error on callback route, clean up URL to prevent 404
      if (isCallbackRoute && errorParam === 'login_required') {
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', window.location.origin);
        }, 500);
        return () => clearTimeout(timer);
      }
      
      // Handle invalid state errors by cleaning up and allowing retry
      if (isCallbackRoute && (
        errorParam === 'invalid_state' || 
        errorDescription.toLowerCase().includes('invalid state') ||
        errorDescription.toLowerCase().includes('state mismatch')
      )) {
        // Clear Auth0 state from localStorage
        const auth0Keys = Object.keys(localStorage).filter(key => 
          key.includes('auth0') || key.includes('@@auth0spajs')
        );
        auth0Keys.forEach(key => localStorage.removeItem(key));
        
        // Clean up URL
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', window.location.origin);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    // Logic for Silent SSO:
    // 1. User is not logged in.
    // 2. We are not currently loading the Auth0 state.
    // 3. We haven't already failed a silent attempt (prevents infinite loops).
    // 4. We haven't just been redirected back with a result (?code= or ?error=).
    if (!isLoading && !isAuthenticated && !isSilentAuthFailed && !hasAttemptedSilentAuth.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCallbackParams = urlParams.has('error') || urlParams.has('code') || urlParams.has('state');
      const isCallbackRoute = window.location.pathname === '/callback' || window.location.pathname.endsWith('/callback');

      // Only attempt silent auth if we're not on callback route and no callback params
      if (!hasCallbackParams && !isCallbackRoute) {
        console.log("🚀 SSO Handshake: Checking for existing session...");
        hasAttemptedSilentAuth.current = true;
        
        loginWithRedirect({
          authorizationParams: {
            prompt: 'none', // Try to login in the background
          },
        }).catch(err => {
          console.warn("Silent SSO skip:", err.message);
          // Reset the flag on error so user can try again if needed
          hasAttemptedSilentAuth.current = false;
        });
      } else if (hasCallbackParams && urlParams.get('error') === 'login_required') {
        // Mark as attempted when we see login_required error to prevent loops
        hasAttemptedSilentAuth.current = true;
      }
    }
  }, [isLoading, isAuthenticated, isSilentAuthFailed, loginWithRedirect]);

  // Handle invalid state errors (common in cross-domain SSO) - these should trigger a clean retry
  const isInvalidStateError = 
    error?.message?.toLowerCase().includes('invalid state') ||
    error?.message?.toLowerCase().includes('state mismatch');

  // Handle retry with cleanup for invalid state errors
  const handleRetryConnection = () => {
    // Clear Auth0 related localStorage items to reset state
    const auth0Keys = Object.keys(localStorage).filter(key => 
      key.includes('auth0') || key.includes('@@auth0spajs')
    );
    auth0Keys.forEach(key => localStorage.removeItem(key));
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.origin);
    
    // Trigger a fresh login
    setTimeout(() => {
      loginWithRedirect();
    }, 100);
  };

  // Handle genuine configuration or network errors (not login/consent issues)
  // Silent auth failures (login_required, consent_required) are expected and should show landing page
  // Invalid state errors should show retry button that cleans up and retries
  if (error && !isSilentAuthFailed && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl max-w-md text-center shadow-2xl shadow-red-500/10">
          <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Auth Connection Error</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            {isInvalidStateError 
              ? "Session state mismatch detected. This can happen when switching between different domains. Click below to retry with a fresh login."
              : "We couldn't reach the identity provider. Please check your internet or configuration."
            }
            <br/><span className="text-red-400/80 mt-2 block font-mono text-xs">{error.message}</span>
          </p>
          <button 
            onClick={handleRetryConnection}
            className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            {isInvalidStateError ? 'Retry Login' : 'Retry Connection'}
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
