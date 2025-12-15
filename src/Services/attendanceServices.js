// Services/attendanceServices.js

// 1. Import necessary dependencies
import apiClient from '../api/apiClient'; // ✅ CORRECT PATH to your Axios instance
import { getUserData } from '../utils/storage'; // Assuming getUserData is here or in storage.js

// --- ENDPOINT CONFIGURATION ---
const ATTENDANCE_HISTORY_ENDPOINT = '/getAttendanceByEmpId';
const BREAK_IN_ENDPOINT = '/employeeBreakIn';
const BREAK_OUT_ENDPOINT = '/employeeBreakOut';
const MARK_ATTENDANCE_ENDPOINT = '/markAttendanceForEmployee';


// --- HELPER: BUILD IMAGE PAYLOAD (FormData) ---

/**
 * Builds the FormData payload required for attendance actions with image upload.
 */
const buildAttendanceFormData = async (actionType, localImagePath) => {
    // NOTE: If getUserData is in utils/storage, change the import above.
    const userData = await getUserData(); 

    if (!userData || !userData.email || !userData.branchCode) {
        throw new Error("Missing user data (email or branchCode) for attendance action.");
    }

    const formData = new FormData();

    // Append standard fields
    formData.append('email', userData.email);
    formData.append('branchCode', userData.branchCode);

    // Append the action type if using the general MARK_ATTENDANCE_ENDPOINT
    if (actionType === 'Check In' || actionType === 'Check Out') {
        formData.append('action', actionType.replace(' ', '')); 
    }

    // Append the image file data
    if (localImagePath) {
        formData.append('image', {
            uri: localImagePath,
            name: `${userData.email}_${actionType}.jpeg`,
            type: 'image/jpeg',
        });
    }

    return formData;
};


// --- 1. ATTENDANCE HISTORY SERVICE ---

/**
 * Fetches attendance history using a specific timeframe filter (GET request).
 */
export const fetchAttendanceRecords = async (timeFrame, page = 0, size = 10) => {
    try {
        const userData = await getUserData();

        if (!userData || !userData.empId || !userData.role || !userData.email) {
            throw new Error("Missing user data required for API call.");
        }

        const params = {
            empId: userData.empId,
            role: userData.role,
            email: userData.email,
            timeFrame: timeFrame,
            page: page,
            size: size,
        };

        // Use the imported apiClient here
        const response = await apiClient.get(ATTENDANCE_HISTORY_ENDPOINT, { params });
        return response.data;

    } catch (error) {
        console.error("Error fetching attendance records:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- 2. QUICK ACTIONS SERVICE (POST Request) ---

/**
 * Logs an attendance action (Check In, Break Start, Break End, Check Out) with image data.
 */
export const logAttendanceAction = async (actionType, localImagePath) => {
    let actionEndpoint;

    if (actionType === 'Break Start') {
        actionEndpoint = BREAK_IN_ENDPOINT;
    } else if (actionType === 'Break End') {
        actionEndpoint = BREAK_OUT_ENDPOINT;
    } else {
        actionEndpoint = MARK_ATTENDANCE_ENDPOINT;
    }

    try {
        const formData = await buildAttendanceFormData(actionType, localImagePath);

        // Use the imported apiClient here
        const response = await apiClient.post(actionEndpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', 
            },
        });
        return response.data;

    } catch (error) {
        console.error(`Error logging ${actionType}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};