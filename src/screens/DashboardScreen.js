import { useEffect, useState } from "react";
import {  StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Image  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../components/AppHeader';
import { getDashboardData } from "../Services/dashboardService";

import React from 'react'

export default function DashboardScreen({ navigation }) {
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
      <Text>Loading Dashboard...</Text>
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
  <View style= {styles.employeeInfo}>
    <View style={styles.empInfoMini }>
      <Image
      source={{ uri: doc?.employeePhoto}}
      style={styles.employeeImg}
      />
      <View>
        <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold' }} >
          Welcome, {emp?.fullName}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: 'Poppins-SemiBold' }}>
            {emp?.designation}
          </Text>
      </View>
    </View>
    <View style={{flexDirection:'row', padding:6, marginTop: 15}}>
      <MaterialCommunityIcons name="badge-account-outline" size={32} color="#000080" />
      <View >
        <Text style={styles.empInfo}>Employee ID</Text>
        <Text style={styles.apiInfo}>{emp?.id}</Text>
      </View>
    </View>
    <View style={{flexDirection:'row', padding:6}}>
      <MaterialCommunityIcons name="phone-outline" size={32} color="#000080" />
      <View >
        <Text style={styles.empInfo}>Mobile</Text>
        <Text style={styles.apiInfo}>{emp?.mobileNo}</Text>
      </View>
    </View>
    <View style={{flexDirection:'row', padding:6}}>
      <MaterialCommunityIcons name="account-outline" size={32} color="#000080" />
      <View >
        <Text style={styles.empInfo}>Category</Text>
        <Text style={styles.apiInfo}>{emp?.categoryName}</Text>
      </View>
    </View>
    <View style={{flexDirection:'row', padding:6}}>
      <MaterialCommunityIcons name="briefcase-account-outline" size={32} color="#000080" />
        <View >
          <Text style={styles.empInfo}>Work Location</Text>
          <Text style={styles.apiInfo}>{emp?.workLocation}</Text>
        </View>
    </View>

    <View style={{flexDirection:'row', padding:6}}>
      <MaterialCommunityIcons name="calendar-clock-outline" size={32} color="#000080" />
        <View >
          <Text style={styles.empInfo}>Shift</Text>
          <Text style={styles.apiInfo}>
          {emp?.shift} ({emp?.shiftStartTime} - {emp?.shiftEndTime})
          </Text>
      </View>
    </View>

    <View style={{flexDirection:'row', padding:6}}>
      <MaterialCommunityIcons name="check-circle-outline" size={32} color="#000080" />
      <View >
        <Text style={styles.empInfo}>Status</Text>
        <Text style={styles.apiInfo}>{emp?.status}</Text>
      </View>
    </View>
  </View>
  <View style= {{height: 15 }} />
  <View style={styles.cardView}>
          <View style= {styles.currentStatus}>
            <View style={styles.cardTitle}>
              <Text style={styles.cardTitle}>Currently</Text>
              <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={30} color="#fff" />
            </View>
            <View style= {styles.horizontalLine} />
            <Text style= {styles.cardInfo}>{emp?.employeeType}</Text>
        </View>

          <View style= {styles.department}>
            <View style={styles.cardTitle}>
              <Text style={styles.cardTitle}>Department</Text>
              <MaterialCommunityIcons name="domain" size={30} color="#fff" />
            </View>
            <View style= {styles.horizontalLine} />
            <Text style= {styles.cardInfo}>{emp?.department}</Text>
        </View>
        </View>

        <View style={styles.cardView}>
          <View style= {styles.designation}>
            <View style={styles.cardTitle}>
              <Text style={styles.cardTitle}>Designation</Text>
              <MaterialCommunityIcons name="account-tie" size={30} color="#fff" />
            </View>
            <View style= {styles.horizontalLine} />
            <Text style= {styles.cardInfo}>{emp?.designation}</Text>
        </View>

          <View style= {styles.Category}>
            <View style={styles.cardTitle}>
              <Text style={styles.cardTitle}>Category</Text>
              <MaterialCommunityIcons name="card-account-details-star-outline" size={30} color="#fff" />
            </View>
            <View style= {styles.horizontalLine} />
            <Text style= {styles.cardInfo}>{emp?.categoryName}</Text>
        </View>
        </View>

        <View style={{height:15}} />

        <View style={styles.mAttendance}>
          <View style={styles.contentHeader}>
            <MaterialCommunityIcons name="chart-bar-stacked" size={30} color='#1e90ff' />
            <Text style={styles.contenHeaderLabel}>Monthly Attendanc</Text>
          </View>
          <View style={styles.btnLabel}>
            <Text style={styles.btnlabelTxt}>View Monthly Attendanc</Text>
            <MaterialCommunityIcons name="chevron-right" size={30} color='#fff' />
          </View>
        </View>

        <View style={{height:15}} />

        <View style={styles.ySalary}>
          <View style={styles.contentHeader}>
            <MaterialCommunityIcons name="trending-up" size={30} color='#3cb371' />
            <Text style={styles.contenHeaderLabel}>Yearly Salary</Text>
          </View>
          <View style={styles.btnLabel}>
            <Text style={styles.btnlabelTxt}>View Yearly Salary</Text>
            <MaterialCommunityIcons name="chevron-right" size={30} color='#fff' />
          </View>
        </View>

        <View style={{height:15}} />

        <View style={styles.yLeaveReport}>
          <View style={styles.contentHeader}>
            <MaterialCommunityIcons name="calendar-text-outline" size={30} color='#FFD700' />
            <Text style={styles.contenHeaderLabel}>Yearly Leave Report</Text>
          </View>
          <View style={styles.btnLabel}>
            <Text style={styles.btnlabelTxt}>View Yearly Leav Report</Text>
            <MaterialCommunityIcons name="chevron-right" size={30} color='#fff' />
          </View>
        </View>
        <Text>Software Designed By PJSOFTTECH Pvt. Ltd.</Text>
        <Text>© All Rights Reserved</Text>
        </ScrollView>
  )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 1,
        backgroundColor: '#ffffff'
    },
    employeeInfo:{
    width: '100%',
    borderColor:'#000000',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 10,
  },
  empInfo:{
    fontSize: 14,
    fontFamily:'Poppins-SemiBold',
    marginLeft: 10,
    color:'#000',
  },
  empInfoMini:{
    flexDirection:'row',
    alignItems:"center", 
    alignContent:"center", 
    justifyContent:"space-around", 
    padding: 6,
    borderRadius:25,
    borderColor:'#ffa500', 
    // borderWidth:0.5,
    borderRightWidth: 3,
    borderBottomWidth: 1, 
    backgroundColor:'#fff'
  },
  employeeImg:{
    alignItems:"center",
    width: 75,
    height: 75,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#ffa500',
  },
  apiInfo:{
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 10,
    color:'#000',
  },
  employeeBirthdays: {
    width: '100%',
    borderRadius: 20,
    padding: 25,
    backgroundColor: '#fffacd',
  },
  horizontalLine: {
    height: 0.5,
    width: '65%',
    backgroundColor:'#fff',
  },
  cardView:{
    flexDirection: "row",
    alignItems:"center",
    justifyContent:'space-between',
    borderRadius: 16,
    borderColor:'#000',
    // borderWidth: 0.5,
    backgroundColor:'#fff',
    padding :'5',
  },
  cardTitle: {
    flexDirection:"row",
    fontSize: 14,
    fontFamily:'Poppins-SemiBold',
    fontWeight:"500",
    color:'#fff',
    justifyContent:"space-between",
    alignItems:"center",
  },
  cardInfo: {
    padding:10,
    fontSize: 14,
    fontFamily:'Poppins-Regular',
    color:'#fff',
  },
  currentStatus: { 
    width:'49%',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#1e90ff',
  },
  department: {
    width:'49%',
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#f08080',
  },
  designation: {
    width:'49%',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#3cb371',
  },
  Category: {
    width:'49%',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#FFD700',
  },

  mAttendance:{
    padding:10,
    borderWidth:0.5,
    borderRadius:16,

  },
  ySalary:{
    padding:10,
    borderWidth:0.5,
    borderRadius:16,

  },
  yLeaveReport:{
    padding:10,
    borderWidth:0.5,
    borderRadius:16,

  },
  contentHeader:{
    flexDirection:"row",
    justifyContent:"center",
    // borderWidth:0.5,
  },
  contenHeaderLabel:{
    fontFamily:'Poppins-SemiBold',
    fontSize:16,
    margin:5,
    marginLeft:15,
  },
  btnLabel:{
    marginTop: 20,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    padding: 4,
    paddingLeft: 15,
    borderRadius: 16,
    backgroundColor:'#0B5D69',
  },
  btnlabelTxt:{
    color:'#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
})