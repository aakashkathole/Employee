import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomPicker = ({ placeholder, options, selectedValue, onValueChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item) => {
    onValueChange(item);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.pickerTrigger} 
        onPress={() => setModalVisible(true)}
      >
        {/* If selectedValue is null, show placeholder with grey color */}
        <Text style={[
          styles.valueText, 
          !selectedValue && styles.placeholderText
        ]}>
          {selectedValue ? selectedValue : placeholder}
        </Text>
        <Text><MaterialCommunityIcons name={'chevron-down'} size={24} color='#000080' /></Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  pickerTrigger: {
    marginHorizontal: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  valueText: { fontSize: 16, color: '#000' },
  placeholderText: { color: '#999' }, // Grey hint text
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    maxHeight: '40%' 
  },
  modalHeader: { 
    fontSize: 14,
    fontFamily: 'Poppins-Medium', 
    color: '#000080', 
    marginBottom: 10, 
    textAlign: 'center',
  },
  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionText: { fontSize: 16,fontFamily: 'Poppins-Regular', textAlign: 'center' },
});

export default CustomPicker;