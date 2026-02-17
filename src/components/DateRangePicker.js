import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

export default function DateRangePicker({ onChange, allowRange = true, value, duration = 'Full Leave' }) {
  
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef(null);
  const tempRangeRef = useRef({ start: null, end: null });
  const prevHasBothRef = useRef(false);

  const formatDate = (date) =>
    date ? moment(date).format('YYYY-MM-DD') : null;

  // Watch for when both dates are set (fromDate AND toDate) and close the modal
  useEffect(() => {
    const hasBoth = !!(value && value.fromDate && value.toDate);
    // only close when we observe a transition from not-having-both to having-both
    if (allowRange && visible && hasBoth && !prevHasBothRef.current) {
      closeWithDelay();
    }
    prevHasBothRef.current = hasBoth;
  }, [value, visible, allowRange]);

  // delay to allow animation to be visible
  const closeWithDelay = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    // clear temporary range when closing
    tempRangeRef.current = { start: null, end: null };
    closeTimer.current = setTimeout(() => {
      setVisible(false);
    }, 400); // animation-friendly delay
  };

  const onDateChange = (date, type) => {
    const formattedDate = formatDate(date);

    // Non-range (half day) selection: single click completes and closes
    if (!allowRange) {
      onChange({
        fromDate: formattedDate,
        toDate: formattedDate,
      });
      closeWithDelay();
      return;
    }

    // Range selection mode:
    // - First click: stores start date, keeps modal open
    // - Second click: stores end date (can be same or different), closes modal
    
    if (!tempRangeRef.current.start) {
      // First click -> set start date
      tempRangeRef.current.start = formattedDate;
      onChange({
        fromDate: formattedDate,
        toDate: null,
      });
    } else {
      // Second click -> set end date and close
      // This works whether it's the same date or a different one
      onChange({
        fromDate: tempRangeRef.current.start,
        toDate: formattedDate,
      });
      closeWithDelay();
    }
  };

  const displayText = value.fromDate
  ? value.toDate && allowRange
    ? `${value.fromDate} → ${value.toDate}`
    : value.fromDate
  : 'Select Leave Date';

  return (
    <View style={styles.container}>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => {
          tempRangeRef.current = { start: null, end: null };
          setVisible(true);
        }}
      >
        <Text style={styles.valueText}>{displayText}</Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color="#000080" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
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
              selectedDayColor={duration === 'First Half' || duration === 'Second Half' ? '#90EE90' : '#4CAF50'}
              selectedDayTextColor="#fff"
              selectedRangeStartStyle={styles.selectedRangeStart}
              selectedRangeEndStyle={styles.selectedRangeEnd}
              selectedRangeStyle={styles.selectedRange}
              textStyle={styles.calendarText}
              todayBackgroundColor="transparent"
              todayTextStyle={styles.todayText}
              previousTitle={value.fromDate === value.toDate && value.fromDate ? '' : 'Previous'}
              nextTitle={value.fromDate === value.toDate && value.fromDate ? '' : 'Next'}
              previousTitleStyle={styles.navButtonText}
              nextTitleStyle={styles.navButtonText}
              width={340}
            />
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => {
                  // Cancel: reset temporary selection and close without changing value
                  tempRangeRef.current = { start: null, end: null };
                  setVisible(false);
                }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => {
                  // Confirm: if in range mode and start selected but no toDate,
                  // treat it as single-day range (fromDate === toDate)
                  if (allowRange) {
                    const start = tempRangeRef.current.start || (value && value.fromDate);
                    if (start) {
                      onChange({ fromDate: start, toDate: start });
                      closeWithDelay();
                      return;
                    }
                  }

                  // Fallback: just close
                  setVisible(false);
                }}
              >
                <Text style={styles.actionText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 1},
  pickerTrigger: { flexDirection: 'row', marginHorizontal: 1, padding: 3, borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 12, justifyContent: 'space-between', backgroundColor: '#FFF'},
  valueText: { fontFamily: 'Poppins-Regular',fontSize: 15, color: '#000', marginLeft: 5, },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  modalContent: {backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '60%'},
  header: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#000080', marginVertical: 10, textAlign: 'center',},
  selectedRangeStart: { backgroundColor: '#4CAF50', borderTopLeftRadius: 20, borderBottomLeftRadius: 20, },
  selectedRangeEnd: { backgroundColor: '#4CAF50', borderTopRightRadius: 20, borderBottomRightRadius: 20, },
  selectedRange: { backgroundColor: '#C8E6C9' },
  calendarText: { fontFamily: 'Poppins-Regular', fontSize: 14, },
  todayText: { color: '#007AFF', fontWeight: 'bold', },
  navButtonText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#007AFF', fontWeight: '600', },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  actionBtn: { flex: 1, paddingVertical: 10, marginHorizontal: 6, borderRadius: 8, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#4CAF50' },
  cancelBtn: { backgroundColor: '#f2f2f2' },
  actionText: { color: '#fff', fontFamily: 'Poppins-Medium' },
})