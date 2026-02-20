import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_FEEDBACK = '/getFeedBackbyEmail';
const CREATE_FEEDBACK = '/createFeedBack';
const DELETE_FEEDBACK = '/deleteFeedBack';
const UPDATE_FEEDBACK = '/updateFeedBack';

export const getFeedBack = async () => {
    try {
        const userData = await getUserData();

        if (!userData?.role || !userData?.email) {
            console.warn("Fetch aborted: Missing user credentials.");
            throw new Error("User credentials (role/email) are missing.");
        }

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

        if (!userData?.role || !userData?.email) {
            throw new Error("User credentials (role/email) are missing.");
        }

        if (!payload?.name || !payload?.subject || !payload?.department || !payload?.description) {
            throw new Error("Required feedback fields are missing.");
        }

        const response = await apiClient.post(
            CREATE_FEEDBACK,
            {
                ...payload,
                date: new Date().toISOString().split('T')[0],
                status: "New",
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
            "Failed to submit feedback.";

        console.error("[FeedbackService] Create failed:", message);
        throw new Error(message);
    }
};

export const deleteFeedBack = async (feedbackId) => {
    try {
        const userData = await getUserData();

        if (!userData?.role || !userData?.email) {
            throw new Error("User credentials (role/email) are missing.");
        }

        if (!feedbackId) {
            throw new Error("Feedback ID is required.");
        }

        const response = await apiClient.delete(
            `${DELETE_FEEDBACK}/${feedbackId}`,
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
            "Failed to delete feedback.";

        console.error("[FeedbackService] Delete failed:", message);
        throw new Error(message);
    }
};

export const updateFeedBack = async (feedbackId, payload) => {
    try {
        const userData = await getUserData();

        if (!userData?.role || !userData?.email) {
            throw new Error("User credentials (role/email) are missing.");
        }

        if (!feedbackId || !payload) {
            throw new Error("Feedback ID and payload are required.");
        }

        const response = await apiClient.put(
            `${UPDATE_FEEDBACK}/${feedbackId}`,
            {
                name: payload.name,
                department: payload.department,
                subject: payload.subject,
                description: payload.description,
                remark: payload.remark,
                date: payload.date,
                status: payload.status,
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
            "Failed to update feedback.";

        console.error("[FeedbackService] Update failed:", message);
        throw new Error(message);
    }
};