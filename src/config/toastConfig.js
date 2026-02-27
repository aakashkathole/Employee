import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Extracted as a named component to avoid anonymous function recreation on every render
const CustomSuccessToast = ({ text1 }) => (
  <View style={styles.toastContainer}>
    <MaterialCommunityIcons
      name="check-decagram"
      size={28}
      color="#FFF"
      style={{ marginRight: 12 }}
    />
    <View>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  </View>
);

export const toastConfig = {
  customSuccessToast: CustomSuccessToast,
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    opacity: 0.95,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});