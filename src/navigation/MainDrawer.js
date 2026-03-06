import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

// screens
import BottomTabNavigator from './BottomTabNavigator';
import SalaryScreen from '../screens/SalaryScreen';
import LeaveTabNavigator from '../navigation/LeaveTabNavigator';
import MemoScreen from '../screens/MemoScreen';
import HolidayScreen from '../screens/HolidayScreen';
import QueryScreen from '../screens/QueryScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { logout, userData } = useAuth();
  const userName = userData?.fullName || 'Employee';
  const userRole = userData?.role || 'User';
  const userID = userData?.id || 'id';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
          {/* <Image
            source={require('../../assets/images/logo-DlE65z4X.jpg')}
            style={styles.logo}
          /> */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <View style={styles.rolePill}>
                <Text style={styles.userRole}>{userRole}</Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.userRole}>Employee ID : {userID}</Text>
              </View>
            </View>
          </View>
      </View>

      {/* Section Label */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>MENU</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.drawerList}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <View style={styles.logoutIconBox}>
            <MaterialCommunityIcons name="logout-variant" color="#e53935" size={20} />
          </View>
          <Text style={styles.logoutLabel}>Sign Out</Text>
          <MaterialCommunityIcons name="chevron-right" color="#e53935" size={18} />
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#EEF0FF',   
        drawerActiveTintColor: '#4C46D6',         
        drawerInactiveTintColor: '#5f6368',       
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 1,
          height: 48,
          justifyContent: 'center',
        },
        drawerLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 14,
          marginLeft: 4,
          letterSpacing: 0.1,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Salary"
        component={SalaryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Leave"
        component={LeaveTabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-outline" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Memo"
        component={MemoScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Holiday"
        component={HolidayScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="beach" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Query"
        component={QueryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-question-outline" color={color} size={22} />
          ),
        }}
      />
      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-edit-outline" color={color} size={22} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  // Header 
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 18, gap: 14, borderBottomWidth: 1, borderBottomColor: '#34a853', },
  logo: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: '#EEF0FF', },
  userInfo: { flex: 1},
  userName: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#1a1a2e', letterSpacing: 0.2, },
  rolePill: { marginTop: 4, backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', },
  userRole: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#4C46D6', letterSpacing: 0.3, },
  // Section Label
  sectionLabel: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 4, },
  sectionLabelText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: '#aaa', letterSpacing: 1.5, },
  // Drawer List
  drawerList: { flex: 1, paddingTop: 4, },
  // Footer / Logout
  footer: { paddingBottom: 16, },
  footerDivider: { height: 1, backgroundColor: '#e53935', marginHorizontal: 20, marginBottom: 8, },
  logoutRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, gap: 12, },
  logoutIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fdecea', alignItems: 'center', justifyContent: 'center', },
  logoutLabel: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', color: '#e53935', letterSpacing: 0.1, },
});