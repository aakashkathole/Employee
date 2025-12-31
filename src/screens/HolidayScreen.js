import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import UnderDevelopmentModal from '../components/UnderDevelopmentModal';

export default function HolidayScreen() {
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setShowModal(true);

      return () => {
        setShowModal(false);
      };
    }, [])
  );

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
