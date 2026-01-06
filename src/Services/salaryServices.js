// services/salaryService.js

import apiClient from "../api/apiClient";
import { getUserData } from "../utils/storage";

const GET_SALARY_BY_EMP_ID_ENDPOINT = "/getAllSalariesByEmpId";

export const fetchSalaries = async ({ month, year } = {}) => {
  try {
    const userData = await getUserData();

    if (!userData?.empId || !userData?.role || !userData?.email) {
      throw new Error("Missing user data required to fetch salary");
    }

    const params = {
      role: userData.role,
      email: userData.email,
      empId: userData.empId,
    };

    if (month && year) {
      params.month = month;
      params.year = year;
    }

    const response = await apiClient.get(
      GET_SALARY_BY_EMP_ID_ENDPOINT,
      { params }
    );

    return response.data?.content || [];

  } catch (error) {
    console.error(
      "Error fetching salary:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
