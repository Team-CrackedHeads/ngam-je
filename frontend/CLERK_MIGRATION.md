# Clerk + Didit Migration Guide

This document outlines the migration from custom JWT authentication to Clerk authentication, with plans for Didit KYC integration.

## What's Been Done ✅

### 1. Clerk SDK Installation
- ✅ Installed `@clerk/nextjs@6.34.1` via bun

### 2. Frontend Changes
- ✅ Wrapped app with `<ClerkProvider>` in `src/app/layout.tsx`
- ✅ Created `ClerkAuthModal` component using Clerk's `<SignIn />` and `<SignUp />` components in a modal
- ✅ Updated `middleware.ts` to use Clerk's middleware for route protection
- ✅ Updated `Header.tsx` to use Clerk's `UserButton`, `useAuth()`, and `useUser()` hooks
- ✅ Created new `clerk-api-client.ts` for API calls with Clerk tokens
- ✅ Auth UI appears as a modal instead of dedicated pages for better UX

### 3. Files Modified
```
frontend/src/app/layout.tsx                        - Added ClerkProvider
frontend/src/components/auth/ClerkAuthModal.tsx    - New modal component for auth
frontend/middleware.ts                             - Clerk middleware for protection
frontend/src/components/layout/Header.tsx          - Uses Clerk components & modal
frontend/src/lib/clerk-api-client.ts               - New API client for Clerk
```

## What You Need To Do 🔧

### 1. Set Up Clerk Account & Environment Variables
1. Go to https://clerk.com and create a free account
2. Create a new application
3. Copy your API keys from the Clerk dashboard
4. Add to `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

**Note:** Sign-in/sign-up are now modals, not dedicated pages, so no URL configuration needed!

### 2. Test the Frontend
```bash
cd frontend
bun run dev
```

Visit http://localhost:3000 and:
- Click "Login" → should open a modal with Clerk UI
- Try signing up → creates account in Clerk (switch to sign-up within the modal)
- After login → modal closes and you see `UserButton` in header with your avatar

### 3. Update Components Using Old Auth

Search for and update components that still use the old `AuthContext`:

```bash
# Find files using old auth
cd frontend
grep -r "useAuth" src/ --include="*.tsx" --include="*.ts" | grep -v "clerk"
grep -r "AuthProvider" src/ --include="*.tsx" --include="*.ts"
grep -r "ProtectedRoute" src/ --include="*.tsx" --include="*.ts"
```

Replace:
```tsx
// OLD
import { useAuth } from '@/contexts/AuthContext';
const { isAuthenticated, user } = useAuth();

// NEW
import { useAuth, useUser } from '@clerk/nextjs';
const { isSignedIn } = useAuth();
const { user } = useUser();
```

### 4. Update Components Using Old API Client

Replace old `apiClient` with new `useClerkApiClient`:

```tsx
// OLD
import { apiClient } from '@/lib/api-client';
const data = await apiClient.get('/api/v1/endpoint');

// NEW
import { useClerkApiClient } from '@/lib/clerk-api-client';
const getApiClient = useClerkApiClient();
const client = await getApiClient();
const data = await client.get('/api/v1/endpoint');
```

### 5. Backend Integration (CRITICAL)

Your FastAPI backend currently validates custom JWT tokens. You need to update it to validate Clerk tokens.

**Option A: Use Clerk's Backend SDK (Recommended)**

Install Clerk's Python SDK:
```bash
cd backend
uv pip install clerk-backend-api
```

Update your auth dependency in `backend/src/app/api/deps.py`:
```python
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

async def get_current_user(
    authorization: str = Header(None)
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    try:
        # Verify Clerk token
        user = await clerk.users.get_user(token)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Option B: Manually Verify Clerk JWT**

Clerk tokens are standard JWTs. You can verify them using PyJWT:

```python
import jwt
import requests
from functools import lru_cache

@lru_cache()
def get_clerk_jwks():
    """Fetch Clerk's public keys for JWT verification"""
    response = requests.get("https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json")
    return response.json()

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")

    try:
        jwks = get_clerk_jwks()
        # Verify JWT with Clerk's public key
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience="your-audience"  # Check Clerk dashboard
        )

        # Extract user info from token
        user_id = payload.get("sub")
        # Fetch or create user in your database
        return {"id": user_id, "email": payload.get("email")}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

Add to backend `.env`:
```bash
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

## Files That Can Be Removed (After Migration Complete) 🗑️

Once everything is working with Clerk:

```
frontend/src/contexts/AuthContext.tsx          - Old custom auth context
frontend/src/components/auth/LoginModal.tsx    - Old login modal
frontend/src/components/auth/SignupModal.tsx   - Old signup modal
frontend/src/components/auth/ProtectedRoute.tsx - Old route protection
frontend/src/lib/auth-token.ts                 - Old token storage
frontend/src/lib/api-client.ts                 - Old API client (keep if needed for non-auth calls)

backend/src/app/api/v1/endpoints/auth.py       - Old auth endpoints
backend/src/app/services/auth_service.py       - Old auth service
backend/src/app/core/security.py               - Old JWT/password utilities (unless used elsewhere)
```

## Didit KYC Integration (Future) 🔮

Once Clerk auth is working, you can integrate Didit for KYC:

### Flow:
1. User signs up/logs in via Clerk ✅ (Auth complete)
2. User needs verification → Create Didit KYC session
3. Redirect user to Didit URL (or embed in iframe)
4. Didit sends webhook when verification completes
5. Backend updates user record with `kyc_verified: true`

### Implementation:
```typescript
// Add to your user flow
import { useAuth } from '@clerk/nextjs';

function RequestKYC() {
  const { userId } = useAuth();

  const startKYC = async () => {
    // Call your backend to create Didit session
    const { verification_url } = await fetch('/api/v1/kyc/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).then(r => r.json());

    // Redirect to Didit
    window.location.href = verification_url;
  };

  return <button onClick={startKYC}>Verify Identity</button>;
}
```

Backend endpoint:
```python
# backend/src/app/api/v1/endpoints/kyc.py
from didit import DiditClient

@router.post("/kyc/start")
async def start_kyc(user: dict = Depends(get_current_user)):
    didit = DiditClient(api_key=os.getenv("DIDIT_API_KEY"))

    # Create verification session
    session = didit.create_session(
        user_id=user["id"],
        workflow_id="your-workflow-id",
        redirect_url="https://yourapp.com/kyc/complete"
    )

    return {"verification_url": session.url}

@router.post("/kyc/webhook")
async def kyc_webhook(request: Request):
    # Receive Didit webhook
    payload = await request.json()

    if payload["status"] == "approved":
        # Update user in database
        await update_user_kyc_status(payload["user_id"], verified=True)

    return {"success": True}
```

## Testing Checklist ✓

- [ ] Sign up with Clerk works
- [ ] Sign in with Clerk works
- [ ] User avatar shows in header
- [ ] Protected routes redirect to sign-in
- [ ] API calls include Clerk token
- [ ] Backend validates Clerk tokens
- [ ] User data syncs between Clerk and your database
- [ ] Sign out works

## Questions?

- Clerk Docs: https://clerk.com/docs
- Didit Docs: https://docs.didit.me
- This branch: `experiment/clerk-didit-auth`

## Rollback Plan 🔄

If you need to rollback:
```bash
git checkout feat/backend/auth-infrastructure
```

All old auth code is intact on the original branch!
