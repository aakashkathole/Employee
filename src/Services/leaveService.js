// services/leaveService.js

import apiClient from "../api/apiClient";
import { getUserData } from '../utils/storage';

// --- ENDPOINT CONFIGURATION ---
const LEAVE_SUMMARY_ENDPOINT = '/getLeaveSummary';

export const fetchLeaveSummary = async () => {
    try {
        const userData = await getUserData();

        // Validate data just like your attendance service
        if (!userData || !userData.empId || !userData.role || !userData.email) {
            throw new Error("Missing user data required for Leave Summary.");
        }

        // Construct Query Parameters (Payload)
        const params = {
            role: userData.role,
            email: userData.email,
        };

        // Note: We append the empId (e.g., /1) to the base endpoint
        const response = await apiClient.get(`${LEAVE_SUMMARY_ENDPOINT}/${userData.empId}`, { 
            params 
        });

        return response.data;

    } catch (error) {
        console.error("Error fetching leave summary:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};