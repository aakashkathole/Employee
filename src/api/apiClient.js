import axios from 'axios';
import { getToken, clearLoginData } from "../utils/storage";
import { Alert, BackHandler } from 'react-native';

let navigationRef = null;

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
      await clearLoginData();

      Alert.alert(
        "Session Expired",
        "Your session has expired. Please login again.",
        [
          {
            text: "Login",
            onPress: () => {
              if (navigationRef) {
                navigationRef.replace("Login");
              }
            },
          },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => BackHandler.exitApp()
          }
        ],
        { cancelable: false }
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
