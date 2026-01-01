// services/holidayService.js

import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_HOLIDAYS = "/getAllHolidays";

export const fetchHolidays = async () => {
  try {
    const userData = await getUserData();

    if (!userData?.role || !userData?.email) {
      console.warn("Fetch aborted: Missing user credentials.");
      throw new Error("User credentials (role/email) are missing.");
    }

    const response = await apiClient.get(GET_HOLIDAYS, {
      params: {
        role: userData.role,
        email: userData.email,
      },
    });

    return response.data || [];
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown Error";
    console.error(`[HolidayService] Fetch failed: ${errorMessage}`);
    throw error;
  }
};