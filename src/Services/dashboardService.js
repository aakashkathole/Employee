import apiClient from "../api/apiClient";
import { getToken, getUserData } from "../utils/storage";

export const getDashboardData = async () => {
  try {
    const token = await getToken();
    const user = await getUserData();

    if (!token) {
      throw new Error("Token not found in storage");
    }

    // needs userId/email/role — extract them
    const userId = user.empId;
    const email = user.email;
    const role = user.role;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log(" Dashboard: Sending token + user details");

    const response = await apiClient.get(
      `/getEmployeeById/${user.empId}?role=${user.role}&email=${encodeURIComponent(user.email)}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.log(" Dashboard API Error:", error.response?.data || error.message);
    throw error;
  }
};
