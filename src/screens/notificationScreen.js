import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getBirthdays } from '../Services/notificationService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDob = (dob) => {
  if (!dob) return '';
  const date = new Date(dob);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long' });
};

const getInitials = (fullName) => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626'];
const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ─── Sub Components ──────────────────────────────────────────────────────────

const SectionHeader = ({ icon, label, count }) => (
  <View style={styles.sectionHeader}>
    <MaterialCommunityIcons name={icon} size={18} color="#2563eb" />
    <Text style={styles.sectionLabel}>{label}</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
);

const BirthdayCard = ({ item }) => (
  <View style={styles.card}>
    <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.fullName) }]}>
      <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
    </View>
    <View style={styles.cardContent}>
      <View style={styles.cardRow}>
        <Text style={styles.cardName} numberOfLines={1}>{item.fullName}</Text>
        <View style={styles.dateChip}>
          <MaterialCommunityIcons name="cake-variant" size={12} color="#2563eb" />
          <Text style={styles.dateText}>{formatDob(item.dob)}</Text>
        </View>
      </View>
      <Text style={styles.cardSub} numberOfLines={1}>{item.categoryName}</Text>
      <View style={styles.deptRow}>
        <MaterialCommunityIcons name="office-building-outline" size={13} color="#6B7280" />
        <Text style={styles.deptText}>{item.department}</Text>
      </View>
    </View>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getBirthdays();
      setBirthdays(data || []);
    } catch (err) {
      setError('Failed to load notifications. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="wifi-off" size={52} color="#D1D5DB" />
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      );
    }

    if (birthdays.length === 0) {
      return (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="bell-off-outline" size={52} color="#D1D5DB" />
          <Text style={styles.stateTitle}>All caught up!</Text>
          <Text style={styles.stateText}>No upcoming notification right now.</Text>
        </View>
      );
    }

    return (
      <>
        {/* ── Birthdays Section ── */}
        <SectionHeader icon="cake-variant-outline" label="Upcoming Birthdays" count={birthdays.length} />
        {birthdays.map((item, index) => (
          <BirthdayCard key={`birthday-${item.fullName}-${index}`} item={item} />
        ))}

        {/* ── Future sections plug in here ── */}
        {/* <SectionHeader icon="bell-outline" label="System Alerts" count={alerts.length} /> */}
        {/* {alerts.map(...)} */}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {birthdays.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{birthdays.length}</Text>
          </View>
        )}
      </View>

      {/* ── Body ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={['#2563eb']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
    gap: 8,
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: '#1A1A1A',
  },
  headerBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  badge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cardContent: { flex: 1, gap: 2 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#2563eb',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  deptText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },

  // Empty / Error / Loading States
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  stateTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
  },
  stateText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});