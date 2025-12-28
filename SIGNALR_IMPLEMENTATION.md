# SignalR Implementation - Complete Guide

## ✅ Implementation Complete

SignalR has been successfully integrated into Project B for real-time logout notifications.

## Files Created/Modified

### 1. ✅ `hooks/useLogoutSignalR.ts` (NEW)
- SignalR hook for real-time logout notifications
- Connects to backend SignalR hub
- Listens for `UserLoggedOut` events
- Automatically logs out user when event received

### 2. ✅ `App.tsx` (UPDATED)
- Added `useLogoutSignalR()` hook call
- SignalR connection established when user is authenticated

### 3. ✅ `package.json` (UPDATED)
- `@microsoft/signalr` package installed

## Configuration

**Backend URL**: `https://dev.dynamicpricingbuilder.com`  
**SignalR Hub**: `https://dev.dynamicpricingbuilder.com/hubs/logout`  
**Event Name**: `UserLoggedOut`

## How It Works

1. **User Authenticates**: SignalR connection established
2. **Join Group**: User joins their user-specific logout group
3. **User Logs Out**: Backend broadcasts logout event via SignalR
4. **Event Received**: Frontend receives `UserLoggedOut` event
5. **Automatic Logout**: Frontend clears cache and logs out user

## Flow

```
User Logs Out (Project A)
    ↓
Auth0 Logout Endpoint (federated)
    ↓
Auth0 → Backend: /api/auth/logout-callback
    ↓
Backend: BroadcastLogoutAsync() via SignalR
    ↓
SignalR: Broadcast to Group + All Clients
    ↓
Project B: Receive "UserLoggedOut" event
    ↓
Frontend: Check if data.UserId === currentUser.sub
    ↓
Frontend: Automatic logout ✅
```

## Testing

1. **Start Frontend**:
   ```bash
   npm run dev
   ```

2. **Open Browser Console** - You should see:
   - `✅ SignalR Connected to Logout Hub`
   - `✅ Joined logout group for user: auth0|...`

3. **Test Logout Flow**:
   - Login to Project A
   - Login to Project B (same or different browser)
   - Check console for SignalR connection logs
   - Logout from Project A
   - Check Project B console: `🔔 Logout event received`
   - Project B should automatically logout

## Console Logs

When working correctly, you'll see:
- `✅ SignalR Connected to Logout Hub`
- `✅ Joined logout group for user: {userId}`
- `🔔 Logout event received: {data}` (when logout happens)
- `🚪 Current user logged out - logging out from frontend`

## Troubleshooting

### Issue: SignalR Connection Failed
- Check backend URL: `https://dev.dynamicpricingbuilder.com`
- Verify hub endpoint: `/hubs/logout`
- Check CORS configuration on backend
- Check browser console for errors

### Issue: Group Join Failed
- Verify `user.sub` value is valid
- Check backend `LogoutHub.cs` has `JoinLogoutGroup` method
- Verify group name format matches

### Issue: Logout Event Not Received
- Verify SignalR connection is established (check console logs)
- Verify user joined the group successfully
- Check backend logs for broadcast confirmation
- Verify backend is calling `BroadcastLogoutAsync` correctly

## Notes

- SignalR is now the primary method for logout detection
- Old session validation (userinfo endpoint) is still active as a backup
- SignalR provides faster, real-time logout detection
- Connection automatically reconnects if dropped

## Next Steps

1. Test the implementation thoroughly
2. Apply same code to Project A
3. Monitor backend logs for SignalR broadcasts
4. Deploy to production when ready

