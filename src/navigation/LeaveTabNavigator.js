import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LeaveSummaryScreen from '../screens/LeaveSummaryScreen';
import ApplyLeaveScreen from '../screens/ApplyLeaveScreen';

const Tab = createMaterialTopTabNavigator();

export default function LeaveTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Summary"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { display: 'none' },
        tabBarLabelStyle: {
            fontSize: 14, 
            fontFamily: 'Poppins-SemiBold'
        },
        
        tabBarItemStyle: {
            borderWidth: 1, 
            borderRadius: 25, 
            margin: 5, 
            backgroundColor: '#fff',
            minWidth: 155,
            justifyContent: 'center'
        },
        tabBarStyle: {
            backgroundColor: '#929292ff', 
            borderRadius: 25, 
            margin: 10,
            elevation: 5, // Android shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
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