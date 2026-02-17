import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LeaveSummaryScreen from '../screens/LeaveSummaryScreen';
import ApplyLeaveScreen from '../screens/ApplyLeaveScreen';

const Tab = createMaterialTopTabNavigator();

export default function LeaveTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Summary"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIndicatorStyle: { backgroundColor: '#2563EB', borderRadius: 8, height: '85%', marginBottom: '7.5%', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6, elevation: 5, },
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Poppins-SemiBold', letterSpacing: 0.3, textTransform: 'none', },
        tabBarItemStyle: { borderRadius: 8, marginHorizontal: 3, marginVertical: 4, height: 36, justifyContent: 'center', alignItems: 'center', },
        tabBarStyle: { backgroundColor: '#F3F4F6', borderRadius: 10, marginHorizontal: 16, marginBottom: 8, marginTop: 4, height: 50, elevation: 3, shadowColor: '#1F2937', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', },
        tabBarPressColor: '#2563EB18',
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Summary"
        component={LeaveSummaryScreen}
        options={{ tabBarLabel: 'Leave Summary' }}
      />
      <Tab.Screen
        name="Apply"
        component={ApplyLeaveScreen}
        options={{ tabBarLabel: 'Apply Leave' }}
      />
    </Tab.Navigator>
  );
}