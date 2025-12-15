import React, { createContext, useContext, useState, useEffect } from "react";
import { getDashboardData } from "../Services/dashboardService";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async (token, empId) => {
    try {
      const res = await getDashboardData(token, empId);
      setDashboardData(res.data);
    } catch (err) {
      console.log("DashboardContext Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{ dashboardData, loading, loadDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

// 👇 This MUST exist!
export const useDashboard = () => useContext(DashboardContext);
