import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth0 } from '@auth0/auth0-react';

const BACKEND_URL = 'https://dev.dynamicpricingbuilder.com';

export const useLogoutSignalR = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const connectionRef = useRef<HubConnection | null>(null);
  const isJoiningGroupRef = useRef(false);
  const joinRetryCountRef = useRef(0);

  // Join group function with retry logic
  const joinGroupWithRetry = async (connection: HubConnection, userId: string, retryCount = 0): Promise<void> => {
    if (isJoiningGroupRef.current) {
      console.log('⏳ Group join already in progress, skipping...');
      return;
    }

    if (retryCount >= 5) {
      console.error('❌ Max retries reached for joining group');
      return;
    }

    isJoiningGroupRef.current = true;

    try {
      await connection.invoke('JoinLogoutGroup', userId);
      console.log(`✅ Joined logout group for user: ${userId}`);
      joinRetryCountRef.current = 0;
      isJoiningGroupRef.current = false;
    } catch (err) {
      console.error(`❌ Error joining logout group (attempt ${retryCount + 1}/5):`, err);
      isJoiningGroupRef.current = false;
      
      // Retry after delay
      if (retryCount < 4) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 1s, 2s, 4s, 5s, 5s
        console.log(`🔄 Retrying group join in ${delay}ms...`);
        setTimeout(() => {
          joinGroupWithRetry(connection, userId, retryCount + 1);
        }, delay);
      }
    }
  };

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user?.sub) {
      // Clean up connection if user is not authenticated
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      return;
    }

    // Note: SignalR should work on all routes including /callback
    // We don't skip callback route because logout can happen while user is on any route

    // Check if connection already exists and is connected - reuse it to avoid disconnections
    if (connectionRef.current) {
      const connectionState = connectionRef.current.state;
      const currentPath = window.location.pathname;
      
      if (connectionState === 'Connected') {
        // Connection already exists and is connected - just ensure we're in the group
        console.log(`✅ SignalR connection already exists and connected on route: ${currentPath}, verifying group membership...`);
        joinGroupWithRetry(connectionRef.current, user.sub, 0);
        return; // Don't create new connection - reuse existing one
      } else if (connectionState === 'Connecting' || connectionState === 'Reconnecting') {
        // Connection is in progress - wait for it to complete instead of recreating
        console.log(`⏳ SignalR connection in progress (${connectionState}) on route: ${currentPath}, skipping recreation...`);
        return;
      } else {
        // Connection exists but is disconnected or in wrong state - clean it up
        console.log(`🧹 Cleaning up existing connection (state: ${connectionState}) on route: ${currentPath}`);
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    }

    const currentPath = window.location.pathname;
    console.log(`🔌 Initializing SignalR connection for user: ${user.sub} on route: ${currentPath}`);

    // Create SignalR connection
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${BACKEND_URL}/hubs/logout`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Retry logic: 0s, 2s, 10s, 30s, then stop
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
          return null; // Stop retrying after 60 seconds
        }
      })
      .build();

    connectionRef.current = connection;

    // Set up event handlers BEFORE starting connection
    // Listen for logout event
    connection.on('UserLoggedOut', async (data: { 
      UserId: string; 
      SessionId?: string; 
      LogoutTime: string;
      Message?: string;
    }) => {
      console.log('🔔 Logout event received:', data);

      // Check if this logout is for current user
      if (data.UserId === user?.sub) {
        console.log('🚪 Current user logged out - logging out from frontend');

        // Clear all Auth0 cache
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth0') || 
              key.includes('@@auth0spajs@@') || 
              key.toLowerCase().includes('auth')) {
            localStorage.removeItem(key);
          }
        });

        // Clear session storage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('ss_check_')) {
            sessionStorage.removeItem(key);
          }
        });

        // Disconnect SignalR before logout
        try {
          await connection.stop();
        } catch (err) {
          console.error('Error stopping SignalR connection:', err);
        }

        // Use Auth0 logout to clear session
        logout({
          logoutParams: {
            returnTo: window.location.origin
          },
          localOnly: false
        });
      } else {
        console.log('ℹ️ Logout event received for different user:', data.UserId);
      }
    });

    // Start connection
    connection.start()
      .then(() => {
        console.log('✅ SignalR Connected to Logout Hub');
        
        // Join user-specific group with retry
        if (user.sub && connection.state === 'Connected') {
          joinGroupWithRetry(connection, user.sub, 0);
        } else {
          console.warn('⚠️ Connection state is not Connected:', connection.state);
          // Try to join after a short delay
          setTimeout(() => {
            if (connection.state === 'Connected' && user.sub) {
              joinGroupWithRetry(connection, user.sub, 0);
            }
          }, 500);
        }
      })
      .catch(err => {
        console.error('❌ SignalR Connection Error:', err);
        // Retry connection after delay
        setTimeout(() => {
          if (isAuthenticated && user?.sub) {
            connection.start()
              .then(() => {
                console.log('✅ SignalR Reconnected after error');
                joinGroupWithRetry(connection, user.sub, 0);
              })
              .catch(retryErr => {
                console.error('❌ SignalR Reconnection failed:', retryErr);
              });
          }
        }, 3000);
      });

    // Handle connection events
    connection.onreconnecting((error) => {
      console.log('🔄 SignalR Reconnecting...', error);
      isJoiningGroupRef.current = false; // Reset join flag on reconnect
    });

    connection.onreconnected((connectionId) => {
      console.log('✅ SignalR Reconnected. Connection ID:', connectionId);
      
      // Rejoin group after reconnection with retry
      if (user?.sub && connection.state === 'Connected') {
        console.log('🔄 Rejoining logout group after reconnection...');
        joinGroupWithRetry(connection, user.sub, 0);
      }
    });

    // Periodic check to ensure we're in the group (every 30 seconds)
    const groupCheckInterval = setInterval(() => {
      if (connection.state === 'Connected' && user?.sub && !isJoiningGroupRef.current) {
        // Periodically verify we're still in the group
        // This helps catch cases where group join might have failed silently
        console.log('🔍 Periodic group membership check...');
        joinGroupWithRetry(connection, user.sub, 0);
      } else {
        console.log(`⚠️ Group check skipped - State: ${connection.state}, User: ${user?.sub}, Joining: ${isJoiningGroupRef.current}`);
      }
    }, 30000); // Check every 30 seconds

    connection.onclose((error) => {
      console.log('❌ SignalR Connection Closed', error);
    });

    // Cleanup on unmount
    return () => {
      clearInterval(groupCheckInterval);
      isJoiningGroupRef.current = false;
      
      if (connectionRef.current) {
        // Leave group before disconnecting
        if (user?.sub && connectionRef.current.state === 'Connected') {
          connectionRef.current.invoke('LeaveLogoutGroup', user.sub)
            .catch(err => console.error('Error leaving group:', err));
        }

        // Stop connection
        connectionRef.current.stop()
          .then(() => console.log('✅ SignalR Connection Stopped'))
          .catch(err => console.error('Error stopping connection:', err));
        
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, user?.sub, logout]);

  return connectionRef.current;
};

