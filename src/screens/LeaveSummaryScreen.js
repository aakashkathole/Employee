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

        <View>
          <Text>{leaveData?.totalPaidLeaves}</Text>
          <Text>{leaveData?.totalUnpaidLeaves}</Text>
          <Text>{leaveData?.totalAppliedLeaves}</Text>
          <Text>{leaveData?.paidLeave}</Text>
          <Text>{leaveData?.unpaidLeave}</Text>
          <Text>{leaveData?.remaingPaidLeave}</Text>          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 10,
  },
});