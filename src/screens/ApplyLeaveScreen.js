import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPicker from "../components/CustomPicker";
import DateRangePicker from "../components/DateRangePicker";

export default function ApplyLeaveScreen() {

  const [duration, setDuration] = useState('Full Leave');
  const [reason, setReason] = useState('Medical Leave');
  const [dateRange, setDateRange] = useState({
    fromDate: null,
    toDate: null,
  });

  const handleApplyLeave = () => {
    const payload = {
      leaveDuration: duration,
      leaveReason: reason,
      fromDate: dateRange.fromDate,
      toDate: duration === 'Full Leave' ? dateRange.toDate : dateRange.fromDate, // same day for half
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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})