import axios from 'axios';
import { getToken, clearLoginData } from "../utils/storage";
import { Alert, BackHandler } from 'react-native';

let navigationRef = null;

// globally variable callback
let tokenExpiredCallback = null;

// function for AuthProvider to set callback
export const setTokenExpiredCallback = (callback) => {
  tokenExpiredCallback = callback;
};

// Allow setting navigation from App.js
export const setNavigation = (nav) => {
  navigationRef = nav;
};

const apiClient = axios.create({
  baseURL: 'https://pjsofttech.in:59443/',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 GLOBAL ERROR HANDLER (Industry Standard)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    // 401 means token expired or invalid
    if (status === 401) {
      // 💡 DELEGATE: Call the handler provided by the AuthContext
      if (tokenExpiredCallback) {
        // Pass 'true' to signal the context to show the alert
        tokenExpiredCallback(true); 
      } else {
        // Fallback or just log an error if context isn't ready
        console.error("401 Unauthorized received, but AuthContext handler is missing.");
        // Optional: If you must have a fallback, keep a minimal alert/exit here.
      }
      
      // IMPORTANT: DO NOT execute clearLoginData() or navigation logic here.
      // The tokenExpiredCallback in the AuthContext handles all of that.
    }

    // Always reject the promise so the calling code can catch the error locally if needed
    return Promise.reject(error);
  }
);

export default apiClient;
