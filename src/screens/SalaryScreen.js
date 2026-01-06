import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, RefreshControl, ScrollView, } from "react-native";
import { fetchSalaries } from "../Services/salaryServices";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = [2027, 2026, 2025, 2024];

const SalaryScreen = () => {
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [monthModal, setMonthModal] = useState(false);
  const [yearModal, setYearModal] = useState(false);

  const loadSalaries = async (month = null, year = null, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await fetchSalaries({ month, year });
      const sortedData = [...data].sort(
        (a, b) => b.year - a.year || b.month - a.month
      );
      setSalaryList(sortedData);
    } catch (error) {
      console.log("Salary fetch error:", error);
      setSalaryList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSalaries(); }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadSalaries(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedMonth(null);
    setSelectedYear(null);
    loadSalaries(null, null, true);
  }, []);

  const clearFilter = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    loadSalaries(null, null);
  };

  const formatAmount = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const renderSalaryCard = ({ item }) => {
    const finalSalary = Number(item.finalNetSalary) || 0;
    const isNegative = finalSalary < 0;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.monthText}>
              {MONTHS[item.month - 1]} {item.year}
            </Text>
            <Text style={styles.dateText}>Payment: {item.paymentDate}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === "Paid" ? "#4CAF50" : "#FF9800" }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Net Salary */}
        <View style={[
          styles.netSalaryBox,
          isNegative && styles.netSalaryNegative
        ]}>
          <Text style={styles.netLabel}>Net Salary</Text>
          <Text style={styles.netAmount}>₹{formatAmount(finalSalary)}</Text>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Working Days</Text>
            <Text style={styles.infoValue}>{item.workingDays}/{item.daysOfMonth}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
            <Text style={styles.infoValue}>{item.transactionId}</Text>
          </View>
        </View>

        {/* Earnings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Basic Salary</Text>
            <Text style={styles.value}>₹{formatAmount(item.basicSalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Actual Basic</Text>
            <Text style={styles.value}>₹{formatAmount(item.actualBasic)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>HRA</Text>
            <Text style={styles.value}>₹{formatAmount(item.hraAllowance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>TA</Text>
            <Text style={styles.value}>₹{formatAmount(item.taAllowance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Incentive</Text>
            <Text style={styles.value}>₹{formatAmount(item.incentive)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SPI</Text>
            <Text style={styles.value}>₹{formatAmount(item.spi)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Medical</Text>
            <Text style={styles.value}>₹{formatAmount(item.medicalAllowance)}</Text>
          </View>
        </View>

        {/* Deductions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          <View style={styles.row}>
            <Text style={styles.label}>PF</Text>
            <Text style={styles.value}>₹{formatAmount(item.pf)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ESIC</Text>
            <Text style={styles.value}>₹{formatAmount(item.esic)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Professional Tax</Text>
            <Text style={styles.value}>₹{formatAmount(item.professionalTax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Income Tax</Text>
            <Text style={[styles.value, item.incomeTax < 0 && styles.negative]}>
              ₹{formatAmount(item.incomeTax)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Company Fund</Text>
            <Text style={styles.value}>₹{formatAmount(item.companyFund)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Other Deductions</Text>
            <Text style={styles.value}>₹{formatAmount(item.deductions)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>TDS</Text>
            <Text style={styles.value}>₹{formatAmount(item.tds)}</Text>
          </View>
          {item.penalty > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Penalty</Text>
              <Text style={[styles.value, styles.penalty]}>₹{formatAmount(item.penalty)}</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Before Taxes</Text>
            <Text style={[styles.summaryValue, item.netSalaryBeforeTaxes < 0 && styles.negative]}>
              ₹{formatAmount(item.netSalaryBeforeTaxes)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.finalRow]}>
            <Text style={styles.finalLabel}>Final Net Salary</Text>
            <Text style={[styles.finalValue, isNegative && styles.negative]}>
              ₹{formatAmount(finalSalary)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setMonthModal(true)}
          >
            <Text style={styles.filterText}>
              {selectedMonth ? MONTHS[selectedMonth - 1] : "Select Month"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setYearModal(true)}
          >
            <Text style={styles.filterText}>{selectedYear || "Select Year"}</Text>
          </TouchableOpacity>

          {(selectedMonth || selectedYear) && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={salaryList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSalaryCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#2196F3"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No salary records found</Text>
          </View>
        }
      />

      {/* Month Modal */}
      <Modal visible={monthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setMonthModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {MONTHS.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    setMonthModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Modal */}
      <Modal visible={yearModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setYearModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedYear(y);
                    setYearModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SalaryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center",backgroundColor: "#f5f5f5" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  // Filters
  filterContainer: { backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  filterRow: { flexDirection: "row", gap: 10 },
  filterBtn: { flex: 1, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 8, alignItems: "center" },
  filterText: { fontSize: 14, color: "#333", fontWeight: "500" },
  clearBtn: { padding: 12, backgroundColor: "#ffebee", borderRadius: 8, justifyContent: "center" },
  clearText: { color: "#d32f2f", fontWeight: "600", fontSize: 14 },
  listContent: { padding: 16,},
  // Card
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  monthText: { fontSize: 18, fontWeight: "700", color: "#212121", marginBottom: 4 },
  dateText: { fontSize: 13, color: "#757575" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: 12,  fontWeight: "600", color: "#fff", },
  // Net Salary
  netSalaryBox: { backgroundColor: "#2196F3", padding: 16, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  netSalaryNegative: { backgroundColor: "#d32f2f" },
  netLabel: { fontSize: 13, color: "#fff", opacity: 0.9, marginBottom: 4 },
  netAmount: { fontSize: 28, fontWeight: "700", color: "#fff" },
  // Quick Info
  quickInfo: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, marginBottom: 16 },
  infoItem: { flex: 1, alignItems: "center" },
  infoLabel: { fontSize: 12, color: "#757575", marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#212121" },
  divider: { width: 1, backgroundColor: "#e0e0e0", marginHorizontal: 12 },
  // Sections
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 10, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: "#2196F3" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 14, color: "#616161" },
  value: { fontSize: 14, fontWeight: "600", color: "#212121" },
  negative: { color: "#d32f2f" },
  penalty: { color: "#f57c00" },
  // Summary
  summary: { borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: "#616161" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#212121" },
  finalRow: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  finalLabel: { fontSize: 15, fontWeight: "700", color: "#212121" },
  finalValue: { fontSize: 16, fontWeight: "700", color: "#2196F3" },
  // Empty State
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#757575" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", borderRadius: 12, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#212121" },
  modalClose: { fontSize: 22, color: "#757575" },
  modalScroll: { maxHeight: 400 },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  modalItemText: { fontSize: 16, color: "#212121" },
});