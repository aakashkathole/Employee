// services/queryService.js
import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_ALL_QUERIES = '/getAllEmpQueries';

export const fetchAllQueries = async () => {
    try {
        const userData = await getUserData();

        // Validation necessary identifiers
        if (!userData?.role || !userData?.email) {
            console.warn("Fetch aborted: Missing user credentials.");
            throw new Error("User credentials (role/email) are missing.");
        }

        // Request params
        const response = await apiClient.get(GET_ALL_QUERIES, {
            params: {
                role: userData.role,
                email: userData.email,
            }
        });

        // Return data 
        return response.data;

    } catch (error) {
        // Detailed logging for debugging
        const errorMessage = error.response?.data?.message || error.message || "Unknown Error";
        console.error(`[QueryService] Fetch failed: ${errorMessage}`);
        
        throw error; // Rethrow so the UI layer can catch it
    }
};