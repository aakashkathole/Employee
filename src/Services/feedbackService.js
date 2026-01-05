import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_FEEDBACK = '/getFeedBackbyEmail';
const CREATE_FEEDBACK = '/createFeedBack';

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

export const createFeedBack = async (payload) => {
  try {
    const userData = await getUserData();
    if (!userData?.role || !userData?.email) throw new Error("Missing role/email");

    const response = await apiClient.post(CREATE_FEEDBACK, {
        ...payload,
        date: new Date().toISOString().split('T')[0],
        status: "New",
      },
      {
        params: { role: userData.role, email: userData.email }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Create Feedback Error:", error.response?.data || error.message);
    throw error;
  }
};