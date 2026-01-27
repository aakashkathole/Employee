import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList, TouchableWithoutFeedback } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import apiClient from "../api/apiClient";
import { getToken, getUserData } from "../utils/storage";

const MIN_YEAR = 2025;
const MAX_YEAR = 2030;

export default function YearlySalaryModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [salaryData, setSalaryData] = useState({});
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [pressedYear, setPressedYear] = useState(null);
  
  // Initialize with current year if within range, else default to 2025
  const currentYear = new Date().getFullYear();
  const initialYear = (currentYear >= MIN_YEAR && currentYear <= MAX_YEAR) ? currentYear : MIN_YEAR;
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const fetchYearlySalary = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const user = await getUserData();

      // Using your provided endpoint and query parameters
      const response = await apiClient.get(
        `/getSalariesOfMonthByYear?role=${user.role}&email=${encodeURIComponent(user.email)}&empId=${user.empId}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSalaryData(response.data || {});
    } catch (error) {
      console.log("Yearly Salary API Error:", error.message);
      setSalaryData({});
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (visible) {
      fetchYearlySalary();
    }
  }, [visible, fetchYearlySalary]);

  // Sum up all monthly values for the year
  const totalYearly = useMemo(() => {
    return Object.values(salaryData).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [salaryData]);

  const yearsRange = useMemo(() => {
    let years = [];
    for (let i = MIN_YEAR; i <= MAX_YEAR; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const months = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
          
          {/* HEADER SECTION */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.yearDropdown} 
              onPress={() => setShowYearPicker(!showYearPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.title}>Yearly Salary ({selectedYear})</Text>
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

          {/* YEAR SELECTION LIST (Horizontal) */}
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

          {/* EARNINGS SUMMARY CARD */}
          <View style={styles.totalCard}>
            <View style={styles.totalCardContent}>
              <Text style={styles.totalLabel}>Total Yearly Earnings</Text>
              <Text style={styles.totalValue}>₹ {totalYearly.toLocaleString('en-IN')}</Text>
              <Text style={styles.totalSubtext}>for the year {selectedYear}</Text>
            </View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="wallet-outline" size={28} color="#ffffff" />
            </View>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <View style={styles.loaderCircle}>
                <ActivityIndicator size="large" color="#0B5D69" />
              </View>
              <Text style={styles.loadingTitle}>Loading...</Text>
              <Text style={styles.loadingSubtitle}>Fetching salary data for {selectedYear}</Text>
            </View>
          ) : totalYearly === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="#0B5D69" />
              </View>
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySubtitle}>
                There are no salary records for {selectedYear}
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {months.map((month, index) => {
                const amount = salaryData[month] || 0;
                return (
                  <TouchableOpacity 
                    key={month} 
                    style={[
                      styles.salaryRow,
                      index === months.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    activeOpacity={amount > 0 ? 0.7 : 1}
                    disabled={amount === 0}
                  >
                    <View style={styles.monthInfo}>
                      <Text style={styles.monthName}>{month}</Text>
                      <Text style={[
                        styles.amountText, 
                        amount < 0 && { color: '#ff4444' },
                        amount === 0 && { fontStyle: 'italic', color: '#999' }
                      ]}>
                        {amount === 0 ? "No Record" : `₹ ${amount.toLocaleString('en-IN')}`}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: amount > 0 ? '#E8F5E9' : amount < 0 ? '#FFEBEE' : '#F5F5F5' }
                    ]}>
                      <MaterialCommunityIcons 
                        name={amount > 0 ? "check-circle" : amount < 0 ? "alert-circle" : "clock-outline"} 
                        size={18} 
                        color={amount > 0 ? "#3cb371" : amount < 0 ? "#ff4444" : "#bdbdbd"} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
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