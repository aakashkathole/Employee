// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Alert, BackHandler } from 'react-native';
import Toast from 'react-native-toast-message'; 
import { setTokenExpiredCallback } from "../api/apiClient"; 
import { getToken, getUserData, clearLoginData, saveLoginData } from "../utils/storage";

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

    const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    //  Session Initialization 
    const initializeAuth = async () => {
        try {
            const storedToken = await getToken();
            const storedUserData = await getUserData();

            if (storedToken && storedUserData) {
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
    
    //  Login Action 
    const login = async (token, userData) => { 
        try {
            await saveLoginData(token, userData);
            setToken(token);
            setUserData(userData);
            setIsAuthenticated(true);
            setAuthState(AUTH_STATES.AUTHENTICATED);
            return true;
        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            return false;
        }
    };

    //  Session Expired Handler 
    const handleSessionExpired = useCallback(async (showAlert = true) => {
        await clearLoginData(); 

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
            //  custom toast
            Toast.show({ 
                type: 'customSuccessToast', 
                text1: 'Logged out successfully!', 
                text2: 'Your session is now closed.', 
                position: 'bottom' 
            });
        }
    }, []);

    //  Logout Action 
    const logout = async () => {
        await handleSessionExpired(false);
    };

    //  Effects 
    useEffect(() => {
        setTokenExpiredCallback(handleSessionExpired); 
        initializeAuth();
        return () => setTokenExpiredCallback(null);
    }, [handleSessionExpired]); // handleSessionExpired now safely in deps array

    const contextValue = {
        isAuthenticated,
        token,
        userData,
        authState,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};