import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMemo } from '../Services/memoService';

export default function MemoScreen() {
  const [memo, setMemo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchMemo();
      setMemo(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch Memo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show a loader while fetching first time
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
            <Text style={[styles.headerText, { width: 50 }]}>No.</Text>
            <Text style={[styles.headerText, { width: 100 }]}>Memo Name</Text>
            <Text style={[styles.headerText, { width: 250 }]}>Description</Text>
            <Text style={[styles.headerText, { width: 100 }]}>Date</Text>
          </View>

          {/* Data Rows */}
          {memo.length > 0 ? (
            memo.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 50 }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: 100 }]}>{item.memoName || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: 250 }]}>{item.memoDescription || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: 100 }]}>{item.createdAt || 'N/A'}</Text>   
              </View>
            ))
          ) : (
            <View style={{ width: 420 }}>
               <Text style={styles.emptyText}>No memo found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
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