// services/queryService.js
import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_ALL_QUERIES = '/getAllEmpQueries';
const CREATE_New_QUERY = '/createEmpQuery';

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

export const createNewQuery = async (queryData) => {
    try {
        const userData = await getUserData();

        // Validate user credentials
        if (!userData?.role || !userData?.email) {
            throw new Error("User credentials (role/email) are missing.");
        }

        // Validate query text
        if (!queryData?.query) {
            throw new Error("Query text is required.");
        }

        const response = await apiClient.post(
            CREATE_New_QUERY,
            {
                query: queryData.query,
            },
            {
                params: {
                    role: userData.role,
                    email: userData.email,
                }
            }
        );

        return response.data;

    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to submit query.";

        console.error("[QueryService] Create failed:", message);
        throw new Error(message);
    }
};