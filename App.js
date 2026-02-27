import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { setNavigation } from "./src/api/apiClient";
import { AuthProvider } from './src/context/AuthContext';
import { DashboardProvider } from "./src/context/DashboardContext";
import { NavigationRef } from './src/navigation/NavigationRef';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/config/toastConfig';

export default function App() {
  return (
    <>
      <AuthProvider>
        <DashboardProvider>
          <NavigationContainer
            ref={NavigationRef}
            onReady={() => setNavigation(NavigationRef)}
          >
            <RootNavigator />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </DashboardProvider>
      </AuthProvider>
    </>
  );
}