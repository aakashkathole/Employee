import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPicker from "../components/CustomPicker";
import DateRangePicker from "../components/DateRangePicker";
import moment from 'moment';
import { createLeaveRequest } from '../Services/leaveService';

export default function ApplyLeaveScreen() {

  const [duration, setDuration] = useState('Full Leave');
  const [reason, setReason] = useState('Medical Leave');
  const [dateRange, setDateRange] = useState({
    fromDate: null,
    toDate: null,
  });
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // function to calculate leave  
  const calculateLeave = (duration, fromDate, toDate) => {
    if (!fromDate) return 0;

    if (duration === 'First Half' || duration === 'Second Half') {
      return 0.5;
    }

    // Full leave
    const start = moment(fromDate, 'YYYY-MM-DD');
    const end = toDate ? moment(toDate, 'YYYY-MM-DD') : start;

    let count = 0;
    let current = start.clone();

    while (current <= end) {
      const day = current.day(); // 0=Sunday, 6=Saturday
      if (day !== 0 && day !== 6) count += 1;
      current.add(1, 'days');
    }

    return count;
  };

  // Derived leave count
  const leaveCount = calculateLeave(duration, dateRange.fromDate, dateRange.toDate);

  // Reset function to clear all states
  const resetForm = () => {
    setDuration('Full Leave');
    setReason('Medical Leave');
    setDateRange({ fromDate: null, toDate: null });
    setText('');
  };
  
  const handleApplyLeave = async () => {

    // Validate
    if (!dateRange.fromDate) {
      Alert.alert("Missing Information", "Please select a leave date.");
      return;
    }
    if (leaveCount <= 0) {
      Alert.alert("Invalid Selection", "Selected dates fall on weekends.");
      return;
    }

  setLoading(true);

  // data for API body  
  const leaveData = {
      fromDate: dateRange.fromDate,
      toDate: duration === 'Full Leave' ? (dateRange.toDate || dateRange.fromDate) : dateRange.fromDate, // same day for half
      status: "pending",
      reasondescription: text,
      duration: duration,
      leaveRequired: leaveCount,
      leaveType: reason,
    };

    try {
      const response = await createLeaveRequest(leaveData);
      Alert.alert(
        "Success",
        "Your leave application has been submitted successfully.",
        [{ text: "OK", onPress: () => resetForm() }]
      );
    } catch (error) {
      const errorMessage = error?.message || "Something went wrong.";
      Alert.alert("Submission Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ backgroundColor: '#ffffff' }}>
        <View><Text>Leave Duration</Text></View>
        <CustomPicker 
        placeholder="Select Leave Duration"
        options={['Full Leave', 'First Half', 'Second Half']}
        selectedValue={duration}
        onValueChange={(val) => {
          setDuration(val);
          setDateRange({ fromDate: null, toDate: null });
        }}
        />

        <View><Text>Leave Reason</Text></View>
        <CustomPicker 
        placeholder="Select Leave Reason"
        options={['Medical Leave', 'Emergency Leave', 'Casual Leave']}
        selectedValue={reason}
        onValueChange={(val) => {
          setReason(val);
          setDateRange({ fromDate: null, toDate: null });
        }}
        />

        <View><Text>Date Range</Text></View>
        <DateRangePicker 
        value={dateRange}
        allowRange={duration === 'Full Leave'}
        duration={duration}
        onChange={setDateRange} />
        <View><Text>Leave Count: {leaveCount}</Text></View>
        <View><Text>Leave Reason</Text></View>
        <View style={styles.inputContainer}> 
          <TextInput style={styles.input} onChangeText={setText} value={text} placeholder='What is the reason for leave?' keyboardType="default" />
        </View>

        <TouchableOpacity 
        style={[
          styles.submitBtn,
        ]}
        onPress={handleApplyLeave}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.submitText, { marginLeft: 8 }]}>
                Applying...
                </Text>
              </View>
              ) : (
              <Text style={styles.submitText}>Apply for Leave</Text>
              )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  inputContainer: { marginHorizontal: 15, paddingHorizontal: 15, borderRadius: 25, borderColor: '#D1D1D1', borderWidth: 1},
  input: { fontSize: 16, fontFamily: 'Poppins-Regular', textAlign: 'center'},
  submitBtn: { backgroundColor: '#007AFF', alignItems: 'center', marginStart: 15, borderBottomLeftRadius: 25, borderTopLeftRadius: 25, marginVertical: 15, padding: 10},
  submitText: { fontFamily: 'Poppins-Regular', fontSize: 16, textAlign: 'center'},
})