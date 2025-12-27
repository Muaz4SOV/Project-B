# Auth0 Callback URLs Configuration Guide

## Problem
Vercel creates multiple URLs for your application, and all of them need to be added to Auth0's allowed callback URLs list.

## Your Vercel URLs
Based on your deployment, you have these URLs:

1. ✅ `project-b-black.vercel.app` - **Already added to Auth0**
2. ❌ `project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app` - **NEEDS TO BE ADDED**
3. ❌ `project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app` - **NEEDS TO BE ADDED** (Currently causing the error!)

**Current Status:** Based on your error log, only the first URL is currently authorized in Auth0.

## Steps to Fix

### 1. Go to Auth0 Dashboard
1. Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. Select your tenant: `dev-4v4hx3vrjxrwitlc.us.auth0.com`
3. Go to **Applications** → Select your application (Client ID: `vpnqpt3AOLZM5dgt3i84LcMTJUNeANzM`)

### 2. Add Allowed Callback URLs
In the **Allowed Callback URLs** field, you should see these URLs already:
- `http://localhost:3000/callback`
- `http://localhost:3001/callback`
- `https://localhost:3000/callback`
- `https://localhost:3001/callback`
- `https://project-a-flax.vercel.app/callback`
- `https://project-a-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback`
- `https://project-bdl7tbrhh-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback`
- `https://project-b-black.vercel.app/callback` ✅ (already added)

**Add these 2 missing URLs** (copy and paste them at the end, one per line):

```
https://project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
https://project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
```

**Complete list should look like this (keep all existing URLs + add the 2 above):**
```
http://localhost:3000/callback
http://localhost:3001/callback
https://localhost:3000/callback
https://localhost:3001/callback
https://project-a-flax.vercel.app/callback
https://project-a-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
https://project-bdl7tbrhh-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
https://project-b-black.vercel.app/callback
https://project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
https://project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app/callback
```

**Important:** 
- Make sure to use `https://` (not `http://`)
- Each URL should end with `/callback`
- Each URL should be on a separate line

### 3. Add Allowed Logout URLs
In the **Allowed Logout URLs** field, make sure you have these URLs (add the missing ones):

```
https://project-b-black.vercel.app
https://project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app
https://project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app
```

**Important:**
- These URLs should NOT have `/callback` at the end
- Use `https://` for all URLs

### 4. Add Allowed Web Origins (if needed)
In the **Allowed Web Origins** field, add:

```
https://project-b-black.vercel.app
https://project-b-git-main-muhammad-muazs-projects-cc9bdaf8.vercel.app
https://project-qczdnu508-muhammad-muazs-projects-cc9bdaf8.vercel.app
```

### 5. Save Changes
Click **Save Changes** at the bottom of the page.

## For Future Deployments

When Vercel creates new preview URLs, you'll need to add them to Auth0. To make this easier, you can use wildcards in Auth0 (if your plan supports it):

**Allowed Callback URLs:**
```
https://project-b-*.vercel.app/callback
https://*.vercel.app/callback
```

**Allowed Logout URLs:**
```
https://project-b-*.vercel.app
https://*.vercel.app
```

**Note:** Wildcards might not be available in all Auth0 plans. If wildcards don't work, add each new URL manually.

## Verification

After saving, wait a few seconds and try accessing your application again. The error should be resolved.

## Common Mistakes to Avoid

❌ **Don't** use `http://` (always use `https://`)
❌ **Don't** forget the `/callback` path for callback URLs
❌ **Don't** add `/callback` to logout URLs
❌ **Don't** use trailing slashes (e.g., `https://domain.vercel.app/`)

✅ **Do** use exact URLs as shown above
✅ **Do** save changes after adding URLs
✅ **Do** wait a few seconds for changes to propagate

