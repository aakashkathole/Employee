import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchLeaveSummary, fetchAllLeavesByEmployeeId } from '../Services/leaveService';

export default function LeaveSummaryScreen() {
  const [leaveData, setLeaveData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

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
  const filteredLeaves = filterStatus === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status?.toLowerCase() === filterStatus);

  // Loading State with Skeleton
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color="#0B5D69" />
          </View>
          <Text style={styles.loadingText}>Loading leave data...</Text>
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

        {/* HEADER */}
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Leave Summary</Text>
          <Text style={styles.screenSubtitle}>Track your leave balance and history</Text>
        </View>

        {/* PRIMARY CARD - Remaining Balance */}
        <View style={styles.primaryCard}>
          <View style={styles.primaryCardContent}>
            <Text style={styles.primaryLabel}>Remaining Paid Leaves</Text>
            <Text style={styles.primaryValue}>{leaveData?.remaingPaidLeave || 0}</Text>
            <Text style={styles.primarySubtext}>days available</Text>
          </View>
          <View style={styles.primaryIconCircle}>
            <MaterialCommunityIcons name="calendar-check" size={32} color="#FFFFFF" />
          </View>
        </View>

        {/* SUMMARY CARDS GRID */}
        <View style={styles.summaryGrid}>
          {/* Annual Allocation */}
          <View style={styles.summaryCard}>
            <View style={styles.cardIconSmall}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#0B5D69" />
            </View>
            <Text style={styles.cardValue}>{leaveData?.totalPaidLeaves || 0}</Text>
            <Text style={styles.cardLabel}>Annual Allocation</Text>
          </View>

          {/* Used Leaves */}
          <View style={styles.summaryCard}>
            <View style={styles.cardIconSmall}>
              <MaterialCommunityIcons name="calendar-minus" size={20} color="#FF9800" />
            </View>
            <Text style={styles.cardValue}>{leaveData?.totalAppliedLeaves || 0}</Text>
            <Text style={styles.cardLabel}>Total Applied</Text>
          </View>

          {/* Paid Used */}
          <View style={styles.summaryCard}>
            <View style={styles.cardIconSmall}>
              <MaterialCommunityIcons name="cash-check" size={20} color="#28a745" />
            </View>
            <Text style={styles.cardValue}>{leaveData?.paidLeave || 0}</Text>
            <Text style={styles.cardLabel}>Paid Leaves Used</Text>
          </View>

          {/* Unpaid Used */}
          <View style={styles.summaryCard}>
            <View style={styles.cardIconSmall}>
              <MaterialCommunityIcons name="cash-remove" size={20} color="#dc3545" />
            </View>
            <Text style={styles.cardValue}>{leaveData?.unpaidLeave || 0}</Text>
            <Text style={styles.cardLabel}>Unpaid Leaves</Text>
          </View>
        </View>

        {/* FILTER SECTION */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Leave History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {['all', 'approved', 'pending', 'rejected'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                onPress={() => setFilterStatus(status)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LEAVE HISTORY CARDS */}
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const isExpanded = expandedId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.leaveCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.leaveCardHeader}>
                  <View style={styles.leaveCardLeft}>
                    <View style={styles.leaveTypeChip}>
                      <MaterialCommunityIcons name="tag" size={14} color="#0B5D69" />
                      <Text style={styles.leaveTypeText}>{item.leaveType}</Text>
                    </View>
                    <Text style={styles.leaveDuration}>{item.duration}</Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
                    <MaterialCommunityIcons name={statusStyle.icon} size={14} color={statusStyle.color} />
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.leaveCardBody}>
                  <View style={styles.dateRow}>
                    <MaterialCommunityIcons name="calendar-range" size={16} color="#666" />
                    <Text style={styles.dateText}>{item.fromDate} → {item.toDate}</Text>
                    <View style={styles.daysChip}>
                      <Text style={styles.daysText}>{item.leaveRequired} days</Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Applied on:</Text>
                        <Text style={styles.detailValue}>{item.leaveRequestDate}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="text-box" size={16} color="#666" />
                        <Text style={styles.detailLabel}>Reason:</Text>
                      </View>
                      <Text style={styles.reasonText}>{item.reasondescription}</Text>
                    </View>
                  )}
                </View>

                {/* Expand/Collapse Indicator */}
                <View style={styles.expandIndicator}>
                  <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#999" 
                  />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#0B5D69" />
            </View>
            <Text style={styles.emptyTitle}>No Leave Records</Text>
            <Text style={styles.emptySubtitle}>
              {filterStatus === 'all' 
                ? "You haven't applied for any leaves yet" 
                : `No ${filterStatus} leaves found`}
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', marginTop: 8 },
  headerSection: { marginBottom: 20 },
  screenTitle: { fontFamily: 'Poppins-Bold', fontSize: 26, color: '#222', marginBottom: 4 },
  screenSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666' },
  primaryCard: { backgroundColor: '#0B5D69', borderRadius: 20, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#0B5D69', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryCardContent: { flex: 1 },
  primaryLabel: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#fff', opacity: 0.9 },
  primaryValue: { fontFamily: 'Poppins-Bold', fontSize: 48, color: '#fff', marginVertical: 4 },
  primarySubtext: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#fff', opacity: 0.8 },
  primaryIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  summaryCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, alignItems: 'center' },
  cardIconSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardValue: { fontFamily: 'Poppins-Bold', fontSize: 28, color: '#222', marginBottom: 4 },
  cardLabel: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#666', textAlign: 'center' },
  filterSection: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#222', marginBottom: 12 },
  filterChips: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChipActive: { backgroundColor: '#0B5D69', borderColor: '#0B5D69' },
  filterChipText: { fontFamily: 'Poppins-Medium', fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#fff' },
  leaveCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  leaveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leaveCardLeft: { flex: 1 },
  leaveTypeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7F8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 6 },
  leaveTypeText: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#0B5D69', marginLeft: 4 },
  leaveDuration: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#222' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontFamily: 'Poppins-SemiBold', fontSize: 11, marginLeft: 4 },
  leaveCardBody: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#666', marginLeft: 6, flex: 1 },
  daysChip: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  daysText: { fontFamily: 'Poppins-SemiBold', fontSize: 11, color: '#2196F3' },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#666', marginLeft: 6 },
  detailValue: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#222', marginLeft: 4 },
  reasonText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#444', lineHeight: 20, marginLeft: 22, marginTop: 4 },
  expandIndicator: { alignItems: 'center', marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F7F8', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', marginBottom: 8 },
  emptySubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }
});