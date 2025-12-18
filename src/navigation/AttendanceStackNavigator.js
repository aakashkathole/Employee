// screens/AttendanceStackNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AttendanceScreen from '../screens/AttendanceScreen';

const Stack = createNativeStackNavigator();

export default function AttendanceStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AttendanceScreen"
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
    </Stack.Navigator>
  );
}
