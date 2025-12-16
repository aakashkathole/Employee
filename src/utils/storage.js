import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';


// Save both token + user data after login

export const saveLoginData = async (token, userData) => {
    try {
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
        console.error("Error saving login data:", error);
    }
};


// Get stored token

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem("authToken");
    } catch (error) {
        console.error("Error getting token:", error);
        return null;
    }
};


// Get stored user data

export const getUserData = async () => {
    try {
        const user = await AsyncStorage.getItem("userData");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
};


// Clear both token + user data

export const clearLoginData = async () => {
    try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userData");
    } catch (error) {
        console.error("Error clearing data:", error);
    }
};