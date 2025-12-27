
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Your Auth0 credentials
const domain = "dev-4v4hx3vrjxrwitlc.us.auth0.com";
const clientId = "vpnqpt3AOLZM5dgt3i84LcMTJUNeANzM";

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        // Match the "/callback" path you configured in your Auth0 dashboard
        redirect_uri: window.location.origin + '/callback',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      // Logout redirect URI - should match Auth0 logout URLs configuration
      logoutParams={{
        returnTo: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
