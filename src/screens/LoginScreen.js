import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from '../components/Loader';
import { loginUser } from '../Services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type:'error',
        text1:'Please enter both email and password.',
        position:'top',
        visibilityTime: 1000
      });
      return;
    }
    
    setLoading(true);

        try {
            const data = await loginUser(email, password);
            console.log('Login Response:', data);

            if (data?.token) {
                const apiUserData = data.data;
                
                const userToSave = {
                    empId: apiUserData.id, 
                    email: apiUserData.empEmail,
                    id: apiUserData.id,
                    empEmail: apiUserData.empEmail,
                    role: apiUserData.role,
                    branchCode: apiUserData.branchCode, 
                    fullName: apiUserData.fullName,
                };
                
                // This function updates both AsyncStorage AND the AuthContext state.
                await login(data.token, userToSave); 


                Toast.show({
                    type: 'customSuccessToast',
                    text1: 'Login successful!',
                    position:'top',
                    visibilityTime: 1500
                });
                
                // The RootNavigator in App.js will handle the screen switch automatically.

            } else {
                Toast.show({
                    type: 'error',
                    text1: data.message || 'Invalid email or password',
                    position:'top',
                    visibilityTime: 1000
                });
            }
        } catch (error) {
            console.log("LOGIN ERROR FULL:", error);
            Toast.show({
                type: 'error',
                text1: error.message || 'Login failed. Try again.',
                position:'top',
                visibilityTime: 1000
            });
        } finally {
            setLoading(false);
        }
    };

  return (
    <SafeAreaView style= {styles.container}>
      <View style= {styles.card}>
        <View style= {styles.header}>
          <Image
          source={require('../../assets/images/logo-DlE65z4X.jpg')}
          style= {styles.logo}
          />
        <View>
          <Text style= {styles.welcomeback}>Welcome Back</Text>
          <Text style= {styles.signintext}>Sign in to your Employee account</Text>
        </View>
        </View>

        <View style= {styles.inputGroup}>
          <View style= {{height: 15}}/>
          <Text style= {styles.label}>Email Address</Text>
          <View style= {styles.inputContainer}>
            <MaterialCommunityIcons name={"email-outline"} size={24} color="#fff" />
            <TextInput
            style= {styles.input}
            placeholder= "Enter you email"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            value= {email}
            onChangeText={setEmail}
            />
          </View>

          <View style= {{height: 15}}/>
          <Text style={styles.label}>Password</Text>
          <View style= {styles.inputContainer}>
            <MaterialCommunityIcons name={"lock-outline"} size={24} color="#fff" />
            <TextInput
            style= {styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            value= {password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#fff"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style= {styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style= {styles.signInButton} onPress={handleLogin}>
            <Text style= {styles.signInButtonText}>Sign In To Employee Portal</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Loader visible={loading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 20,
  },
  card:{
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor:'#00E0FF',
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
  },
  welcomeback: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: '#E0E0E0',
  },
  signintext: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    color: '#E0E0E0'

  },
  inputGroup: {
    marginBottom: 20,
  },
  label : {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: "center",
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 0.5,
    borderRadius: 10,
    borderColor: '#fff',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 30,
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#007Bff'
  },
  signInButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#00E0FF',
  },
  signInButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    padding: 10,
  },
})