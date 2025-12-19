import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLeaveSummary } from '../Services/leaveService';

export default function LeaveSummaryScreen() {
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // fetch data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const data = await fetchLeaveSummary();
      setLeaveData(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch leave summary.");
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
              <Text>{leaveData?.totalPaidLeaves}</Text>
              <Text>Total Paid Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text>{leaveData?.totalUnpaidLeaves}</Text>
              <Text>Total Unpaid Leaves</Text>
            </View>
          </View>
          <View style={styles.viewCard}>
            <View style={styles.card}>
              <Text>{leaveData?.totalAppliedLeaves}</Text>
              <Text>Total Applied Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text>{leaveData?.paidLeave}</Text>
              <Text>Paid Leaves</Text>
            </View>
          </View>
          <View style={styles.viewCard}>
            <View style={styles.card}>
              <Text>{leaveData?.unpaidLeave}</Text>
              <Text>Unpaid Leaves</Text>
            </View>
            <View style={styles.card}>
              <Text>{leaveData?.remaingPaidLeave}</Text>
              <Text>Remaining Paid Leaves</Text>
            </View>          
        </View>
        </View>
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
    margin: 10,
    padding: 10,
    backgroundColor: '#F5F7FA',
    justifyContent: 'space-evenly',
    borderWidth: 1
  },
  viewCard: {
    borderRadius: 25,
    padding: 10,
    backgroundColor: '#a3a3a329',
    flexDirection: 'row',
    borderWidth: 1
  },
  card: {
    borderWidth: 1,
  },
});