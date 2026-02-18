import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, UIManager, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchMemo } from '../Services/memoService';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MemoScreen() {
  const [memo, setMemo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const navigation = useNavigation();

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

  useEffect(() => { loadData(); }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  };

  const renderMemoCard = ({ item, index }) => {
    const cardKey = item.id?.toString() || index.toString();
    const isExpanded = expandedId === cardKey;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(cardKey)}
        activeOpacity={0.75}
      >
        {/* Collapsed Row */}
        <View style={styles.cardRow}>
          {/* Left: icon + index badge */}
          <View style={styles.badgeWrap}>
            <MaterialCommunityIcons name="note-text-outline" size={15} color="#007bff" />
            <Text style={styles.cardNumber}>{index + 1}</Text>
          </View>

          {/* Middle: memo name + date */}
          <View style={styles.cardMeta}>
            <Text style={styles.memoName} numberOfLines={1}>
              {item.memoName || 'Untitled Memo'}
            </Text>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="calendar-outline" size={11} color="#aaa" />
              <Text style={styles.cardDate}> {formatDate(item.createdAt)}</Text>
            </View>
          </View>

          {/* Right: chevron */}
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#007bff"
          />
        </View>

        {/* Expanded: description */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.descHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={13} color="#999" />
              <Text style={styles.descLabel}> Description</Text>
            </View>
            <Text style={styles.description}>
              {item.memoDescription || 'No description available.'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="note-off-outline" size={56} color="#ccc" />
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>Memos</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {memo.length} {memo.length === 1 ? 'memo' : 'memos'}
          </Text>
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 8, fontFamily: 'Poppins-Regular', fontSize: 13, color: '#666' },
  // Header
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontFamily: 'Poppins-Bold', fontSize: 20, color: '#222' },
  backBtn: { marginRight: 4, padding: 4, backgroundColor: '#2563eb', borderRadius: 8, },
  countBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, },
  countText: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#007bff' },
  // List
  listContent: { paddingHorizontal: 12, paddingVertical: 8, flexGrow: 1 },
  // Card
  card: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: '#007bff', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // Badge
  badgeWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, gap: 3, },
  cardNumber: { fontFamily: 'Poppins-SemiBold', fontSize: 11, color: '#007bff' },
  // Meta
  cardMeta: { flex: 1 },
  memoName: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#222', marginBottom: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  cardDate: { fontFamily: 'Poppins-Regular', fontSize: 11, color: '#aaa' },
  // Expanded
  expandedSection: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', },
  descHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  descLabel: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.4 },
  description: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#555', lineHeight: 18 },
  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#333', marginTop: 10, marginBottom: 4 },
  emptySubtitle: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#999' },
});