import React from 'react';
import { View, Text } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceStackNavigator from './AttendanceStackNavigator';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createMaterialTopTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: "#7b68ee",
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      height: 60,
      paddingBottom: 8,
      paddingTop: 1,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const iconName = {
          Dashboard: 'view-dashboard-outline',
          Attendance: 'calendar-check-outline',
          Profile: 'account-outline',
        }[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={route.key}
            onTouchEnd={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={isFocused ? '#7b68ee' : '#999'}
            />
            <Text style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 12,
              color: isFocused ? '#7b68ee' : '#999',
              marginTop: 2,
            }}>
              {route.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Attendance" component={AttendanceStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}