
import React, { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2, AlertCircle } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { useLogoutSignalR } from './hooks/useLogoutSignalR';

const App: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    loginWithRedirect,
    getAccessTokenSilently
  } = useAuth0();

  // SignalR logout listener - real-time logout notifications
  useLogoutSignalR();

  // Use a ref to prevent multiple simultaneous redirect attempts
  const hasAttemptedSilentAuth = useRef(false);
  const hasHandledInvalidState = useRef(false);

  // Identify errors that mean "Silent Auth is not possible right now" - these are expected and should be ignored
  const isSilentAuthFailed = 
    error?.message?.toLowerCase().includes('login required') || 
    error?.message?.toLowerCase().includes('consent required') ||
    error?.message?.toLowerCase().includes('interaction_required') ||
    (error as any)?.error === 'login_required' ||
    (error as any)?.error === 'consent_required' ||
    (error as any)?.error === 'interaction_required';

  // Identify invalid state errors (should be automatically handled, not shown as error)
  const isInvalidStateError = 
    error?.message?.toLowerCase().includes('invalid state') ||
    error?.message?.toLowerCase().includes('state mismatch');

  // Automatically handle invalid state errors - clean up and retry login
  useEffect(() => {
    if (isInvalidStateError && !hasHandledInvalidState.current && !isLoading) {
      hasHandledInvalidState.current = true;
      
      // Clear Auth0 state from localStorage
      const auth0Keys = Object.keys(localStorage).filter(key => 
        key.includes('auth0') || key.includes('@@auth0spajs')
      );
      auth0Keys.forEach(key => localStorage.removeItem(key));
      
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.origin);
      
      // Trigger a fresh login immediately (redirect happens right away)
      loginWithRedirect().catch(() => {
        // If redirect fails, reset flag to allow retry
        hasHandledInvalidState.current = false;
      });
    }
  }, [isInvalidStateError, isLoading, loginWithRedirect]);

  // Clean up URL parameters after callback handling (especially for silent auth failures)
  useEffect(() => {
    if (!isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const isCallbackRoute = window.location.pathname === '/callback' || window.location.pathname.endsWith('/callback');
      
      // If we have a login_required error on callback route, clean up URL to prevent 404
      if (isCallbackRoute && errorParam === 'login_required') {
        const timer = setTimeout(() => {
          window.history.replaceState({}, '', window.location.origin);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  // Check for logout timestamp before attempting silent login
  const checkLogoutTimestamp = (): boolean => {
    // Check localStorage (works for same domain tabs)
    const logoutTimestamp = localStorage.getItem('auth0_logout_timestamp');
    
    // Check cookie (works across different domains if set properly)
    const logoutCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth0_logout='));
    
    const cookieLogoutTime = logoutCookie ? parseInt(logoutCookie.split('=')[1]) : null;
    const storageLogoutTime = logoutTimestamp ? parseInt(logoutTimestamp) : null;
    
    // Get the most recent logout time from either source
    let logoutTime: number | null = null;
    if (storageLogoutTime) logoutTime = storageLogoutTime;
    if (cookieLogoutTime && (!logoutTime || cookieLogoutTime > logoutTime)) {
      logoutTime = cookieLogoutTime;
    }
    
    if (logoutTime) {
      const now = Date.now();
      const timeDiff = now - logoutTime;
      
      // If logout happened in last 10 minutes, skip silent login
      if (timeDiff < 10 * 60 * 1000) {
        console.log("Logout detected - skipping silent login");
        return true;
      }
    }
    
    return false;
  };

  // ========================================
  // AGGRESSIVE SESSION VALIDATION
  // Checks Auth0 session every 2 seconds using userinfo endpoint
  // ========================================
  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isCallbackRoute = window.location.pathname === '/callback' || window.location.pathname.endsWith('/callback');
    
    if (isCallbackRoute) {
      return;
    }

    const auth0Domain = "dev-4v4hx3vrjxrwitlc.us.auth0.com";

    // Check for logout timestamp from another tab/window/app
    const checkLogoutTimestampForSession = (): boolean => {
      const logoutTimestamp = localStorage.getItem('auth0_logout_timestamp');
      const logoutCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth0_logout='));
      
      const cookieLogoutTime = logoutCookie ? parseInt(logoutCookie.split('=')[1]) : null;
      const storageLogoutTime = logoutTimestamp ? parseInt(logoutTimestamp) : null;
      
      let logoutTime: number | null = null;
      if (storageLogoutTime) logoutTime = storageLogoutTime;
      if (cookieLogoutTime && (!logoutTime || cookieLogoutTime > logoutTime)) {
        logoutTime = cookieLogoutTime;
      }
      
      if (logoutTime) {
        const lastCheck = localStorage.getItem('auth0_last_session_check');
        
        // If logout happened after our last check, we need to logout
        if (!lastCheck || parseInt(lastCheck) < logoutTime) {
          console.log("Logout detected from another app - logging out");
          return true;
        }
      }
      return false;
    };

    // Perform logout cleanup
    const performLogout = () => {
      // Clear all Auth0 cache
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || 
            key.includes('@@auth0spajs@@') || 
            key.toLowerCase().includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('ss_check_') || 
            key.toLowerCase().includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Reload page to trigger logout state
      window.location.reload();
    };

    // Validate session by calling Auth0 userinfo endpoint
    const validateSession = async () => {
      if (checkLogoutTimestampForSession()) {
        performLogout();
        return;
      }

      localStorage.setItem('auth0_last_session_check', Date.now().toString());

      try {
        // Get fresh token (forces Auth0 to verify session)
        const token = await getAccessTokenSilently({
          cacheMode: 'off', // NO cache - forces fresh check
          timeoutInSeconds: 2,
          authorizationParams: {
            prompt: 'none'
          }
        });

        // Verify token by calling Auth0 userinfo endpoint
        // If federated logout cleared session, this will fail
        const userInfoResponse = await fetch(`https://${auth0Domain}/userinfo`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (!userInfoResponse.ok) {
          // Session invalid - logout
          console.log("Userinfo call failed - Auth0 session invalid", userInfoResponse.status);
          performLogout();
          return;
        }

      } catch (error: any) {
        // Session invalid - logout
        console.log("Session validation failed - Auth0 session invalid", error);
        
        if (error?.error === 'login_required' || 
            error?.error === 'invalid_grant' ||
            error?.error === 'unauthorized') {
          performLogout();
          return;
        }
        
        if (checkLogoutTimestampForSession()) {
          performLogout();
          return;
        }
      }
    };

    // Event handlers
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        validateSession();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        validateSession();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth0_logout_timestamp' && e.newValue) {
        performLogout();
      }
    };

    // Immediate validation
    if (checkLogoutTimestampForSession()) {
      performLogout();
      return;
    }

    // Start aggressive validation
    validateSession(); // Immediate check
    const initialTimer = setTimeout(validateSession, 500);
    
    // Validate every 2 seconds (AGGRESSIVE)
    const interval = setInterval(() => {
      if (!checkLogoutTimestampForSession()) {
        validateSession();
      } else {
        performLogout();
      }
    }, 2000); // Changed from 3000 to 2000 for aggressive checking

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  useEffect(() => {
    // Logic for Silent SSO:
    // 1. User is not logged in.
    // 2. We are not currently loading the Auth0 state.
    // 3. We haven't already failed a silent attempt (prevents infinite loops).
    // 4. We haven't just been redirected back with a result (?code= or ?error=).
    if (!isLoading && !isAuthenticated && !isSilentAuthFailed && !hasAttemptedSilentAuth.current) {
      // Check logout timestamp before attempting silent login
      if (checkLogoutTimestamp()) {
        return;
      }

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

  // Handle retry with cleanup for genuine errors
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

  // Handle genuine configuration or network errors (not login/consent issues or invalid state)
  // Silent auth failures (login_required, consent_required) are expected and should show landing page
  // Invalid state errors are automatically handled and shouldn't show error screen
  if (error && !isSilentAuthFailed && !isInvalidStateError && !isAuthenticated) {
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
            onClick={handleRetryConnection}
            className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen during auth handshake or when handling invalid state
  if (isLoading || (isInvalidStateError && hasHandledInvalidState.current)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-14 h-14 text-indigo-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold tracking-widest uppercase text-xs opacity-50">Enterprise Auth</p>
          <p className="text-slate-400 font-medium animate-pulse italic">
            {isInvalidStateError ? 'Resetting session...' : 'Synchronizing your session...'}
          </p>
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
