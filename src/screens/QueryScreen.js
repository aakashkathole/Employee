import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllQueries } from '../Services/queryService';
import { createNewQuery } from '../Services/queryService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function QueryScreen() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true); // for fetching list
  const [submitting, setSubmitting] = useState(false); // for submit button
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const loadData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchAllQueries();
      setQueries(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch Query's.");
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

  const handleSubmitQuery = async () => {
    // Validate
    if (!query || query.trim().length === 0) {
      Alert.alert("Missing Information", "What is the Query ?");
      return;
    }

    setSubmitting(true);

    const queryData = {
      query: query.trim(),
    };

    try {
      await createNewQuery(queryData);
      Alert.alert(
        "Success",
        "your query has been submitted successfully.",
        [{text: "OK", onPress: () => setQuery('')}]
      );

      loadData(); // refresh list after submit

    } catch (error) {
      Alert.alert("Submission Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
      contentContainerStyle={{ backgroundColor: '#ffffff' }}

      refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
      >

        <View style={styles.container}>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} onChangeText={setQuery} value={query} placeholder='What is the Query ?' keyboardType="default" />
            </View>
            <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmitQuery}
            activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={'#000080'} />
              ) : (
                <MaterialCommunityIcons name={'send'} size={34} color="#000080" />
              )}
            </TouchableOpacity>
          </View>

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
    </ScrollView>  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tableContainer: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#eee', margin: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderColor: '#ccc' },
  headerText: { padding: 12, fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#333', borderRightWidth: 1, borderColor: '#eee', textAlign: 'center' },
  tableCell: { padding: 12, fontFamily: 'Poppins-Regular', fontSize: 12, color: '#444', borderRightWidth: 1, borderColor: '#eee', textAlign: 'center' },
  emptyText: { padding: 20, textAlign: 'center', color: '#999' },
  container: { paddingHorizontal: 10, paddingVertical: 25, flexDirection: 'row', },
  inputContainer: { borderWidth: 1, borderColor: '#D1D1D1', width: '80%', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 25, borderBottomLeftRadius: 25 },
  input: { fontFamily: 'Poppins-Regular', fontSize: 16 },
  btn: { borderWidth: 1, borderColor: '#D1D1D1', justifyContent: 'center', alignItems: 'center', width: '20%', borderTopRightRadius: 25, borderBottomEndRadius: 25 }
});