import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth, AUTH_STATES } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainDrawer from './MainDrawer';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image
      source={require('../../assets/images/logo-DlE65z4X.jpg')}
      style={styles.loadingLogo}   //  Fixed: was StyleSheet.loadingLogo
    />
    <ActivityIndicator
      size="large"
      color="#00E0FF"
      style={{ marginTop: 25 }}
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingLogo: {
    margin: 50,
  },
});

export default RootNavigator;