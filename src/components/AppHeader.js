import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AppHeader = ({ onMenuPress, onNotificationPress }) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <MaterialCommunityIcons name="menu" size={26} color="#000000" />
        </TouchableOpacity>

        
        <View style={styles.centerContainer}>
          <Image
            source={require('../../assets/images/logo-DlE65z4X.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <MaterialCommunityIcons name="bell-outline" size={26} color="#000000" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  iconButton: {
    padding: 5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
  },
});

export default AppHeader;
