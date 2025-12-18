// screens/AttendanceScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Import services and components
import { fetchAttendanceRecords } from '../Services/attendanceServices';
import AttendanceItem from '../components/AttendanceItem';
import CameraModal from '../components/CameraModal';
import { SafeAreaView } from 'react-native-safe-area-context';


// Define the available date filters
const TIME_FRAMES = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Last 365 Days', value: '365days' },
    { label: 'Custom', value: '0' }
];

export default function AttendanceScreen() {

    // late + onTime + leave
    const [lateCount, setLateCount] = useState(0);
    const [onTimeCount, setOnTimeCount] = useState(0);
    const [leaveCount, setLeaveCount] = useState(0);

    const [selectedTimeFrame, setSelectedTimeFrame] = useState('today'); 
    const [attendanceData, setAttendanceData] = useState([]); 
    const [isLoading, setIsLoading] = useState(false); 

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAction, setCurrentAction] = useState('');

    // --- Data Loading Logic ---
    const loadAttendance = async (timeFrame) => {
        setIsLoading(true);
        // Clear data on load to show a fresh state/loader
        setAttendanceData([]);
        
        try {
            const response = await fetchAttendanceRecords(timeFrame);
            
            if (response && Array.isArray(response.attendance)) {

                // update counts hear leav + onTime + late
                setLateCount(response.lateCount);
                setOnTimeCount(response.onTimeCount);
                setLeaveCount(response.leaveCount);

                // Ensure response is valid before setting state
                setAttendanceData(response.attendance);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Attendance Load Error:", error);
            Toast.show({ 
                type: 'error', 
                text1: 'Attendance History Failed to Load', 
                text2: error.message || "Network error. Please try again.", 
                position: 'bottom' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount, filter change, and focus
    useFocusEffect(
        useCallback(() => {
            loadAttendance(selectedTimeFrame);
        }, [selectedTimeFrame])
    );


    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Attendance</Text>
            </View>
            
            {/* Quick Actions */}
            {/* Time Frame Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                {TIME_FRAMES.map(filter => (
                    <TouchableOpacity
                        key={filter.value}
                        style={[
                            styles.filterButton,
                            // Apply active styles when selected
                            selectedTimeFrame === filter.value && styles.activeFilter,
                        ]}
                        onPress={() => setSelectedTimeFrame(filter.value)}
                        // Optionally disable filters while loading data
                        disabled={isLoading}
                    >
                        <Text style={[styles.filterText, selectedTimeFrame === filter.value && styles.activeFilterText]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Total Count Section */}
            <View style={styles.countContainer}>
                <View style={styles.count}>
                    <Text style={styles.countValue}>{onTimeCount}</Text>
                    <Text style={styles.countValue}>On Time</Text>
                </View>
                <View style={{width: 1, backgroundColor: '#929292ff' , height: '50%'}} />
                <View style={styles.count}>
                    <Text style={styles.countValue}>{lateCount}</Text>
                    <Text style={styles.countValue}>Late</Text>
                </View>
                <View style={{width: 1, backgroundColor: '#929292ff' , height: '50%'}} />
                <View style={styles.count}>
                    <Text style={styles.countValue}>{leaveCount}</Text>
                    <Text style={styles.countValue}>leave</Text>
                </View>
            </View>

            {/* --- Attendance List: USE FLATLIST HERE --- */}
        {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" style={{ margin: 20 }} />
        ) : attendanceData.length > 0 ? (
            <FlatList
                data={attendanceData}
                // renderItem replaces the map function
                renderItem={({ item }) => <AttendanceItem record={item} />}
                // keyExtractor is necessary for performance
                keyExtractor={item => item.id.toString()} // Assuming 'id' is a unique identifier
                contentContainerStyle={styles.listContentContainer}
                style={styles.listContainer}
            />
        ) : (
            // Empty state is rendered when data is empty and not loading
            <View style={styles.listContainer}>
                <Text style={styles.noRecordsText}>
                    No records found for the selected time frame.
                </Text>
            </View>
        )}

        {/*   Action Section */}
        <View style={styles.actionsContainer}>
            <View style={{ flexDirection:'row', justifyContent: 'space-evenly'}}>
                <View>
                 <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setCurrentAction('Check In'); setModalVisible(true); }}
                    >
                    <Text style={styles.actionButtonText}>Check In</Text>
                    </TouchableOpacity>
                </View>
               <View>
                    <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setCurrentAction('Break Start'); setModalVisible(true); }}
                    >
                        <Text style={styles.actionButtonText}>Break Start</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection:'row', justifyContent: 'space-evenly' }}>
                <View>
                    <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setCurrentAction('Break End'); setModalVisible(true); }}
                    >
                        <Text style={styles.actionButtonText}>Break End</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => { setCurrentAction('Check Out'); setModalVisible(true); }}
                    >
                        <Text style={styles.actionButtonText}>Check Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        <CameraModal
            visible={modalVisible}
            actionType={currentAction}
            onSuccess={() => {
                setSelectedTimeFrame('today');
                loadAttendance('today');
                setModalVisible(false);
            }}
            onClose={() => setModalVisible(false)}
        />
         
        <Toast />
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 10,
        marginBottom: 10,
    },
    backButton: {
        marginRight: 10,
        padding: 5,
    },
    backButtonText: {
        fontSize: 12,
        color: '#007bff',
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 'bold',
    },
    header: { 
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold', 
        marginHorizontal: 15, 
        marginVertical: 10,
        marginBottom: 10, 
        color: '#333', 
    },

    // Filters
    filtersContainer: { 
        paddingVertical: 6, 
        marginBottom: 15,
        maxHeight: 45,
    },
    filterButton: { 
        paddingVertical: 6, // Increased padding
        paddingHorizontal: 14,
        borderRadius: 20,
        marginEnd: 4,
        marginStart: 4,
        backgroundColor: '#fff', 
        justifyContent: 'center', 
        borderWidth: 1, // Kept for border consistency
        borderColor: '#929292ff',
    },
    filterText: { 
        color: '#444', // Darker gray for better contrast
        fontSize: 12, 
        fontFamily: 'Poppins-Regular',
    },
    activeFilter: { 
        backgroundColor: '#b0ffccaa',
        borderColor: '#929292ff',

    },
    activeFilterText: { 
        color: '#000', 
        fontFamily: 'Poppins-SemiBold', 
        fontSize: 12,
    },

    // Count
    countContainer:{
        flex: 1,
        maxHeight: 75,
        backgroundColor: '#a3a3a329',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        borderRadius: 25,
        marginBottom: 15,
    },

    count:{
        padding: 6,
        height: 75,
        width: 108,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:16,
    },

    countValue: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
    },
    
    // List
    listContainer: {
        backgroundColor: '#a3a3a329',
        maxHeight: 425,
        height: 150,
        paddingHorizontal: 10, 
        borderRadius: 25, 
        marginHorizontal: 10, // Added margin for visual separation
        marginBottom: 15,
    },
    listContentContainer: {
        paddingVertical: 10,
        // Added minHeight to ensure the scroll area is always visible
        minHeight: 150, 
    },
    noRecordsText: { 
        textAlign: 'center', 
        margin: 20, 
        color: '#6c757d',
        fontFamily: 'Poppins-Regular', 
        fontSize: 16,
    },

    // action btn
    actionsContainer: {
        backgroundColor: '#a3a3a329',
        borderRadius: 25,
        marginHorizontal: 10,
        justifyContent: 'space-evenly',
        marginBottom: 20,
        height: 120,
    },

    actionBtn: { 
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 25,
        width: 150,
        height: 45,
        justifyContent: 'center',
    
    },

    actionButtonText: { 
        color: '#000', 
        fontSize: 14, // Reduced font size for better fit
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
});
