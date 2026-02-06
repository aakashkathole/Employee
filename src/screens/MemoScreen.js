import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMemoPress = (item) => {
    // Navigate to detail screen or show modal
    Alert.alert(item.memoName, item.memoDescription);
  };

  const renderMemoCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleMemoPress(item)}
      activeOpacity={0.7}
    >
      {/* Card Header with Number and Date */}
      <View style={styles.cardTopRow}>
        <Text style={styles.cardNumber}>#{index + 1}</Text>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* Memo Name Section */}
      <View style={styles.cardSection}>
        <Text style={styles.label}>Memo Name</Text>
        <Text style={styles.memoName} numberOfLines={2}>
          {item.memoName || 'Untitled Memo'}
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.cardSection}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.memoDescription || 'No description available'}
        </Text>
      </View>

      {/* Tap Indicator */}
      <Text style={styles.tapHint}>Tap to view details</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No Memos Yet</Text>
      <Text style={styles.emptySubtitle}>Your memos will appear here</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading memos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memos</Text>
        <Text style={styles.headerSubtitle}>
          {memo.length} {memo.length === 1 ? 'memo' : 'memos'} total
        </Text>
      </View>

      {/* Memos List */}
      <FlatList
        data={memo}
        renderItem={renderMemoCard}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', },
  loadingText: { marginTop: 12, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', },
  // Header Styles
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1, shadowRadius: 2, },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 24, color: '#333', marginBottom: 4, },
  headerSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', },
  // List Styles
  listContent: { padding: 16, flexGrow: 1, },
  // Card Styles
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, borderLeftWidth: 4, borderLeftColor: '#007bff', },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  cardNumber: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#007bff', backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, },
  cardDate: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#999', },
  // Card Section Styles
  cardSection: { marginBottom: 12, },
  label: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, },
  memoName: { fontFamily: 'Poppins-SemiBold', fontSize: 17, color: '#333', lineHeight: 24, },
  description: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', lineHeight: 20, },
  tapHint: { fontFamily: 'Poppins-Regular', fontSize: 11, color: '#007bff', textAlign: 'right', marginTop: 4, fontStyle: 'italic', },
  // Empty State Styles
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, },
  emptyIcon: { fontSize: 64, marginBottom: 16, },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', marginBottom: 8, },
  emptySubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#999', },
});