// services/memoService.js

import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_MEMO = '/getAllMemos';

export const fetchMemo = async () => {
    try {
        const userData = await getUserData();

        // Validation necessary identifiers
        if (!userData?.role || !userData?.email) {
            console.warn("Fetch aborted: Missing user credentials.");
            throw new Error("User credentials (role/email) are missing.");
        }

        // Request params
        const response = await apiClient.get(GET_MEMO, {
            params: {
                role: userData.role,
                email: userData.email,
            }
        });

        // Return data 
        return response.data.content || [];

    } catch (error) {
        // Detailed logging for debugging
        const errorMessage = error.response?.data?.message || error.message || "Unknown Error";
        console.error(`[QueryService] Fetch failed: ${errorMessage}`);
        
        throw error; // Rethrow so the UI layer can catch it
    }
};