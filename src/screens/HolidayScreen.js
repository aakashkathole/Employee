// screens/HolidayScreen.js

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarPicker from "react-native-calendar-picker";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { fetchHolidays } from "../Services/holidayService";
import Loader from "../components/Loader";

// ─── THEME ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary:      "#1976D2",
  primaryDark:  "#1256A0",
  primaryLight: "#E3F2FD",
  danger:       "#E53935",
  dangerLight:  "#FFCDD2",
  success:      "#2E7D32",
  successLight: "#C8E6C9",
  surface:      "#FFFFFF",
  bg:           "#F4F6FA",
  border:       "#E8ECF0",
  text:         "#1A1A1A",
  textSub:      "#6B7280",
  paid:         "#1976D2",
  paidBg:       "#DBEAFE",
  unpaid:       "#D97706",
  unpaidBg:     "#FEF3C7",
};

// ─── LEGEND ITEM ─────────────────────────────────────────────────────────────
const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

// ─── HOLIDAY CARD ─────────────────────────────────────────────────────────────
// FIX #3: isPast uses isBefore with "day" granularity + startOf("day") for daysLeft
// FIX #5: removed unused "index" prop
const HolidayCard = ({ item, onPress }) => {
  const scale    = React.useRef(new Animated.Value(1)).current;
  const isPast   = moment(item.date, "YYYY-MM-DD").isBefore(moment(), "day");
  const daysLeft = moment(item.date, "YYYY-MM-DD").diff(moment().startOf("day"), "days");

  const handlePressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item)}
        style={[styles.card, isPast && styles.cardPast]}
      >
        {/* Left accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: isPast ? COLORS.textSub : COLORS.danger }]} />

        {/* Date badge */}
        <View style={[styles.dateBadge, { backgroundColor: isPast ? "#F3F4F6" : COLORS.dangerLight }]}>
          <Text style={[styles.dateBadgeDay, { color: isPast ? COLORS.textSub : COLORS.danger }]}>
            {moment(item.date, "YYYY-MM-DD").format("DD")}
          </Text>
          <Text style={[styles.dateBadgeMonth, { color: isPast ? COLORS.textSub : COLORS.danger }]}>
            {moment(item.date, "YYYY-MM-DD").format("MMM")}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, isPast && { color: COLORS.textSub }]} numberOfLines={1}>
            {item.holidayName}
          </Text>
          <View style={styles.cardMeta}>
            <MaterialCommunityIcons name="calendar-week" size={13} color={COLORS.textSub} />
            <Text style={styles.cardMetaText}>{item.day}</Text>
            {!isPast && daysLeft === 0 && (
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText}>Today</Text>
              </View>
            )}
            {!isPast && daysLeft > 0 && (
              <Text style={styles.daysLeftText}>in {daysLeft}d</Text>
            )}
            {isPast && <Text style={styles.pastText}>Past</Text>}
          </View>
        </View>

        {/* Paid badge */}
        <View style={[
          styles.paidBadge,
          { backgroundColor: item.paidHoliday ? COLORS.paidBg : COLORS.unpaidBg },
        ]}>
          <Text style={[styles.paidText, { color: item.paidHoliday ? COLORS.paid : COLORS.unpaid }]}>
            {item.paidHoliday ? "Paid" : "Unpaid"}
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={COLORS.border}
          style={{ alignSelf: "center" }}
        />
      </Pressable>
    </Animated.View>
  );
};

// ─── SHEET ROW ────────────────────────────────────────────────────────────────
const SheetRow = ({ icon, label, value }) => (
  <View style={styles.sheetRow}>
    <View style={styles.sheetRowLeft}>
      <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.sheetRowLabel}>{label}</Text>
    </View>
    <Text style={styles.sheetRowValue}>{value}</Text>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const HolidayScreen = () => {
  const [holidays,        setHolidays]        = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [refreshing,      setRefreshing]      = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [modalVisible,    setModalVisible]    = useState(false);
  const [errorMsg,        setErrorMsg]        = useState(null);
  const navigation = useNavigation();

  const slideAnim   = React.useRef(new Animated.Value(300)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  const [calendarKey, setCalendarKey] = useState(Date.now());
  const today = moment().toDate();

  // FIX #4: wrapped in useCallback to satisfy exhaustive-deps
  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchHolidays();
      setHolidays(data);
    } catch (error) {
      console.log("Holiday fetch error:", error);
      setErrorMsg("Failed to load holidays. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHolidays(); }, [loadHolidays]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorMsg(null);
      const data = await fetchHolidays();
      setHolidays(data);
      setCalendarKey(Date.now());
    } catch (error) {
      setErrorMsg("Failed to refresh. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // FIX #1: reset animation values before opening so slide plays every time
  const openModal = useCallback((holiday) => {
    slideAnim.setValue(300);
    overlayAnim.setValue(0);
    setSelectedHoliday(holiday);
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(overlayAnim, { toValue: 1, useNativeDriver: true, duration: 250 }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 300, useNativeDriver: true, duration: 220 }),
      Animated.timing(overlayAnim, { toValue: 0,   useNativeDriver: true, duration: 220 }),
    ]).start(() => setModalVisible(false));
  }, [slideAnim, overlayAnim]);

  const holidayDates = holidays.map(h => moment(h.date, "YYYY-MM-DD").toDate());

  const upcomingHolidays = holidays
    .filter(h => moment(h.date, "YYYY-MM-DD").isSameOrAfter(moment(), "day"))
    .sort((a, b) => moment(a.date).diff(moment(b.date)));

  const pastHolidays = holidays
    .filter(h => moment(h.date, "YYYY-MM-DD").isBefore(moment(), "day"))
    .sort((a, b) => moment(b.date).diff(moment(a.date)));

  const onDateChange = (date) => {
    const selectedDate = moment(date).format("YYYY-MM-DD");
    const holiday = holidays.find(h => h.date === selectedDate);
    if (holiday) openModal(holiday);
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && <Loader />}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Holiday Calendar</Text>
            <Text style={styles.headerSub}>{moment().format("MMMM YYYY")}</Text>
          </View>
        </View>

        {/* ── ERROR STATE ── */}
        {errorMsg && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity onPress={loadHolidays} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CALENDAR CARD ── */}
        <View style={styles.calendarCard}>
          <CalendarPicker
            key={calendarKey}
            startFromMonday={true}
            initialDate={today}
            selectedStartDate={today}
            todayBackgroundColor={COLORS.successLight}
            todayTextStyle={{ color: COLORS.success, fontWeight: "bold" }}
            selectedDayColor={COLORS.primary}
            selectedDayTextColor="#FFFFFF"
            onDateChange={onDateChange}
            monthTitleStyle={styles.calMonthTitle}
            yearTitleStyle={styles.calMonthTitle}
            dayLabelsWrapper={styles.calDayLabels}
            previousComponent={
              <View style={styles.calNavBtn}>
                <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.primary} />
              </View>
            }
            nextComponent={
              <View style={styles.calNavBtn}>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
              </View>
            }
            customDatesStyles={holidayDates.map(date => ({
              date,
              style:     { backgroundColor: COLORS.dangerLight },
              textStyle: { color: COLORS.danger, fontWeight: "bold" },
            }))}
            accessibilityLabel="Holiday calendar"
          />

          {/* ── LEGEND ── */}
          <View style={styles.legend}>
            <LegendItem color={COLORS.successLight} label="Today"    />
            <LegendItem color={COLORS.dangerLight}  label="Holiday"  />
            <LegendItem color={COLORS.primary}      label="Selected" />
          </View>
        </View>

        {/* ── UPCOMING HOLIDAYS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{upcomingHolidays.length}</Text>
            </View>
          </View>

          {upcomingHolidays.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="beach" size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>No upcoming holidays</Text>
            </View>
          ) : (
            // FIX #5: index removed from map and HolidayCard
            upcomingHolidays.map((item) => (
              <HolidayCard key={item.date} item={item} onPress={openModal} />
            ))
          )}
        </View>

        {/* ── PAST HOLIDAYS ── */}
        {pastHolidays.length > 0 && (
          <View style={[styles.section, { marginBottom: 30 }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={18} color={COLORS.textSub} />
              <Text style={[styles.sectionTitle, { color: COLORS.textSub }]}>Past Holidays</Text>
              <View style={[styles.countBadge, { backgroundColor: "#F3F4F6" }]}>
                <Text style={[styles.countText, { color: COLORS.textSub }]}>{pastHolidays.length}</Text>
              </View>
            </View>
            {/* FIX #5: index removed */}
            {pastHolidays.map((item) => (
              <HolidayCard key={item.date} item={item} onPress={openModal} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── BOTTOM SHEET MODAL ── */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
        </Animated.View>

        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>

          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetIconWrap}>
              <MaterialCommunityIcons name="calendar-star" size={24} color={COLORS.danger} />
            </View>
            <Text style={styles.sheetTitle}>{selectedHoliday?.holidayName}</Text>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.sheetCloseBtn}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={20} color={COLORS.textSub} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetDivider} />

          {/* Details */}
          <View style={styles.sheetBody}>
            <SheetRow
              icon="calendar"
              label="Date"
              value={moment(selectedHoliday?.date, "YYYY-MM-DD").format("DD MMMM YYYY")}
            />
            <SheetRow icon="calendar-week"   label="Day"         value={selectedHoliday?.day} />
            <SheetRow icon="office-building" label="Branch Code" value={selectedHoliday?.branchCode || "All"} />

            {/* Paid status */}
            <View style={styles.sheetRow}>
              <View style={styles.sheetRowLeft}>
                <MaterialCommunityIcons name="cash" size={18} color={COLORS.primary} />
                <Text style={styles.sheetRowLabel}>Type</Text>
              </View>
              <View style={[
                styles.paidBadgeLarge,
                { backgroundColor: selectedHoliday?.paidHoliday ? COLORS.paidBg : COLORS.unpaidBg },
              ]}>
                <MaterialCommunityIcons
                  name={selectedHoliday?.paidHoliday ? "check-circle" : "minus-circle"}
                  size={14}
                  color={selectedHoliday?.paidHoliday ? COLORS.paid : COLORS.unpaid}
                />
                <Text style={[
                  styles.paidBadgeLargeText,
                  { color: selectedHoliday?.paidHoliday ? COLORS.paid : COLORS.unpaid },
                ]}>
                  {selectedHoliday?.paidHoliday ? "Paid Holiday" : "Unpaid Holiday"}
                </Text>
              </View>
            </View>
          </View>

          {/* Done button */}
          <TouchableOpacity style={styles.sheetCloseFullBtn} onPress={closeModal} activeOpacity={0.85}>
            <Text style={styles.sheetCloseFullText}>Done</Text>
          </TouchableOpacity>

        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default HolidayScreen;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContainer: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    padding: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 20,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 1,
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.danger,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: COLORS.danger,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Calendar card
  calendarCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  calMonthTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  calDayLabels: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  calNavBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },

  // Legend
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    paddingTop: 12,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.textSub,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Holiday card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardPast: {
    opacity: 0.65,
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  dateBadge: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  dateBadgeDay: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  dateBadgeMonth: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardInfo: {
    flex: 1,
    paddingVertical: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardMetaText: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  daysLeftText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pastText: {
    fontSize: 11,
    color: COLORS.textSub,
  },
  todayPill: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  paidText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSub,
  },

  // Bottom sheet modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 20 },
    }),
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  sheetCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetRowLabel: {
    fontSize: 14,
    color: COLORS.textSub,
    fontWeight: "500",
  },
  sheetRowValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  paidBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadgeLargeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sheetCloseFullBtn: {
    margin: 20,
    marginBottom: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sheetCloseFullText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});