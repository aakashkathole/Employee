// screens/AttendanceStackNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AttendanceScreen from '../screens/AttendanceScreen';
import CheckInScreen from '../screens/CheckInScreen';
import BreakStartScreen from '../screens/BreakStartScreen';
import BreakEndScreen from '../screens/BreakEndScreen';
import CheckOutScreen from '../screens/CheckOutScreen';

const Stack = createNativeStackNavigator();

export default function AttendanceStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AttendanceScreen"
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />

      <Stack.Screen name="CheckInScreen" component={CheckInScreen} />
      <Stack.Screen name="BreakStartScreen" component={BreakStartScreen} />
      <Stack.Screen name="BreakEndScreen" component={BreakEndScreen} />
      <Stack.Screen name="CheckOutScreen" component={CheckOutScreen} />
    </Stack.Navigator>
  );
}
