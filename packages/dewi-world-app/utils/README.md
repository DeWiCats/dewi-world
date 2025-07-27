# Authentication System Documentation

## Overview

The authentication system now uses Zustand state management to persist user sessions locally, eliminating the need for direct Supabase calls throughout the application.

## Architecture

### Session Management

- **Zustand Store**: `useAuthStore` persists user and session data locally using AsyncStorage
- **Auto-sync**: Supabase auth state changes automatically update the Zustand store
- **Token Access**: All API calls retrieve tokens directly from the Zustand store

### Key Benefits

✅ **No direct Supabase calls** in API layers  
✅ **Consistent session state** across all components  
✅ **Offline-ready** authentication state  
✅ **Simplified token management**

## Frontend Authentication

### useAuthStore

The central auth store provides:

```typescript
{
  user: User | null;
  session: Session | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loginWithEmailPassword: (email, password) => Promise<void>;
  registerWithEmailPassword: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  setAuthState: (user, session) => void;
}
```

### API Integration

- `lib/authHelpers.ts` provides simple utilities that read from Zustand store
- `getAuthHeaders()` retrieves Bearer token from stored session
- All API classes use these helpers instead of direct Supabase calls

### Error Handling

- Clear error messages: "Authentication required. Please log in."
- Automatic token refresh when tokens are about to expire
- Graceful fallback to sign-in prompts

## Backend Authentication (Unchanged)

### Middleware

- `middleware/auth.ts` validates JWT tokens with Supabase
- Extracts `user_id` from validated tokens for RLS
- Works with tokens from frontend Zustand store

### Row Level Security (RLS)

- All database operations use authenticated user context
- Conversations and messages filtered by user participation
- Locations filtered by ownership

## Testing Authentication

Debug utilities available in development:

```javascript
// In React Native debugger or dev console
await testAuth(); // Test complete auth flow with stored session
await debugAuthState(); // Debug Zustand store state
```

## Key Changes Made

### ✅ Updated useAuthStore

- Added `session: Session | null` to store type
- Added `setSession` and `setAuthState` actions
- Updated login/register methods to store session data
- Fixed auth state change listener to update both user and session

### ✅ Updated API Layers

- `lib/authHelpers.ts` - Simple utilities using Zustand store
- `lib/messagingAPI.ts` - Uses auth helpers instead of direct Supabase
- `lib/api.ts` - Uses auth helpers instead of direct Supabase
- All `getAuthHeaders()` calls now synchronous (no await needed)

### ✅ Updated Real-time Subscriptions

- Check for valid session before subscribing to Supabase channels
- Graceful fallback when user not authenticated

### ✅ Simplified Testing

- `testAuth()` and `debugAuthState()` use Zustand store
- Easy debugging of stored session state

## Common Issues

1. **"Authentication required" errors**
   - Check if user is signed in: `useAuthStore.getState().user`
   - Verify session exists: `useAuthStore.getState().session`
   - Ensure session has access_token

2. **Session not persisting**
   - Check AsyncStorage permissions
   - Verify Zustand persist configuration
   - Look for auth state change events in logs

3. **Token expiration**
   - System automatically refreshes tokens near expiry
   - Refreshed tokens update Zustand store
   - Manual refresh via `getAuthHeaders()` when needed
