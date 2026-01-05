import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_FEEDBACK = '/getFeedBackbyEmail';

export const getFeedBack = async () => {
    try {
        const userData = await getUserData();

        // validation 
        if (!userData?.role || !userData?.email) {
            console.warn("Fetch aborted: Missing user credentials.");
            throw new Error("User credentials (role/email) are missing.");
        }

        // params
        const response = await apiClient.get(GET_FEEDBACK, {
            params: {
                role: userData.role,
                email: userData.email,
            }
        });

        return response.data;

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Unknown Error";
        console.error(`[FeedbackService] Fetch failed: ${errorMessage}`);
        throw error;
    }
};