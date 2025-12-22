// services/leaveService.js

import apiClient from "../api/apiClient";
import { getUserData } from '../utils/storage';

// --- ENDPOINT CONFIGURATION ---
const LEAVE_SUMMARY_ENDPOINT = '/getLeaveSummary';
const GET_ALL_LEAVES_ENDPOINT = '/getAllLeavesByEmployeeId';

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

// fetch all leave applications using empID, role, and email
export const fetchAllLeavesByEmployeeId = async () => {
    try {
        const userData = await getUserData();

        // validate required data
        if (!userData || !userData.empId || !userData.role || !userData.email) {
            throw new Error("Missing user data required to fetch leave history.");
        }

        // query parameters
        const params = {
            empID: userData.id,
            role: userData.role,
            email: userData.email,
        };

        // pass params URL
        const response = await apiClient.get(GET_ALL_LEAVES_ENDPOINT, { 
            params 
        });

        return response.data;

    } catch (error) {
        console.error("Error fetching leave history:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};