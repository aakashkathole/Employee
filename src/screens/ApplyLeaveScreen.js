import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomPicker from "../components/CustomPicker";

export default function ApplyLeaveScreen() {

  const [duration, setDuration] = useState('Full Leave');
  const [reason, setReason] = useState('Medical Leave');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView Style={{ backgroundColor: '#ffffff' }}>
        <CustomPicker 
        placeholder="Select Leave Duration"
        options={['Full Leave', 'First Half', 'Second Half']}
        selectedValue={duration}
        onValueChange={(val) => setDuration(val)}
        />

        <CustomPicker 
        placeholder="Select Leave Reason Type"
        options={['Medical Leave', 'Emergency Leave', 'Casual Leave']}
        selectedValue={reason}
        onValueChange={(val) => setReason(val)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})