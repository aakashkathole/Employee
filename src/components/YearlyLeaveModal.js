import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import apiClient from "../api/apiClient";
import { getToken, getUserData } from "../utils/storage";

const MIN_YEAR = 2025;
const MAX_YEAR = 2030;

export default function YearlyLeaveModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [leaveData, setLeaveData] = useState({});
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [pressedYear, setPressedYear] = useState(null);

  const currentYear = new Date().getFullYear();
  const initialYear = (currentYear >= MIN_YEAR && currentYear <= MAX_YEAR) ? currentYear : MIN_YEAR;
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Fetch Leave API
  const fetchYearlyLeave = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const user = await getUserData();

      const response = await apiClient.get(
        `/getLeaveReportByYearByEmpId?role=${user.role}&email=${encodeURIComponent(user.email)}&empId=${user.empId}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeaveData(response.data || {});
    } catch (error) {
      console.log("Yearly Leave API Error:", error.message);
      setLeaveData({});
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (visible) {
      fetchYearlyLeave();
    }
  }, [visible, selectedYear, fetchYearlyLeave]);

  // Total Leaves
  const totalYearlyLeaves = useMemo(() => {
    if (!leaveData || typeof leaveData !== "object") return 0;
    return Object.values(leaveData).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [leaveData]);

  const yearsRange = useMemo(() => {
    let years = [];
    for (let i = MIN_YEAR; i <= MAX_YEAR; i++) years.push(i);
    return years;
  }, []);

  const months = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setLeaveData({});
    setShowYearPicker(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContainer}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.yearDropdown} 
              onPress={() => setShowYearPicker(!showYearPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.title}>Yearly Leave ({selectedYear})</Text>
              <MaterialCommunityIcons 
                name={showYearPicker ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#0B5D69" 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeIcon} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* YEAR PICKER */}
          {showYearPicker && (
            <View style={styles.yearListContainer}>
              <FlatList
                data={yearsRange}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.yearItem, 
                      selectedYear === item && styles.selectedYearItem,
                      pressedYear === item && { transform: [{ scale: 0.95 }] }
                    ]}
                    onPressIn={() => setPressedYear(item)}
                    onPressOut={() => setPressedYear(null)}
                    onPress={() => handleYearSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yearItemText, selectedYear === item && styles.selectedYearText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* SUMMARY CARD */}
          <View style={styles.totalCard}>
            <View style={styles.totalCardContent}>
              <Text style={styles.totalLabel}>Total Leaves</Text>
              <Text style={styles.totalValue}>{totalYearlyLeaves} Days</Text>
              <Text style={styles.totalSubtext}>for the year {selectedYear}</Text>
            </View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={28} color="#ffffff" />
            </View>
          </View>

          {/* CONTENT */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <View style={styles.loaderCircle}>
                <ActivityIndicator size="large" color="#0B5D69" />
              </View>
              <Text style={styles.loadingTitle}>Loading...</Text>
              <Text style={styles.loadingSubtitle}>Fetching leave data for {selectedYear}</Text>
            </View>
          ) : totalYearlyLeaves === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="#0B5D69" />
              </View>
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySubtitle}>There are no leave records for {selectedYear}</Text>
            </View>
          ) : (
            <FlatList
              key={selectedYear}
              data={months}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item: month, index }) => {
                const days = leaveData[month] || 0;
                return (
                  <TouchableOpacity 
                    style={[
                      styles.salaryRow,
                      index === months.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    activeOpacity={days > 0 ? 0.7 : 1}
                    disabled={days === 0}
                  >
                    <View style={styles.monthInfo}>
                      <Text style={styles.monthName}>{month}</Text>
                      <Text style={[
                        styles.amountText, 
                        days === 0 && { fontStyle: 'italic', color: '#999' }
                      ]}>
                        {days === 0 ? "No Record" : `${days} Days`}
                      </Text>
                    </View>

                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: days > 0 ? '#E3F2FD' : '#F5F5F5' }
                    ]}>
                      <MaterialCommunityIcons 
                        name={days > 0 ? "calendar-check" : "clock-outline"} 
                        size={18} 
                        color={days > 0 ? "#2196F3" : "#bdbdbd"} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '85%' },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  yearDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7F8', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  title: { fontSize: 18, fontFamily: "Poppins-Bold", color: "#0B5D69", marginRight: 5 },
  closeIcon: { padding: 6, backgroundColor: '#f5f5f5', borderRadius: 20 },
  yearListContainer: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  yearItem: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginRight: 10, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: 'transparent' },
  selectedYearItem: { backgroundColor: '#0B5D69', elevation: 2, shadowColor: '#0B5D69', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  yearItemText: { fontFamily: 'Poppins-Medium', color: '#666' },
  selectedYearText: { color: '#fff' },
  totalCard: { backgroundColor: "#0B5D69", borderRadius: 16, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#0B5D69', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  totalCardContent: { flex: 1 },
  totalLabel: { color: "#fff", fontFamily: 'Poppins-Regular', fontSize: 13, opacity: 0.9 },
  totalValue: { color: "#fff", fontFamily: 'Poppins-Bold', fontSize: 24 },
  totalSubtext: { color: "#fff", fontFamily: 'Poppins-Regular', fontSize: 11, opacity: 0.8, marginTop: 4 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  loaderContainer: { padding: 40, alignItems: 'center' },
  loaderCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#333', marginTop: 4 },
  loadingSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#999', marginTop: 4 },
  emptyStateContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  salaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 18, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", backgroundColor: '#fff' },
  monthInfo: { flex: 1 },
  monthName: { fontSize: 15, fontFamily: "Poppins-SemiBold", color: "#222", letterSpacing: 0.2 },
  amountText: { fontSize: 14, fontFamily: "Poppins-Medium", color: "#666", marginTop: 2 },
  statusIndicator: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 1 }
});