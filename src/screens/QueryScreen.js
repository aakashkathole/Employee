import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllQueries } from '../Services/queryService';

export default function QueryScreen() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchAllQueries();
      setQueries(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show a loader while fetching the first time
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
      contentContainerStyle={{ backgroundColor: '#ffffff' }}

      refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
      >
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.headerText, { width: 65 }]}>Sr. No</Text>
            <Text style={[styles.headerText, { width: 300 }]}>Query</Text>
            <Text style={[styles.headerText, { width: 120 }]}>Created Date</Text>
            <Text style={[styles.headerText, { width: 100 }]}>Actions</Text>
          </View>

          {/* Data Rows */}
          {queries.length > 0 ? (
            queries.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 65 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: 300 }]}>{item.query || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: 120 }]}>{item.date || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: 100 }]}>View</Text>
              </View>
            ))
          ) : (
            <View style={{ width: 420 }}>
               <Text style={styles.emptyText}>No query records found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View>
        <Text>
          New Query
        </Text>
      </View>
    </ScrollView>  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#eee', margin: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderColor: '#ccc' },
  headerText: { padding: 12, fontWeight: 'bold', fontSize: 13, color: '#333', borderRightWidth: 1, borderColor: '#eee', textAlign: 'center' },
  tableCell: { padding: 12, fontSize: 12, color: '#444', borderRightWidth: 1, borderColor: '#eee', textAlign: 'center' },
  emptyText: { padding: 20, textAlign: 'center', color: '#999' }
});