import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaveSummary, fetchAllLeavesByEmployeeId } from '../Services/leaveService';

export default function LeaveSummaryScreen() {
  const [leaveData, setLeaveData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // fetch leave summary data and leave list
  const loadData = async () => {
    try {
      setRefreshing(true);
      // calling both API same time for better performance
      const [summary, history] = await Promise.all([
        fetchLeaveSummary(),
        fetchAllLeavesByEmployeeId()
      ]);
      
      setLeaveData(summary);
      setLeaves(history);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch leave data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <View style={styles.viewContainer}>
          <View style={styles.viewCard}>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.totalPaidLeaves}</Text>
              <Text style={styles.leaveText}>Total Paid Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.totalUnpaidLeaves}</Text>
              <Text style={styles.leaveText}>Total Unpaid Leaves</Text>
            </View>
          </View>
          <View style={styles.viewCard}>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.totalAppliedLeaves}</Text>
              <Text style={styles.leaveText}>Total Applied Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.paidLeave}</Text>
              <Text style={styles.leaveText}>Paid Leaves</Text>
            </View>
          </View>
          <View style={styles.viewCard}>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.unpaidLeave}</Text>
              <Text style={styles.leaveText}>Unpaid Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.leaveText}>{leaveData?.remaingPaidLeave}</Text>
              <Text style={styles.leaveText}>Remaining Paid Leaves</Text>
            </View>          
        </View>
        </View>

        {/* --- Table Section --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.headerText, { width: 40 }]}>ID</Text>
              <Text style={[styles.headerText, { width: 100 }]}>Duration</Text>
              <Text style={[styles.headerText, { width: 100 }]}>Applied Date</Text>
              <Text style={[styles.headerText, { width: 100 }]}>From Date</Text>
              <Text style={[styles.headerText, { width: 100 }]}>To Date</Text>
              <Text style={[styles.headerText, { width: 120 }]}>Leave Type</Text>
              <Text style={[styles.headerText, { width: 150 }]}>Reason</Text>
              <Text style={[styles.headerText, { width: 60 }]}>Days</Text>
              <Text style={[styles.headerText, { width: 90 }]}>Status</Text>
            </View>

            {/* Data Rows */}
            {leaves.length > 0 ? (
              leaves.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 40 }]}>{item.id}</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>{item.duration}</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>{item.leaveRequestDate}</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>{item.fromDate}</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>{item.toDate}</Text>
                  <Text style={[styles.tableCell, { width: 120 }]}>{item.leaveType}</Text>
                  <Text style={[styles.tableCell, { width: 150 }]} numberOfLines={1}>{item.reasondescription}</Text>
                  <Text style={[styles.tableCell, { width: 60, textAlign: 'center' }]}>{item.leaveRequired}</Text>
                  <Text style={[
                    styles.tableCell, 
                    { width: 90, fontWeight: 'bold', color: item.status === 'pending' ? '#f39c12' : '#28a745' }
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ padding: 20, textAlign: 'center' }}>No leave records found.</Text>
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 10,
    backgroundColor: '#ffffff'
  },
  //
  viewContainer: {
    borderRadius: 25,
    backgroundColor: '#F5F7FA',
  },
  viewCard: {
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 6
  },
  card: {
    borderRadius: 25,
    padding: 3,
    borderWidth: 0.5,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  leaveText: {
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    paddingHorizontal: 10,
  },

  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#eee', marginTop: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  tableHeader: { backgroundColor: '#f0f0f0', borderBottomWidth: 2, borderColor: '#ccc' },
  headerText: { padding: 10, fontWeight: 'bold', fontSize: 13, color: '#333', borderRightWidth: 1, borderColor: '#eee' },
  tableCell: { padding: 10, fontSize: 12, color: '#444', borderRightWidth: 1, borderColor: '#eee' },
})