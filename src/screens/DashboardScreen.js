import { useEffect, useState } from "react";
import {  StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../components/AppHeader';
import { getDashboardData } from "../Services/dashboardService";
import MonthlyAttendanceModal from "../components/MonthlyAttendanceModal";

import React from 'react'

export default function DashboardScreen({ navigation }) {
  const [attendanceVisible, setAttendanceVisible] = useState(false);
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
    <SafeAreaView style= {styles.container}>
      <AppHeader onMenuPress={handleMenuPress}
      onProfilePress={() => navigation.navigate('Profile')} />

      {loading ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{fontFamily: 'Poppins-Regular'}}>Loading Dashboard...</Text>
    </View>
  ) : error ? (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ) : (
  <ScrollView
  style={{backgroundColor:'#ffffff'}}
  refreshControl={
  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
}
>
  <View style={styles.employeeInfo}>
  {/* Header Section with Photo and Welcome */}
  <View style={styles.empInfoMini}>
    <Image
      source={{ uri: doc?.employeePhoto }}
      style={styles.employeeImg}
    />
    <View style={styles.welcomeTextContainer}>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <Text style={styles.employeeName}>{emp?.fullName}</Text>
      <Text style={styles.designation}>{emp?.designation}</Text>
    </View>
  </View>

  {/* Divider */}
  <View style={styles.sectionDivider} />

  {/* Info Cards */}
  <View style={styles.infoCard}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="badge-account-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Employee ID</Text>
      <Text style={styles.apiInfo}>{emp?.id}</Text>
    </View>
  </View>

  <View style={styles.infoCard}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="phone-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Mobile</Text>
      <Text style={styles.apiInfo}>{emp?.mobileNo}</Text>
    </View>
  </View>

  <View style={styles.infoCard}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="account-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Category</Text>
      <Text style={styles.apiInfo}>{emp?.categoryName}</Text>
    </View>
  </View>

  <View style={styles.infoCard}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="briefcase-account-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Work Location</Text>
      <Text style={styles.apiInfo}>{emp?.workLocation}</Text>
    </View>
  </View>

  <View style={styles.infoCard}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="calendar-clock-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Shift</Text>
      <Text style={styles.apiInfo}>
        {emp?.shift} ({emp?.shiftStartTime} - {emp?.shiftEndTime})
      </Text>
    </View>
  </View>

  <View style={[styles.infoCard, styles.lastCard]}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="check-circle-outline" size={22} color="#000080" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.empInfo}>Status</Text>
      <Text style={styles.apiInfo}>{emp?.status}</Text>
    </View>
  </View>
</View>

<View style={styles.spacer} />

{/* Quick info cards */}
<View style={styles.cardView}>
  <View style={styles.currentStatus}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Currently</Text>
      <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={26} color="#fff" />
    </View>
    <View style={styles.horizontalLine} />
    <Text style={styles.cardInfo}>{emp?.employeeType}</Text>
  </View>

  <View style={styles.department}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Department</Text>
      <MaterialCommunityIcons name="domain" size={26} color="#fff" />
    </View>
    <View style={styles.horizontalLine} />
    <Text style={styles.cardInfo}>{emp?.department}</Text>
  </View>
</View>

<View style={styles.spacer} />

<View style={styles.cardView}>
  <View style={styles.dDesignation}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Designation</Text>
      <MaterialCommunityIcons name="account-tie" size={26} color="#fff" />
    </View>
    <View style={styles.horizontalLine} />
    <Text style={styles.cardInfo}>{emp?.designation}</Text>
  </View>

  <View style={styles.Category}>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>Category</Text>
      <MaterialCommunityIcons name="card-account-details-star-outline" size={26} color="#fff" />
    </View>
    <View style={styles.horizontalLine} />
    <Text style={styles.cardInfo}>{emp?.categoryName}</Text>
  </View>
</View>

<View style={styles.spacer} />

{/* Action Cards */}
<TouchableOpacity style={styles.actionCard} onPress={() => setAttendanceVisible(true)}>
  <View style={styles.contentHeader}>
    <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
      <MaterialCommunityIcons name="chart-bar-stacked" size={28} color='#1e90ff' />
    </View>
    <Text style={styles.contenHeaderLabel}>Monthly Attendance</Text>
  </View>
  <View style={styles.btnLabel}>
    <Text style={styles.btnlabelTxt}>View Monthly Attendance</Text>
    <MaterialCommunityIcons name="chevron-right" size={26} color='#fff' />
  </View>
</TouchableOpacity>

<View style={styles.spacer} />

<TouchableOpacity style={styles.actionCard}>
  <View style={styles.contentHeader}>
    <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
      <MaterialCommunityIcons name="trending-up" size={28} color='#3cb371' />
    </View>
    <Text style={styles.contenHeaderLabel}>Yearly Salary</Text>
  </View>
  <View style={styles.btnLabel}>
    <Text style={styles.btnlabelTxt}>View Yearly Salary</Text>
    <MaterialCommunityIcons name="chevron-right" size={26} color='#fff' />
  </View>
</TouchableOpacity>

<View style={styles.spacer} />

<TouchableOpacity style={styles.actionCard}>
  <View style={styles.contentHeader}>
    <View style={[styles.actionIconContainer, { backgroundColor: '#FFFDE7' }]}>
      <MaterialCommunityIcons name="calendar-text-outline" size={28} color='#FFD700' />
    </View>
    <Text style={styles.contenHeaderLabel}>Yearly Leave Report</Text>
  </View>
  <View style={styles.btnLabel}>
    <Text style={styles.btnlabelTxt}>View Yearly Leave Report</Text>
    <MaterialCommunityIcons name="chevron-right" size={26} color='#fff' />
  </View>
</TouchableOpacity>

{/* Footer */}
<View style={styles.footer}>
  <Text style={styles.footerText}>Software Designed By PJSOFTTECH Pvt. Ltd.</Text>
  <Text style={styles.footerCopyright}>© All Rights Reserved</Text>
</View>
</ScrollView>
  )}
  {/* Monthly Attendance Modal */}
    <MonthlyAttendanceModal visible={attendanceVisible} onClose={() => setAttendanceVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  spacer: { height: 15 },
  employeeInfo: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 0.5 },
  empInfoMini: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderRightWidth: 2.5, borderRadius: 25, borderColor: '#ffa500' },
  employeeImg: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: '#ffa500' },
  welcomeTextContainer: { flex: 1, marginLeft: 16 },
  welcomeText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#666' },
  employeeName: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#000', marginTop: -2 },
  designation: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#000080', marginTop: -2 },
  sectionDivider: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  lastCard: { borderBottomWidth: 0 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1, marginLeft: 12 },
  empInfo: { fontSize: 12, fontFamily: 'Poppins-Medium', color: '#888', marginBottom: 2 },
  apiInfo: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#000' },
  cardView: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  horizontalLine: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)', marginVertical: 8 },
  cardInfo: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#fff', marginTop: 4 },
  currentStatus: { width: '48.5%', borderRadius: 16, padding: 16, backgroundColor: '#1e90ff', elevation: 2, shadowColor: '#1e90ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  department: { width: '48.5%', padding: 16, borderRadius: 16, backgroundColor: '#f08080', elevation: 2, shadowColor: '#f08080', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  dDesignation: { width: '48.5%', borderRadius: 16, padding: 16, backgroundColor: '#3cb371', elevation: 2, shadowColor: '#3cb371', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  Category: { width: '48.5%', borderRadius: 16, padding: 16, backgroundColor: '#FFD700', elevation: 2, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  actionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth:0.5 },
  contentHeader: { flexDirection: 'row', alignItems: 'center' },
  actionIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  contenHeaderLabel: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#000', marginLeft: 12, flex: 1 },
  btnLabel: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#0B5D69' },
  btnlabelTxt: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-Medium' },
  footer: { alignItems: 'center', paddingVertical: 20, marginTop: 10 },
  footerText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#666', textAlign: 'center' },
  footerCopyright: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#999', marginTop: 4 },
});