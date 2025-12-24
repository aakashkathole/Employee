import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

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
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
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
    padding: 15,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  valueText: { fontSize: 16, color: '#000' },
  placeholderText: { color: '#999' }, // Grey hint text
  arrow: { color: '#666', fontSize: 12 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    maxHeight: '40%' 
  },
  modalHeader: { 
    fontSize: 14, 
    color: '#888', 
    marginBottom: 10, 
    textAlign: 'center',
    fontWeight: 'bold'
  },
  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionText: { fontSize: 18, textAlign: 'center' },
});

export default CustomPicker;