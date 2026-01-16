import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import apiClient from "../api/apiClient";
import { getToken, getUserData } from "../utils/storage";

export default function MonthlyAttendanceModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch monthly attendance
  const fetchAttendance = useCallback(async () => {
    try {
      console.log("Fetching Attendance:", month, year);

      const token = await getToken();
      const user = await getUserData();

      const response = await apiClient.get(
        `/getMonthlyAttendaceByEmpId?role=${user.role}&email=${encodeURIComponent(
          user.email
        )}&empId=${user.empId}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);
      setAttendanceData(response.data || {});
    } catch (error) {
      console.log("Monthly Attendance Error:", error.message);
      setAttendanceData({});
    } finally {
      setLoading(false); // stop loader after API
    }
  }, [month, year]);

  useEffect(() => {
    if (visible) {
      setLoading(true); // show loader when modal opens
      fetchAttendance();
    }
  }, [visible, fetchAttendance]);

  // calandar style
  const customDatesStyles = useMemo(() => {
    return Object.keys(attendanceData)
      .filter(dateStr => attendanceData[dateStr] !== null)
      .map(dateStr => {
        const [y, m, d] = dateStr.split("-");
        return {
          date: new Date(+y, +m - 1, +d),
          style: {
            backgroundColor: "#4CAF50",
            borderRadius: 8,
          },
          textStyle: {
            color: "#fff",
            fontWeight: "600",
          },
        };
      });
  }, [attendanceData]);

  const presentCount = Object.values(attendanceData).filter(v => v !== null)
    .length;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Monthly Attendance</Text>
            <TouchableOpacity onPress={onClose}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="close" size={24} />
                </View>
            </TouchableOpacity>
          </View>

          {/* SUMMARY */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
                <View style={styles.cardContent}>
                    <View>
                        <Text style={styles.summaryLabel}>Days at Work</Text>
                        <Text style={styles.summaryValue}>{presentCount}</Text>
                    </View>
                    <View style={styles.summaryIcon}>
                        <MaterialCommunityIcons name="account-check-outline" size={24} color="#ffffff" />
                    </View>
                </View>
            </View>
        </View>

          {/* CALENDAR */}
          <View style={{ minHeight: 360 }}>
            <CalendarPicker
              key={`${month}-${year}`} //  force clean render
              initialDate={new Date(year, month - 1, 1)}
              customDatesStyles={customDatesStyles}
              onMonthChange={date => {
                const m = date.getMonth() + 1;
                const y = date.getFullYear();
                console.log("Selected Month/Year:", m, y);

                setLoading(true);
                setMonth(m);
                setYear(y);
              }}
              dayShape="circle"
              todayBackgroundColor="#1e90ff"
              todayTextStyle={{ color: "#fff" }}
              maxDate={new Date()}
            />

            {/* LOADER OVER CALENDAR */}
            {loading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>

          {/* EMPTY STATE */}
          {!loading && Object.keys(attendanceData).length === 0 && (
            <Text style={{ textAlign: "center", fontFamily: 'Poppins-Regular', marginTop: 8, color: "#999" }}>
              No attendance recorded for this month
            </Text>
          )}

          {/* LEGEND */}
          <View style={styles.legend}>
            <Text style={styles.legendItem}>🟢 Present</Text>
            <Text style={styles.legendItem}>🔵 Today</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontFamily: "Poppins-SemiBold", },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  summaryRow: { marginBottom: 16, width: "100%", },
  summaryCard: { backgroundColor: "#4CAF50", borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
  cardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", },
  summaryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', },
  summaryLabel: { color: "#fff", fontSize: 13, fontFamily: 'Poppins-Regular', marginBottom: 4, },
  summaryValue: { color: "#fff", fontSize: 22, fontFamily: 'Poppins-SemiBold', letterSpacing: 0.5, },
  legend: { flexDirection: "row", justifyContent: "space-around", marginTop: 12, },
  legendItem: { fontSize: 13, },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", zIndex: 10, },
});
