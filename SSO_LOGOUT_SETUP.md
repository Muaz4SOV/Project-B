# SSO Logout Configuration Guide

## Current Implementation

The logout in Project B is now configured to perform **federated logout**, which should clear the SSO session for all connected apps.

## How It Works

1. When user clicks "Sign Out" in Project B:
   - Auth0 React SDK's `logout()` function is called
   - By default, this performs **server-side logout** (not localOnly)
   - Redirects to Auth0's logout endpoint: `https://{domain}/v2/logout`
   - Auth0 clears the SSO session
   - Redirects back to the `returnTo` URL

2. When Project A tries to use its session:
   - It should detect that the Auth0 SSO session is cleared
   - User should be logged out automatically

## Important: Auth0 Configuration

For SSO logout to work properly, you need to ensure both Project A and Project B are properly configured in Auth0:

### 1. Same Auth0 Tenant
- ✅ Both apps use: `dev-4v4hx3vrjxrwitlc.us.auth0.com`

### 2. Same Client ID (Recommended for SSO)
- Check if both apps use the same Client ID
- If they use different Client IDs, they need to be configured for SSO

### 3. Allowed Logout URLs
Make sure both Project A and Project B URLs are in the **Allowed Logout URLs** in Auth0:

**For Project A:**
```
https://project-a-flax.vercel.app
https://project-a-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app
```

**For Project B:**
```
https://project-b-black.vercel.app
https://project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app
https://project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app
```

## Testing SSO Logout

1. **Login to both apps:**
   - Open Project A in one tab
   - Open Project B in another tab
   - Login to both (they should share the SSO session)

2. **Logout from Project B:**
   - Click "Sign Out" in Project B
   - Should redirect to Auth0 logout
   - Then redirect back to Project B (logged out)

3. **Check Project A:**
   - Go back to Project A tab
   - Refresh the page
   - Project A should detect the session is gone and show login page

## Troubleshooting

If SSO logout is not working:

1. **Check Client IDs:**
   - Verify both apps are using the same Client ID OR
   - Ensure both Client IDs are configured for SSO in Auth0

2. **Check Auth0 Dashboard:**
   - Go to Auth0 Dashboard → Applications
   - Check "Advanced Settings" → "OAuth" tab
   - Ensure "OIDC Conformant" is enabled

3. **Check Logout URLs:**
   - Verify all URLs are in "Allowed Logout URLs"
   - Make sure URLs match exactly (including https://)

4. **Test the logout endpoint directly:**
   ```
   https://dev-4v4hx3vrjxrwitlc.us.auth0.com/v2/logout?returnTo={your_url}&client_id={client_id}
   ```

## Note

SSO logout relies on Auth0's SSO session management. When you logout from one app:
- The Auth0 SSO session is cleared
- Other apps should detect this when they try to use their tokens
- However, if an app has a valid refresh token, it might still work until the token expires or is refreshed

For true SSO logout, ensure both apps are properly configured in Auth0 and using the same SSO session.

