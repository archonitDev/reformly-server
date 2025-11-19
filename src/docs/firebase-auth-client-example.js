// Example client-side code for handling Firebase authentication
// This demonstrates how to properly use the tokens from your server

// Import Firebase
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'prometheus-e8695.firebaseapp.com',
  projectId: 'prometheus-e8695',
  storageBucket: 'prometheus-e8695.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// API service
const API_URL = 'http://localhost:3000';

const apiService = {
  // Function to make authenticated API requests
  async apiRequest(endpoint, options = {}) {
    // Get current ID token
    const currentUser = auth.currentUser;
    let idToken = '';

    if (currentUser) {
      // Always get a fresh token to avoid expiration issues
      idToken = await currentUser.getIdToken(true);
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    };

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  },

  // OTP Authentication
  async requestOtp(email) {
    return fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((res) => res.json());
  },

  async verifyOtp(email, code) {
    // 1. First verify OTP with your backend
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    }).then((res) => res.json());

    // 2. Important! Exchange the custom token for an ID token
    if (response.firebaseToken) {
      try {
        // Sign in to Firebase with the custom token
        const userCredential = await signInWithCustomToken(
          auth,
          response.firebaseToken,
        );

        // Get the ID token - this is what you'll use for API calls
        const idToken = await userCredential.user.getIdToken();

        // Store the user info
        const user = response.user;

        // Return both tokens for the app to use
        return {
          user,
          idToken, // Use this for API calls
          accessToken: response.accessToken, // Your server's JWT
          refreshToken: response.refreshToken, // Your server's refresh token
        };
      } catch (error) {
        console.error('Error exchanging custom token:', error);
        throw error;
      }
    } else {
      throw new Error('No Firebase token received from server');
    }
  },

  // Google Authentication
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      // 1. Sign in with Google via Firebase popup
      const result = await signInWithPopup(auth, provider);

      // 2. Get the ID token
      const idToken = await result.user.getIdToken();

      // 3. Send the ID token to your backend
      const response = await fetch(`${API_URL}/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }).then((res) => res.json());

      // 4. Store the user info and continue using the ID token
      return {
        user: response.user,
        idToken, // Continue using this same ID token for API calls
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    return this.apiRequest('users/me');
  },

  // Sign out
  async signOut() {
    await auth.signOut();
    // Also call your backend logout endpoint if needed
  },
};

export default apiService;
