# Quick Guide: Backend Logout URL Location

## 📍 Exact Location in Auth0 Dashboard

Screenshot me jo field dikh raha hai, usi me add karna hai!

### Step-by-Step:

1. **Screenshot me "OpenID Connect Back-Channel Logout" section dekho**
   - Yeh section "Application URIs" ke just neeche hai

2. **"Back-Channel Logout URL:" field me ye URL add karo:**
   ```
   https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback
   ```

3. **Current value (jo screenshot me hai):**
   - Abhi: `https://my-app.com/logout`
   - **Replace karo** ya **update karo** is value se:
   ```
   https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback
   ```

4. **"Back-Channel Logout Session Required" toggle:**
   - Isko **OFF** rakho (currently OFF hai, theek hai)

5. **Bottom me "Save Changes" button click karo**

## Visual Guide:

```
┌─────────────────────────────────────────────────┐
│ Application URIs                                │
│ - Allowed Callback URLs                         │
│ - Allowed Web Origins                           │
│ - Allowed Logout URLs                           │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ OpenID Connect Back-Channel Logout             │
│                                                 │
│ Back-Channel Logout URL:                        │
│ [https://my-app.com/logout]  ← Isme URL add karo│
│                                                 │
│ Back-Channel Logout Session Required: [OFF]    │
└─────────────────────────────────────────────────┘
```

## Exact Field Location:

**Section Name:** `OpenID Connect Back-Channel Logout`

**Field Name:** `Back-Channel Logout URL:`

**Current Value:** `https://my-app.com/logout` (screenshot me)

**New Value:** `https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback`

## Important Notes:

✅ **Ye field "Allowed Callback URLs" se alag hai**  
✅ **Ye field "Allowed Logout URLs" se alag hai**  
✅ **Ye specifically "Back-Channel Logout URL" field hai**  
✅ **Screenshot me jo field dikh raha hai, wahi sahi hai**

## Final Steps:

1. Screenshot me jo field hai, usme click karo
2. Current value (`https://my-app.com/logout`) ko replace karo
3. New URL paste karo: `https://dynamicpricing-api.dynamicpricingbuilder.com/api/auth/logout-callback`
4. "Save Changes" button click karo (bottom right corner me hai)
5. Done! ✅

