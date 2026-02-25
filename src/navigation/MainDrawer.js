import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

// screens
import BottomTabNavigator from './BottomTabNavigator';
import SalaryScreen from '../screens/SalaryScreen';
import LeaveTabNavigator from "../navigation/LeaveTabNavigator";
import MemoScreen from '../screens/MemoScreen';
import HolidayScreen from '../screens/HolidayScreen';
import QueryScreen from '../screens/QueryScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Drawer = createDrawerNavigator();

// Custom Drawer Component
function CustomDrawerContent(props) {

  // Retrive userData from AuthContext
  const { logout, userData } = useAuth();
  const userName = userData?.fullName || 'Employee';
  const userRole = userData?.role || 'User';

  const handleLogout = () => {
    logout();
  };
  
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
 
       <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo-DlE65z4X.jpg')}
          style={styles.logo}
        />
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userRole}>{userRole}</Text>
      </View>

      <ScrollView>
      <View style={styles.drawerList}>
        <DrawerItemList {...props} />
      </View>
      </ScrollView>

      <View style={styles.logoutSection}>
        <DrawerItem
          label="Logout"
          labelStyle={{ fontWeight: 'bold', color: '#fff' }}
          icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="logout"
            color="#fff"
            size={22}
          />
          )}
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
        drawerActiveBackgroundColor: '#7b68ee',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontSize: 15,
          marginLeft: 5,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Salary"
        component={SalaryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Leave"
        component={LeaveTabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-outline" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Memo"
        component={MemoScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Holiday"
        component={HolidayScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="beach" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Query"
        component={QueryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-question-outline" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-edit-outline" color={color} size={size} />
          ),
          drawerLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 16,
          }
        }}
      />
    </Drawer.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 25,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#000000',
  },
  drawerList: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  logoutSection: {
    // padding: 1,
    borderRadius: 25,
    // borderBottomStartRadius: 0,
    backgroundColor: '#7b68ee',
  },
  logoutButton: {
    backgroundColor: '#7b68ee',
  },
});
