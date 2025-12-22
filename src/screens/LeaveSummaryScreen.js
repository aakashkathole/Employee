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
});