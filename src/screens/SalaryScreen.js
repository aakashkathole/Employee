import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UnderDevelopmentModal from '../components/UnderDevelopmentModal';

export default function SalaryScreen() {

  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <UnderDevelopmentModal 
        visible={showModal} 
        onClose={handleClose}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})