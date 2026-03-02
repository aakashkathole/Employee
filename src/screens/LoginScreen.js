import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, BackHandler, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import Loader from '../components/Loader';
import { loginUser } from '../Services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Back Button: Exit app on Login screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter both email and password.',
        position: 'top',
        visibilityTime: 2500
      });
      return;
    }

    if (!isValidEmail(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid email address.',
        position: 'top',
        visibilityTime: 2500
      });
      return;
    }

    // Password Validation (uncomment before production launch) 
    // if (password.length < 6) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Password must be at least 6 characters.',
    //     position: 'top',
    //     visibilityTime: 2500,
    //   });
    //   return;
    // }

    // Internet Check 
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Toast.show({
        type: 'error',
        text1: '📶 No Internet Connection',
        text2: 'Please check your WiFi or mobile data.',
        position: 'top',
        visibilityTime: 2500
      });
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);

      if (data?.token) {
        const apiUserData = data.data;

        const userToSave = {
          empId: apiUserData.id,
          id: apiUserData.id,
          email: apiUserData.empEmail,
          empEmail: apiUserData.empEmail,
          role: apiUserData.role,
          branchCode: apiUserData.branchCode,
          fullName: apiUserData.fullName,
        };

        const success = await login(data.token, userToSave);

        if (success) {
          Toast.show({
            type: 'customSuccessToast',
            text1: 'Login successful!',
            position: 'top',
            visibilityTime: 1500
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Something went wrong. Please try again.',
            position: 'top',
            visibilityTime: 2500
          });
        }

      } else {
        Toast.show({
          type: 'error',
          text1: data.message || 'Invalid email or password.',
          text2: 'Please check your credentials and try again.',
          position: 'top',
          visibilityTime: 2500
        });
      }

    } catch (error) {
      const isNetworkError =
        error.message === 'Network request failed' ||
        error.message === 'Failed to fetch' ||
        error.message?.toLowerCase().includes('network');

      if (isNetworkError) {
        Toast.show({
          type: 'error',
          text1: '📶 No Internet Connection',
          text2: 'Please check your connection and try again.',
          position: 'top',
          visibilityTime: 2500
        });
      } else {
        Toast.show({
          type: 'error',
          text1: error.message || 'Invalid email or password.',
          text2: 'Please check your credentials and try again.',
          position: 'top',
          visibilityTime: 2500
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeback}>Welcome Back</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={{ height: 15 }} />
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name={"email-outline"} size={24} color="#00E0FF" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(text) => setEmail(text.trim())}
              />
            </View>

            <View style={{ height: 15 }} />
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name={"lock-outline"} size={24} color="#00E0FF" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#00E0FF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Loader visible={loading} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', paddingHorizontal: 20, },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#1C1C1C', borderRadius: 20, borderWidth: 1, borderColor: '#00E0FF', padding: 25, },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, },
  welcomeback: { fontSize: 18, fontFamily: 'Poppins-Bold', textAlign: 'center', color: '#E0E0E0', },
  inputGroup: { marginBottom: 20, },
  label: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#E0E0E0', marginBottom: 8, },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderBottomWidth: 0.5, borderRadius: 10, borderColor: '#00E0FF', paddingHorizontal: 15, },
  input: { flex: 1, height: 50, fontSize: 16, color: '#FFFFFF', fontFamily: 'Poppins-Regular', },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 30, marginBottom: 10, },
  forgotPasswordText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#00B8D9', },
  signInButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#00E0FF', },
  signInButtonDisabled: { backgroundColor: '#007A8C', opacity: 0.7, },
  signInButtonText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#121212', padding: 10, },
});