import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPicker from "../components/CustomPicker";
import DateRangePicker from "../components/DateRangePicker";
import moment from 'moment';

export default function ApplyLeaveScreen() {

  const [duration, setDuration] = useState('Full Leave');
  const [reason, setReason] = useState('Medical Leave');
  const [dateRange, setDateRange] = useState({
    fromDate: null,
    toDate: null,
  });

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

  const handleApplyLeave = () => {
    const payload = {
      leaveDuration: duration,
      leaveReason: reason,
      fromDate: dateRange.fromDate,
      toDate: duration === 'Full Leave' ? dateRange.toDate : dateRange.fromDate, // same day for half
      leaveCount: leaveCount,
    };

    console.log("API Payload:", payload);
    // API call here
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView Style={{ backgroundColor: '#ffffff' }}>
        <View><Text>Leave Duration</Text></View>
        <CustomPicker 
        placeholder="Select Leave Duration"
        options={['Full Leave', 'First Half', 'Second Half']}
        selectedValue={duration}
        onValueChange={(val) => setDuration(val)}
        />

        <View><Text>Leave Reason</Text></View>
        <CustomPicker 
        placeholder="Select Leave Reason"
        options={['Medical Leave', 'Emergency Leave', 'Casual Leave']}
        selectedValue={reason}
        onValueChange={(val) => setReason(val)}
        />

        <View><Text>Date Range</Text></View>
        <DateRangePicker 
        allowRange={duration === 'Full Leave'}
        onChange={setDateRange} />
        <View><Text>Leave Count: {leaveCount}</Text></View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})