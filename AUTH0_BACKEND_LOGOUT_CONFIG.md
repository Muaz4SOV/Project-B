# Auth0 Backend Logout Callback Configuration

## Important: Back-Channel Logout URL

Ye URL **"Allowed Callback URLs"** me nahi jayegi. Ye **"Back-Channel Logout URL"** field me jayegi.

## Step-by-Step Configuration

### 1. Go to Auth0 Dashboard

1. Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. Select your tenant: `dev-4v4hx3vrjxrwitlc.us.auth0.com`
3. Go to **Applications** → Select your application (Client ID: `vpnqpt3AOLZM5dgt3i84LcMTJUNeANzM`)

### 2. Find Back-Channel Logout URL Field

1. Scroll down to **Advanced Settings** section
2. Click on **Endpoints** tab
3. OR look for **"Back-Channel Logout URL"** field in **Settings** tab

**Note**: Agar "Back-Channel Logout URL" field nahi dikh raha, to:

1. **Settings** tab me scroll karo
2. Ya **Advanced Settings** → **OAuth** tab me dekho
3. Ya **Advanced Settings** → **Endpoints** tab me dekho

### 3. Add Backend Logout Callback URL

**Back-Channel Logout URL** field me add karo:

```
https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback
```

**Ya agar domain different hai:**

```
https://dev.dynamicpricingbuilder.com/api/auth/logout-callback
```

**Important Points:**
- ✅ Exact URL match hona chahiye backend endpoint se
- ✅ `https://` use karo (not `http://`)
- ✅ Complete path include karo (`/api/auth/logout-callback`)
- ✅ Trailing slash na ho (`/` end me nahi)

### 4. Verify Backend Endpoint

Backend me verify karo ke endpoint correctly configured hai:

- ✅ Endpoint accessible hai: `GET/POST https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback`
- ✅ Endpoint Auth0 logout token receive kar raha hai
- ✅ Endpoint properly configured hai

### 5. Enable Back-Channel Logout

**Advanced Settings** → **OAuth** tab me check karo:

- ✅ **OIDC Conformant** enabled ho
- ✅ **Back-Channel Logout** supported ho (usually default enabled)

### 6. Save Changes

Click **Save Changes** at the bottom of the page.

## How It Works

```
User Logs Out
    ↓
Auth0 → Backend: POST /api/auth/logout-callback
    ↓
Backend receives logout token (JWT)
    ↓
Backend verifies token
    ↓
Backend broadcasts logout via SignalR
    ↓
Frontend receives logout event
    ↓
Automatic logout ✅
```

## Difference Between URLs

### Frontend Callback URLs (Allowed Callback URLs)
- Used for login redirects
- Example: `https://project-b-black.vercel.app/callback`
- Frontend par redirect hota hai

### Frontend Logout URLs (Allowed Logout URLs)
- Used for logout redirects
- Example: `https://project-b-black.vercel.app`
- Frontend par redirect hota hai after logout

### Backend Logout Callback URL (Back-Channel Logout URL)
- Used for server-to-server logout notification
- Example: `https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback`
- Backend par POST request hoti hai (no redirect)

## Testing

1. **Configure Back-Channel Logout URL** in Auth0 Dashboard
2. **Logout from frontend**
3. **Check backend logs** - `/api/auth/logout-callback` endpoint hit hoga
4. **Verify SignalR broadcast** - Backend se logout event broadcast hoga
5. **Check frontend** - Other apps automatically logout ho jayengi

## Troubleshooting

### Issue: Back-Channel Logout URL field nahi dikh raha

**Solution:**
- Auth0 Dashboard → Applications → Your App → **Settings** tab
- Scroll down to **Advanced Settings**
- Click **Show Advanced Settings**
- Look for **"Back-Channel Logout URL"** or **"Back Channel Logout URL"**

### Issue: Logout callback nahi aa raha

**Check:**
- ✅ Back-Channel Logout URL correctly set hai
- ✅ Backend endpoint accessible hai
- ✅ Backend endpoint Auth0 logout token accept kar raha hai
- ✅ Backend logs check karo - POST request aa rahi hai ya nahi

### Issue: Domain mismatch

**Check:**
- Backend URL: `https://dynamicpricing-api.dynamicpricingbuilder.com`
- Ya: `https://dev.dynamicpricingbuilder.com`
- Exact URL match hona chahiye backend endpoint se

## Notes

- Back-Channel Logout is a **server-to-server** communication
- Auth0 sends a **POST request** with a JWT token to the backend
- Frontend redirects se different hai - ye direct API call hai
- SignalR broadcast backend se hi hoga jab logout token receive hoga

