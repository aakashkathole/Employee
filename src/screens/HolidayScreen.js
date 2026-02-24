// screens/HolidayScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, RefreshControl, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarPicker from "react-native-calendar-picker";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchHolidays } from "../Services/holidayService";
import Loader from "../components/Loader";

const HolidayScreen = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // key to reset calendar
  const [calendarKey, setCalendarKey] = useState(Date.now());

  // today
  const today = moment().toDate();

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await fetchHolidays();
      setHolidays(data);
    } catch (error) {
      console.log("Holiday fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // refresh pull
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await fetchHolidays();
      setHolidays(data);

      // to go to today
      setCalendarKey(Date.now());

    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // holiday details
  const holidayDates = holidays.map(h =>
    moment(h.date, "YYYY-MM-DD").toDate()
  );

  // date click
  const onDateChange = (date) => {
    const selectedDate = moment(date).format("YYYY-MM-DD");

    const holiday = holidays.find(
      h => h.date === selectedDate
    );

    if (holiday) {
      setSelectedHoliday(holiday);
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && <Loader />}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        
        {/* Header section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Holiday</Text>
        </View>

        {/* calander */}
        <CalendarPicker
          key={calendarKey}

          startFromMonday={true}

          /* always open on today */
          initialDate={today}
          selectedStartDate={today}

          /* today style */
          todayBackgroundColor="#C8E6C9"
          todayTextStyle={{ 
            color: "#1B5E20",
            fontWeight: "bold",
        }}

          selectedDayColor="#1976D2"
          selectedDayTextColor="#FFFFFF"

          onDateChange={onDateChange}

          /* holiday marks */
          customDatesStyles={holidayDates.map(date => ({
            date,
            style: { backgroundColor: "#FFCDD2" },
            textStyle: {
              color: "#B71C1C",
              fontWeight: "bold",
            },
          }))}
        />

        <View style={styles.extraSection}>
          <Text style={styles.sectionTitle}>
            Upcoming Holidays
          </Text>
        </View>
      </ScrollView>

      {/* HOLIDAY DETAILS MODAL */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              {selectedHoliday?.holidayName}
            </Text>

            <Text>Date: {selectedHoliday?.date}</Text>
            <Text>Day: {selectedHoliday?.day}</Text>
            <Text>
              Paid Holiday:{" "}
              {selectedHoliday?.paidHoliday ? "Yes" : "No"}
            </Text>
            <Text>
              Branch Code: {selectedHoliday?.branchCode}
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HolidayScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    padding: 10,
  },
  extraSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  // Header
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0', gap: 8 },
  backBtn: { marginRight: 4, padding: 4, backgroundColor: "#2563eb", borderRadius: 8, },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#1A1A1A', marginBottom: 5, },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});