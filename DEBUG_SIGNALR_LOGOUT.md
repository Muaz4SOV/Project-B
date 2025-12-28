# Debug SignalR Logout Issue

## Problem

Logout nahi ho raha - relogin ho jata hai. SignalR connection properly work nahi kar rahi.

## Debugging Steps

### 1. Check Browser Console

Browser console me ye logs check karo:

#### ✅ Successful Connection:
```
🔌 Initializing SignalR connection for user: auth0|... on route: /
✅ SignalR Connected to Logout Hub - Connection ID: ...
📡 SignalR State: Connected
👤 Attempting to join logout group for user: auth0|...
✅ Joined logout group for user: auth0|...
```

#### ❌ If Connection Fails:
```
❌ SignalR Connection Error: ...
❌ Connection Error Details: {...}
```

### 2. Check SignalR Connection Status

Browser console me type karo:
```javascript
// Check if SignalR connection exists (will show in console)
```

### 3. Check Backend Logs

Backend me verify karo:
- SignalR hub `/hubs/logout` accessible hai?
- Logout event broadcast ho raha hai?
- Group join successful hai?

### 4. Test SignalR Connection Manually

Browser console me ye code run karo:

```javascript
// Test SignalR connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://dev.dynamicpricingbuilder.com/hubs/logout')
  .build();

connection.start()
  .then(() => console.log('✅ Connected:', connection.connectionId))
  .catch(err => console.error('❌ Connection failed:', err));

connection.on('UserLoggedOut', (data) => {
  console.log('🔔 Logout event received:', data);
});
```

## Common Issues

### Issue 1: CORS Error
**Symptom**: Console me CORS error
**Fix**: Backend me CORS properly configured hai ya nahi check karo

### Issue 2: Connection Not Established
**Symptom**: "✅ SignalR Connected" log nahi aa raha
**Fix**: 
- Backend URL correct hai?
- Backend running hai?
- Network tab me negotiate request successful hai?

### Issue 3: Group Join Failed
**Symptom**: "✅ Joined logout group" log nahi aa raha
**Fix**:
- Backend me `JoinLogoutGroup` method hai?
- User.sub value correct hai?
- Backend logs check karo

### Issue 4: Logout Event Not Received
**Symptom**: "🔔 Logout event received" log nahi aa raha
**Fix**:
- Backend se logout event broadcast ho raha hai?
- Group join successful hai?
- User.sub match kar raha hai?

### Issue 5: Relogin After Logout
**Symptom**: Logout ke baad automatically login ho jata hai
**Fix**:
- `auth0_logout_timestamp` properly set ho raha hai?
- localStorage properly clear ho raha hai?
- Silent auth check properly work kar rahi hai?

## Quick Fixes Applied

### 1. Enhanced Logging
- Detailed connection logs
- Connection state logging
- Group join logging
- Event received logging

### 2. Logout Timestamp
- Logout event receive hote hi timestamp set hota hai
- Relogin prevent karne ke liye

### 3. Better Error Handling
- Connection errors detailed logging
- Retry logic with logging

## Next Steps

1. Browser console me logs check karo
2. Backend logs check karo
3. Network tab me SignalR requests check karo
4. Console me errors share karo if any

