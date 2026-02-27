import apiClient from "../api/apiClient";
import { getUserData} from "../utils/storage";

const GET_upcomingEmpBirthdays = '/upcomingEmployeeBirthdays';

export const getBirthdays = async () => {
    try{
        const userData = await getUserData();

        if (!userData?.branchCode) {
            console.warn("Fetch aborted: Missing user credentials.");
            throw new Error("User credentials (branchCode) are missing.");
        }

        const response = await apiClient.get(GET_upcomingEmpBirthdays, {
            params: {
                branchCode: userData.branchCode
            }
        });

        return response.data;
    } catch (error) {
        const errorMessage =error.response?.data?.message || error.message || "Unknown Error";
        console.error(`[NotificationService] Fetch failed: ${errorMessage}`);
        throw error;
    }
};