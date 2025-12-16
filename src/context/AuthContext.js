// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Although we use utility functions, good to keep
import { Alert, BackHandler } from 'react-native';
import Toast from 'react-native-toast-message'; 
import { setTokenExpiredCallback } from "../api/apiClient"; 
import { getToken, getUserData, clearLoginData, saveLoginData } from "../utils/storage"; // Your storage utilities

export const AuthContext = createContext();

export const AUTH_STATES = {
    LOADING: 'LOADING',
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    AUTHENTICATED: 'AUTHENTICATED',
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}) => {
    // --- 1. State Management (The Missing Pieces) ---
    const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    // --- 2. Session Initialization (Runs on App Startup) ---
    const initializeAuth = async () => {
        try {
            const storedToken = await getToken();
            const storedUserData = await getUserData();

            if (storedToken && storedUserData) {
                // Assuming the token is still valid (server will confirm on first API call)
                setToken(storedToken);
                setUserData(storedUserData);
                setIsAuthenticated(true);
                setAuthState(AUTH_STATES.AUTHENTICATED);
                console.log("Session restored on startup.");
            } else {
                setAuthState(AUTH_STATES.UNAUTHENTICATED);
            }
        } catch (error) {
            console.error("Auth initialization failed:", error);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
        }
    };
    
    // --- 3. Login Action ---
    const login = async (token, userData) => { 
    try {
        
        await saveLoginData(token, userData); // Use your utility function

        setToken(token);
        setUserData(userData); // Use userData instead of 'user'
        setIsAuthenticated(true);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        Toast.show({ type: 'success', text1: 'Login Successful', position: 'bottom' });
        return true;
    } catch (error) {
        console.error("Login failed in AuthContext:", error);
        return false;
    }
};

    // --- 4. Session Expired/Logout Handler (The Core Logic) ---
    const handleSessionExpired = async (showAlert = true) => {
        // Use your utility function to clear storage
        await clearLoginData(); 

        // Reset Context State
        setToken(null);
        setUserData(null);
        setIsAuthenticated(false);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        
        console.warn('Session ended. Context state reset.');

        if (showAlert) {
            Alert.alert(
                "Session Expired",
                "Your session has expired. Please login again.",
                [
                    { text: "Login", onPress: () => { /* Navigation handled by RootNavigator */ } },
                    { text: "Exit", style: "destructive", onPress: () => BackHandler.exitApp() }
                ],
                { cancelable: false }
            );
        } else {
             Toast.show({ type: 'success', text1: 'Logged out successfully!', text2: 'Your session is now closed.', position: 'bottom' });
        }
    };

    // --- 5. Logout Action (Manual User Logout) ---
    const logout = async () => {
        await handleSessionExpired(false); // Do not show the "expired" alert for a manual logout
    };


    // --- 6. Effects (Linking to Axios and Startup) ---
    useEffect(() => {
        // Link to Axios 401 Interceptor
        setTokenExpiredCallback(handleSessionExpired); 
        
        // Check for existing session on mount
        initializeAuth();
        
        return () => setTokenExpiredCallback(null);
    }, []);

    const contextValue = {
        isAuthenticated,
        token,
        userData,
        authState,
        login,
        logout,
        // Add other properties you might need
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};