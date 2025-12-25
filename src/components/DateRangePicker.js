import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

export default function DateRangePicker({ onChange, allowRange = true }) {
  const [visible, setVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const closeTimer = useRef(null);

  const formatDate = (date) =>
    date ? moment(date).format('YYYY-MM-DD') : null;

  // delay to allow animation to be visible
  const closeWithDelay = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => {
      setVisible(false);
    }, 400); // animation-friendly delay
  };

  const onDateChange = (date, type) => {
    if (type === 'END_DATE' && allowRange) {
      setEndDate(date);
      onChange({
        fromDate: formatDate(startDate),
        toDate: formatDate(date),
      });
      closeWithDelay();
    } else {
      setStartDate(date);
      setEndDate(null);
      onChange({
        fromDate: formatDate(date),
        toDate: allowRange ? null : formatDate(date),
      });
      if (!allowRange) {
        closeWithDelay();
      };
    }
  };

  const displayText = startDate
    ? endDate
      ? `${formatDate(startDate)} → ${formatDate(endDate)}`
      : formatDate(startDate)
    : 'Select Leave Date';

  return (
    <View style={styles.container}>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.valueText}>{displayText}</Text>
        <MaterialCommunityIcons name="calendar" size={22} color="#000080" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.header}>Select Date</Text>

            <CalendarPicker
              startFromMonday
              allowRangeSelection={allowRange}
              onDateChange={onDateChange}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15},
  pickerTrigger: { flexDirection: 'row', marginHorizontal: 15, padding: 15, borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 25, justifyContent: 'space-between', backgroundColor: '#FFF'},
  valueText: { fontSize: 16, color: '#000',},
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  modalContent: {backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '50%'},
  header: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#000080', marginVertical: 10, textAlign: 'center',}
})