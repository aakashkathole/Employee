import 'react-native-reanimated';
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardProvider } from "./src/context/DashboardContext";


// import screens
import LoginScreen from "./src/screens/LoginScreen";
import MainDrawer from "./src/navigation/MainDrawer";

// for Tost and custom Toast
import Toast from 'react-native-toast-message';

import { View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const toastConfig = {
  customSuccessToast: ({ text1, text2 }) => (
    <View 
    style= {{
      flexDirection: 'row',
      backgroundColor: '#10b981',
      padding: 10,
      borderRadius: 20,
      marginHorizontal: 12,
      alignItems:'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 4,
      shadowOffset: {width: 0, height: 2},
      elevation: 5,
      opacity: 0.95,
    }}
    >
      <MaterialCommunityIcons
      name="check-decagram"
      size={28}
      color="#FFF"
      style={{marginRight: 12}} 
      />

      <View>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight:'bold'}}>
          {text1}
        </Text>
        
      </View>

    </View>
  )
};


export const NavigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

export default function App() {
  return (

    <>
    <DashboardProvider>
    <NavigationContainer ref={NavigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainDrawer" component={MainDrawer} />
      </Stack.Navigator>
    </NavigationContainer>
    </DashboardProvider>

    <Toast config={toastConfig} />
    </>
  );

}

// const styles = StyleSheet.create({})