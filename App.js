import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { setNavigation } from "./src/api/apiClient";
import { AuthProvider, useAuth, AUTH_STATES } from './src/context/AuthContext'; 
import { DashboardProvider } from "./src/context/DashboardContext";

// import screens
import LoginScreen from "./src/screens/LoginScreen";
import MainDrawer from "./src/navigation/MainDrawer";

// for Tost and custom Toast
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


const RootNavigator = () => {
  const { authState, isAuthenticated} = useAuth();

  if (authState === AUTH_STATES.LOADING) {
    return(
    <View style={styles.loadingContainer}>
      <Image 
      source={require('./assets/images/logo-DlE65z4X.jpg')}
      style={StyleSheet.loadingLogo}
      />
      <ActivityIndicator
      size="large"
      color="#00E0FF"
      style={{ marginTop: 25 }} />

    </View>
    );
  }

  return (
  <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
    {isAuthenticated ? (
      <Stack.Screen name="MainDrawer" component={MainDrawer} />
    ) : (
    <Stack.Screen name="Login" component={LoginScreen} />
    )}
    </Stack.Navigator>
    );
}

export default function App() {

  // useEffect to link navigation to Axios (401 handling)
  useEffect(() => {
        const linkNavigation = () => {
            if (NavigationRef.isReady()) {
                setNavigation(NavigationRef);
                console.log("Global navigation reference linked to Axios handler.");
            } else {
                setTimeout(linkNavigation, 100); 
            }
        };
        linkNavigation();
    }, []);

  return (
    <>
    <AuthProvider>
        <DashboardProvider>
            <NavigationContainer ref={NavigationRef}>
                <RootNavigator />
            </NavigationContainer>
        </DashboardProvider>
    </AuthProvider>
    <Toast config={toastConfig} />
    </>
);

}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },

  loadingLogo: {
    margin: 50,
  },
})