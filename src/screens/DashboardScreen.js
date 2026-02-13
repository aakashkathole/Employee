import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../components/AppHeader';
import { getDashboardData } from "../Services/dashboardService";
import MonthlyAttendanceModal from "../components/MonthlyAttendanceModal";
import YearlySalaryModal from "../components/YearlySalaryModal";
import YearlyLeaveModal from "../components/YearlyLeaveModal";

import React from 'react'

export default function DashboardScreen({ navigation }) {
  const [attendanceVisible, setAttendanceVisible] = useState(false);
  const [salaryVisible, setSalaryVisible] = useState(false);
  const [leaveVisible, setLeaveVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleMenuPress = () => { 
    navigation.openDrawer();
  };

  const loadDashboard = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.log("Dashboard Screen Error:", err.response?.data || err.message);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() =>  {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const emp = dashboardData?.employee;
  const doc = dashboardData?.document;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onMenuPress={handleMenuPress} onProfilePress={() => navigation.navigate('Profile')} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Image source={{ uri: doc?.employeePhoto }} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.name}>{emp?.fullName}</Text>
              <Text style={styles.designation}>{emp?.designation}</Text>
            </View>
          </View>

          {/* Employee Details Grid */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="badge-account-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Employee ID</Text>
                  <Text style={styles.detailValue}>{emp?.id}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="phone-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Mobile</Text>
                  <Text style={styles.detailValue}>{emp?.mobileNo}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="account-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{emp?.categoryName}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="briefcase-account-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Work Location</Text>
                  <Text style={styles.detailValue}>{emp?.workLocation}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="calendar-clock-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Shift</Text>
                  <Text style={styles.detailValue}>{emp?.shift} ({emp?.shiftStartTime}-{emp?.shiftEndTime})</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color="#000080" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{emp?.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Grid - 2x2 */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: '#1e90ff' }]}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={20} color="#fff" />
                <Text style={styles.infoLabel}>Employee type</Text>
              </View>
              <Text style={styles.infoValue}>{emp?.employeeType}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: '#f08080' }]}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="domain" size={20} color="#fff" />
                <Text style={styles.infoLabel}>Department</Text>
              </View>
              <Text style={styles.infoValue}>{emp?.department}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: '#3cb371' }]}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="account-tie" size={20} color="#fff" />
                <Text style={styles.infoLabel}>Designation</Text>
              </View>
              <Text style={styles.infoValue}>{emp?.designation}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: '#FFD700' }]}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="card-account-details-star-outline" size={20} color="#fff" />
                <Text style={styles.infoLabel}>Category</Text>
              </View>
              <Text style={styles.infoValue}>{emp?.categoryName}</Text>
            </View>
          </View>

          {/* Compact Action Cards */}
          <TouchableOpacity style={styles.actionCard} onPress={() => setAttendanceVisible(true)}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="chart-bar-stacked" size={24} color='#1e90ff' />
            </View>
            <Text style={styles.actionText}>Monthly Attendance</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color='#666' />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setSalaryVisible(true)}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="trending-up" size={24} color='#3cb371' />
            </View>
            <Text style={styles.actionText}>Yearly Salary</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color='#666' />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => setLeaveVisible(true)}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFFDE7' }]}>
              <MaterialCommunityIcons name="calendar-text-outline" size={24} color='#FFD700' />
            </View>
            <Text style={styles.actionText}>Yearly Leave Report</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color='#666' />
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Software Designed By PJSOFTTECH Pvt. Ltd.</Text>
            <Text style={styles.footerCopyright}>© All Rights Reserved</Text>
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <MonthlyAttendanceModal visible={attendanceVisible} onClose={() => setAttendanceVisible(false)} />
      <YearlySalaryModal visible={salaryVisible} onClose={() => setSalaryVisible(false)} />
      <YearlyLeaveModal visible={leaveVisible} onClose={() => setLeaveVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView: { backgroundColor: '#ffffff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Poppins-Regular', marginTop: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontFamily: 'Poppins-Regular', color: '#ff0000' },
  // Header Section
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginBottom: 10, borderBottomWidth: 2, borderRightWidth: 2.5, borderRadius: 20, marginHorizontal: 8, marginTop: 8, borderColor: '#ffa500', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: '#ffa500', },
  headerInfo: { flex: 1, marginLeft: 14 },
  welcomeText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#666' },
  name: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#000', marginTop: -2 },
  designation: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#000080', marginTop: -2 },
  // Employee Details Grid
  detailsContainer: { backgroundColor: '#fff', marginHorizontal: 8, marginBottom: 10, borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, },
  detailItem: { flexDirection: 'row', alignItems: 'center', width: '48%', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 10, },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', },
  detailContent: { flex: 1, marginLeft: 10 },
  detailLabel: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#888' },
  detailValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#000', marginTop: 1 },
  // Info Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, marginBottom: 10, gap: 8, },
  infoCard: { width: '48%', padding: 14, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, },
  labelContainer: { flexDirection: 'row', alignItems: 'center', },
  infoLabel: { fontSize: 11, fontFamily: 'Poppins-Medium', color: 'rgba(255,255,255,0.85)', marginLeft: 6},
  infoValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#fff', marginTop: 2, },
  // Action Cards
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 8, marginBottom: 8, padding: 14, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, borderWidth: 0.5, borderColor: '#f0f0f0', },
  actionIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', },
  actionText: { flex: 1, fontFamily: 'Poppins-Medium', fontSize: 14, color: '#333', marginLeft: 12, },
  // Footer
  footer: { alignItems: 'center', paddingVertical: 16, marginTop: 4, },
  footerText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#666', },
  footerCopyright: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#999', marginTop: 3, },
});