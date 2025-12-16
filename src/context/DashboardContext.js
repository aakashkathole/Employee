import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getDashboardData } from "../Services/dashboardService";
import { useAuth, AUTH_STATES } from "./AuthContext";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

  const { isAuthenticated, authState } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {

    if (!isAuthenticated) {
      setDashboardData(null);
      setLoading(false);
      console.warn("Dashboard load skipped: User is not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.log("DashboardContext Error:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
        // Only call loadDashboard when the Auth state confirms the user is logged in
        if (authState === AUTH_STATES.AUTHENTICATED) {
            loadDashboard();
        } 
        
        // If the user logs out (state changes to UNAUTHENTICATED), reset data
        if (authState === AUTH_STATES.UNAUTHENTICATED) {
            setDashboardData(null);
            setLoading(false); 
        }
        
    },[authState, loadDashboard]);

  return (
    <DashboardContext.Provider value={{ dashboardData, loading, reload: loadDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
