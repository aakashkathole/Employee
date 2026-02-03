import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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

  // Check if form is valid
  const isFormValid = dateRange.fromDate && leaveCount > 0 && text.trim().length > 0;

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
    if (!text.trim()) {
      Alert.alert("Missing Information", "Please provide a reason for your leave.");
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Apply for Leave</Text>
          <Text style={styles.headerSubtitle}>Fill in the details below to submit your leave request</Text>
        </View>

        {/* Leave Duration Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons name="clock-outline" size={22} color="#007AFF" style={styles.icon} />
            <Text style={styles.label}>Leave Duration</Text>
          </View>
          <CustomPicker 
            placeholder="Select Leave Duration"
            options={['Full Leave', 'First Half', 'Second Half']}
            selectedValue={duration}
            onValueChange={(val) => {
              setDuration(val);
              setDateRange({ fromDate: null, toDate: null });
            }}
          />
        </View>

        {/* Leave Reason Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#007AFF" style={styles.icon} />
            <Text style={styles.label}>Leave Type</Text>
          </View>
          <CustomPicker 
            placeholder="Select Leave Type"
            options={['Medical Leave', 'Emergency Leave', 'Casual Leave']}
            selectedValue={reason}
            onValueChange={(val) => {
              setReason(val);
            }}
          />
        </View>

        {/* Date Range Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons name="calendar-range" size={22} color="#007AFF" style={styles.icon} />
            <Text style={styles.label}>Select Dates</Text>
          </View>
          <DateRangePicker 
            value={dateRange}
            allowRange={duration === 'Full Leave'}
            duration={duration}
            onChange={setDateRange} 
          />
        </View>

        {/* Date Summary Card */}
        {dateRange.fromDate && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From:</Text>
              <Text style={styles.summaryValue}>
                {moment(dateRange.fromDate, 'YYYY-MM-DD').format('MMM DD, YYYY')}
              </Text>
            </View>
            {duration === 'Full Leave' && dateRange.toDate && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>
                  {moment(dateRange.toDate, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                </Text>
              </View>
            )}
            {duration !== 'Full Leave' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>{duration}</Text>
              </View>
            )}
          </View>
        )}

        {/* Leave Count Badge */}
        <View style={styles.leaveCountContainer}>
          {!dateRange.fromDate ? (
            <View style={styles.hintCard}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#92400E" style={{ marginRight: 8 }} />
              <Text style={styles.hintText}>
                Please select your leave dates to see calculated days
              </Text>
            </View>
          ) : (
            <View style={[
              styles.leaveCountBadge, 
              leaveCount === 0 ? styles.leaveCountBadgeInvalid : styles.leaveCountBadgeValid
            ]}>
              <MaterialCommunityIcons 
                name={leaveCount === 0 ? "alert-circle" : "check-circle"} 
                size={28} 
                color={leaveCount === 0 ? "#DC2626" : "#10B981"} 
                style={styles.leaveCountIconElement}
              />
              <View>
                <Text style={styles.leaveCountLabel}>Total Leave Days</Text>
                <Text style={styles.leaveCountValue}>
                  {leaveCount} {leaveCount === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
          )}
          {leaveCount === 0 && dateRange.fromDate && (
            <View style={styles.warningContainer}>
              <MaterialCommunityIcons name="alert" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.warningText}>
                Selected dates fall on weekends. Please choose weekdays.
              </Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <MaterialCommunityIcons name="text-box-outline" size={22} color="#007AFF" style={styles.icon} />
            <Text style={styles.label}>Additional Details</Text>
          </View>
          <View style={styles.textInputContainer}> 
            <TextInput 
              style={styles.textInput} 
              onChangeText={setText} 
              value={text} 
              placeholder='Describe the reason for your leave request...' 
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.clearBtn}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.clearText}>Clear Form</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.submitBtn,
              (!isFormValid || loading) && styles.submitBtnDisabled
            ]}
            onPress={handleApplyLeave}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.submitText, { marginLeft: 8 }]}>
                  Submitting...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Apply for Leave</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', },
  scrollView: { flex: 1, backgroundColor: '#F5F7FA', },
  // Header Styles
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0', },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins-SemiBold', color: '#1A1A1A', marginBottom: 5, },
  headerSubtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280', },
  // Section Styles
  section: { marginTop: 20, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
  icon: { marginRight: 8, },
  label: { fontSize: 16, fontFamily: 'Poppins-Medium', color: '#374151', },
  // Summary Card
  summaryCard: { marginTop: 15, marginHorizontal: 20, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#BFDBFE', },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, },
  summaryLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#1E40AF', },
  summaryValue: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1E3A8A', },
  // Leave Count Styles
  leaveCountContainer: { marginTop: 15, marginHorizontal: 20, },
  leaveCountBadge: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, },
  leaveCountBadgeValid: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7', },
  leaveCountBadgeInvalid: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', },
  leaveCountIconElement: { marginRight: 12, },
  leaveCountLabel: {  fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280', marginBottom: 2, },
  leaveCountValue: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#1A1A1A', },
  hintCard: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', alignItems: 'center', },
  hintText: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#92400E', },
  warningContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, },
  warningText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#DC2626', flex: 1, },
  // Text Input Styles
  textInputContainer: { borderRadius: 12, borderColor: '#D1D5DB', borderWidth: 1, backgroundColor: '#F9FAFB', padding: 4, },
  textInput: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#1F2937', paddingHorizontal: 12, paddingVertical: 12, minHeight: 100, },
  // Button Styles
  buttonContainer: { flexDirection: 'row', marginTop: 25, marginHorizontal: 20, gap: 12, },
  clearBtn: { flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#D1D5DB', },
  clearText: { fontFamily: 'Poppins-Medium', fontSize: 16, color: '#6B7280', },
  submitBtn: { flex: 2, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, },
  submitBtnDisabled: { backgroundColor: '#9CA3AF', opacity: 0.6, shadowOpacity: 0, elevation: 0, },
  submitText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#fff', },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', },
});