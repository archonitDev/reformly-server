# Firebase Authentication Guide

This guide explains how to properly use Firebase authentication with the Prometheus server API.

## Understanding the Token Types

There are two main token types when working with Firebase:

1. **Custom Token**: Created by your server, this token cannot be used directly for API authentication. It's only meant for exchange with Firebase to get an ID token.

2. **ID Token**: This is what you actually need for API authentication. It's created by Firebase after you authenticate with a custom token or directly with Firebase Auth providers (Google, Apple, etc).

## Authentication Flows

### Email OTP Authentication Flow

1. **Request OTP** - `POST /auth/request-otp`

   - Send user's email
   - Server generates and sends OTP

2. **Verify OTP** - `POST /auth/verify-otp`

   - Server validates OTP
   - If valid, server creates/retrieves user and returns a **Custom Firebase Token**

3. **Exchange Custom Token for ID Token**

   ```javascript
   // Client side
   const userCredential = await signInWithCustomToken(auth, customToken);
   const idToken = await userCredential.user.getIdToken();
   ```

4. **Use the ID Token for API requests**
   ```javascript
   fetch('/api/endpoint', {
     headers: {
       Authorization: `Bearer ${idToken}`,
     },
   });
   ```

### Google/Apple Authentication Flow

1. **Authenticate with Provider** - (Client-side)

   - Use Firebase Auth UI or SDK to sign in with Google/Apple
   - Get the ID token directly from Firebase

2. **Authenticate with Backend** - `POST /auth/firebase`

   - Send the ID token to your server
   - Server verifies and creates/retrieves user

3. **Use the same ID Token for API requests**
   ```javascript
   fetch('/api/endpoint', {
     headers: {
       Authorization: `Bearer ${idToken}`,
     },
   });
   ```

## Troubleshooting

If you're getting "Invalid Firebase token" errors:

1. **Check the token type** - Make sure you're using an ID token, not a custom token
2. **Token freshness** - Firebase tokens expire, always get a fresh token before API calls
3. **Token format** - Use proper "Bearer" prefix in the Authorization header

## Example Client Implementation

See the `firebase-auth-client-example.js` file for a complete client-side authentication implementation.

## Token Refresh

Firebase ID tokens expire after 1 hour. Always get a fresh token before making important API calls:

```javascript
// Refresh token
const freshToken = await auth.currentUser.getIdToken(true);
```
