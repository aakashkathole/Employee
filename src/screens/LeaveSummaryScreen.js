import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchLeaveSummary, fetchAllLeavesByEmployeeId } from '../Services/leaveService';
import { useNavigation } from '@react-navigation/native';

export default function LeaveSummaryScreen() {
  const [leaveData, setLeaveData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigation = useNavigation();

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

  // Get status styling
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch(statusLower) {
      case 'approved':
        return { color: '#28a745', bgColor: '#E8F5E9', icon: 'check-circle' };
      case 'pending':
        return { color: '#f39c12', bgColor: '#FFF3E0', icon: 'clock-outline' };
      case 'rejected':
        return { color: '#dc3545', bgColor: '#FFEBEE', icon: 'close-circle' };
      default:
        return { color: '#6c757d', bgColor: '#F5F5F5', icon: 'help-circle' };
    }
  };

  // Filter leaves
  const filteredLeaves = (filterStatus === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status?.toLowerCase() === filterStatus))
    .sort((a, b) => {
      // sort most recent first
      const dateA = new Date(a.leaveRequestDate);
      const dateB = new Date(b.leaveRequestDate);
      return dateB - dateA; // descending order
    });

  // Loading State with Skeleton
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0B5D69" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#0B5D69']}
            tintColor="#0B5D69"
          />
        }
      >

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave Detail's</Text>
        </View>

        {/* COMPACT HEADER WITH INLINE BALANCE */}
        <View style={styles.compactHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.screenTitle}>Leave Summary</Text>
            <View style={styles.balanceInline}>
              <MaterialCommunityIcons name="calendar-check" size={16} color="#0B5D69" />
              <Text style={styles.balanceText}>
                <Text style={styles.balanceValue}>{leaveData?.remaingPaidLeave || 0}</Text> days remaining
              </Text>
            </View>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalValue}>{leaveData?.totalPaidLeaves || 0}</Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>

        {/* COMPACT 4-COLUMN GRID */}
        <View style={styles.compactGrid}>
          {/* Used */}
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="calendar-minus" size={18} color="#FF9800" />
            <Text style={styles.miniValue}>{leaveData?.totalAppliedLeaves || 0}</Text>
            <Text style={styles.miniLabel}>Applied</Text>
          </View>

          {/* Paid Used */}
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="cash-check" size={18} color="#28a745" />
            <Text style={styles.miniValue}>{leaveData?.paidLeave || 0}</Text>
            <Text style={styles.miniLabel}>Paid</Text>
          </View>

          {/* Unpaid Used */}
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="cash-remove" size={18} color="#dc3545" />
            <Text style={styles.miniValue}>{leaveData?.unpaidLeave || 0}</Text>
            <Text style={styles.miniLabel}>Unpaid</Text>
          </View>

          {/* Balance */}
          <View style={styles.miniCard}>
            <MaterialCommunityIcons name="calendar-today" size={18} color="#0B5D69" />
            <Text style={styles.miniValue}>{leaveData?.remaingPaidLeave || 0}</Text>
            <Text style={styles.miniLabel}>Remaining</Text>
          </View>
        </View>

        {/* COMPACT FILTER SECTION */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}> ({filteredLeaves.length})</Text>
          <View style={styles.filterChips}>
            {['all', 'approved', 'pending', 'rejected'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                onPress={() => setFilterStatus(status)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LEAVE CARDS */}
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const isExpanded = expandedId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.compactLeaveCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                {/* Single Row Layout */}
                <View style={styles.cardMainRow}>
                  <View style={styles.cardLeft}>
                    <View style={styles.typeStatusRow}>
                      <Text style={styles.leaveType}>{item.leaveType}</Text>
                      <View style={[styles.miniStatusBadge, { backgroundColor: statusStyle.bgColor }]}>
                        <MaterialCommunityIcons name={statusStyle.icon} size={10} color={statusStyle.color} />
                        <Text style={[styles.statusTextMini, { color: statusStyle.color }]}>
                          {item.status?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dateRowCompact}>
                      <Text style={styles.dateTextCompact}>{item.fromDate} → {item.toDate}</Text>
                      <Text style={styles.daysTextCompact}>• {item.leaveRequired}d</Text>
                    </View>
                  </View>
                  
                  <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#0078D4" 
                  />
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.expandedCompact}>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Applied:</Text>
                      <Text style={styles.expandedValue}>{item.leaveRequestDate}</Text>
                    </View>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Duration:</Text>
                      <Text style={styles.expandedValue}>{item.duration}</Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <Text style={styles.expandedLabel}>Reason:</Text>
                      <Text style={styles.reasonTextCompact}>{item.reasondescription}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={40} color="#CCC" />
            <Text style={styles.emptyText}>
              {filterStatus === 'all' 
                ? "No leave records yet" 
                : `No ${filterStatus} leaves`}
            </Text>
          </View>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: {  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#666', marginTop: 8 },
  // Header
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0', gap: 8 },
  backBtn: { marginRight: 4, padding: 4, backgroundColor: "#2563eb", borderRadius: 8, },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#1A1A1A', marginBottom: 5, },
  // COMPACT HEADER
  compactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, marginHorizontal: 12, marginTop: 12 },
  headerLeft: { flex: 1 },
  screenTitle: { fontFamily: 'Poppins-Bold', fontSize: 20, color: '#222', marginBottom: 2 },
  balanceInline: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  balanceText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#666', marginLeft: 4 },
  balanceValue: { fontFamily: 'Poppins-Bold', fontSize: 15, color: '#0B5D69' },
  totalBadge: { backgroundColor: '#0B5D69', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 60 },
  totalValue: { fontFamily: 'Poppins-Bold', fontSize: 22, color: '#fff' },
  totalLabel: { fontFamily: 'Poppins-Regular', fontSize: 10, color: '#fff', opacity: 0.9 },
  // COMPACT 4-COLUMN GRID
  compactGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 12, },
  miniCard: { width: '24%', backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, alignItems: 'center' },
  miniValue: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#222', marginTop: 4, marginBottom: 2 },
  miniLabel: { fontFamily: 'Poppins-Regular', fontSize: 10, color: '#666', textAlign: 'center' },
  // FILTER SECTION
  filterSection: { marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#222' },
  filterChips: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, backgroundColor: '#fff', marginLeft: 6, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChipActive: { backgroundColor: '#0B5D69', borderColor: '#0B5D69' },
  filterChipText: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#666' },
  filterChipTextActive: { color: '#fff' },
  // ULTRA COMPACT LEAVE CARDS
  compactLeaveCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 12, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  cardLeft: { flex: 1 },
  typeStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  leaveType: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#222', marginRight: 8 },
  miniStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  statusTextMini: { fontFamily: 'Poppins-SemiBold', fontSize: 9, marginLeft: 3 },
  dateRowCompact: { flexDirection: 'row', alignItems: 'center' },
  dateTextCompact: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#666' },
  daysTextCompact: { fontFamily: 'Poppins-SemiBold', fontSize: 11, color: '#2196F3', marginLeft: 6 },
  // EXPANDED SECTION
  expandedCompact: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0'  },
  expandedRow: { flexDirection: 'row', marginBottom: 4 },
  expandedLabel: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#666', width: 70 },
  expandedValue: { fontFamily: 'Poppins-Regular', fontSize: 11, color: '#222', flex: 1 },
  reasonRow: { marginTop: 4 },
  reasonTextCompact: { fontFamily: 'Poppins-Regular', fontSize: 11, color: '#444', lineHeight: 16, marginTop: 2 }, 
  // EMPTY STATE
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#999', marginTop: 8 }
});