import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth, AUTH_STATES } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainDrawer from './MainDrawer';

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image
      source={require('../../assets/images/logo-DlE65z4X.jpg')}
      style={styles.loadingLogo}
      resizeMode="contain"
    />
    <ActivityIndicator
      size="large"
      color="#00E0FF"
      style={styles.spinner}
    />
  </View>
);

const RootNavigator = () => {
  const { authState, isAuthenticated } = useAuth();

  if (authState === AUTH_STATES.LOADING) {
    return <LoadingScreen />;
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
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingLogo: {
    width: width * 0.55,       // 55% of screen width
    height: height * 0.18,     // 18% of screen height
    resizeMode: 'contain',
  },
  spinner: {
    marginTop: height * 0.04,  // 4% of screen height
  },
});

export default RootNavigator;