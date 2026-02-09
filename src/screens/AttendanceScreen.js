// screens/AttendanceScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, TouchableNativeFeedback, ActivityIndicator, Dimensions, BackHandler, StatusBar, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Import services and components
import { fetchAttendanceRecords } from '../Services/attendanceServices';
import AttendanceItem from '../components/AttendanceItem';
import CameraModal from '../components/CameraModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Define the available date filters
const TIME_FRAMES = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Last 365 Days', value: '365days' },
    { label: 'Custom', value: 'custom' }
];

export default function AttendanceScreen() {

    // late + onTime + leave
    const [lateCount, setLateCount] = useState(0);
    const [onTimeCount, setOnTimeCount] = useState(0);
    const [leaveCount, setLeaveCount] = useState(0);

    const [selectedTimeFrame, setSelectedTimeFrame] = useState('today'); 
    const [attendanceData, setAttendanceData] = useState([]); 
    const [isLoading, setIsLoading] = useState(false); 
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAction, setCurrentAction] = useState('');

    const navigation = useNavigation();

    // Data Loading Logic
    const loadAttendance = async (timeFrame, isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
            // Clear data on load to show a fresh state/loader
            setAttendanceData([]);
        }
        
        try {
            const response = await fetchAttendanceRecords(timeFrame);
            
            if (response && Array.isArray(response.attendance)) {

                // update counts here: leave + onTime + late
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
            setRefreshing(false);
        }
    };

    // Pull to refresh handler
    const onRefresh = useCallback(() => {
        loadAttendance(selectedTimeFrame, true);
    }, [selectedTimeFrame]);

    // Load data on component mount, filter change, and focus
    useFocusEffect(
        useCallback(() => {
            loadAttendance(selectedTimeFrame);
        }, [selectedTimeFrame])
    );

    // Handle Android hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (modalVisible) {
                setModalVisible(false);
                return true; // Prevent default behavior
            }
            return false; // Let default behavior happen (go back)
        });
        return () => backHandler.remove();
    }, [modalVisible]);

    // Render action button with Android ripple effect
    const renderActionButton = (label, action) => (
        <View style={styles.actionBtnWrapper}>
            <TouchableNativeFeedback
                onPress={() => { 
                    setCurrentAction(action); 
                    setModalVisible(true); 
                }}
                background={TouchableNativeFeedback.Ripple('#00000020', false)}
            >
                <View style={styles.actionBtn}>
                    <Text style={styles.actionButtonText} numberOfLines={1}>
                        {label}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            
            <View style={styles.headerContainer}>
                <TouchableNativeFeedback 
                    onPress={() => navigation.goBack()}
                    background={TouchableNativeFeedback.Ripple('#00000020', true)}
                >
                    <View style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </View>
                </TouchableNativeFeedback>
                <Text style={styles.header}>Attendance</Text>
            </View>
            
            {/* Time Frame Filters */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContentContainer}
            >
                {TIME_FRAMES.map(filter => (
                    <TouchableNativeFeedback
                        key={filter.value}
                        onPress={() => setSelectedTimeFrame(filter.value)}
                        disabled={isLoading}
                        background={TouchableNativeFeedback.Ripple('#00000020', true)}
                    >
                        <View
                            style={[
                                styles.filterButton,
                                selectedTimeFrame === filter.value && styles.activeFilter,
                                isLoading && styles.disabledFilter
                            ]}
                        >
                            <Text 
                                style={[
                                    styles.filterText, 
                                    selectedTimeFrame === filter.value && styles.activeFilterText
                                ]}
                                numberOfLines={1}
                            >
                                {filter.label}
                            </Text>
                        </View>
                    </TouchableNativeFeedback>
                ))}
            </ScrollView>

            {/* Total Count Section */}
            <View style={styles.countContainer}>
                <View style={styles.count}>
                    <Text style={styles.countValue} numberOfLines={1}>{onTimeCount}</Text>
                    <Text style={styles.countLabel} numberOfLines={1}>On Time</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.count}>
                    <Text style={styles.countValue} numberOfLines={1}>{lateCount}</Text>
                    <Text style={styles.countLabel} numberOfLines={1}>Late</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.count}>
                    <Text style={styles.countValue} numberOfLines={1}>{leaveCount}</Text>
                    <Text style={styles.countLabel} numberOfLines={1}>Leave</Text>
                </View>
            </View>

            {/* Attendance List */}
            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            ) : attendanceData.length > 0 ? (
                <FlatList
                    data={attendanceData}
                    renderItem={({ item }) => <AttendanceItem record={item} />}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    style={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#007bff']}
                        />
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.noRecordsText}>
                        No records found for the selected time frame.
                    </Text>
                </View>
            )}

            {/* Action Section */}
            <View style={styles.actionsContainer}>
                <View style={styles.actionRow}>
                    {renderActionButton('Check In', 'Check In')}
                    {renderActionButton('Break Start', 'Break Start')}
                </View>
                <View style={styles.actionRow}>
                    {renderActionButton('Break End', 'Break End')}
                    {renderActionButton('Check Out', 'Check Out')}
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
    headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, },
    backButton: { marginRight: 10, padding: 8, borderRadius: 8, },
    backButtonText: { fontSize: 14, color: '#007bff', fontFamily: 'Poppins-SemiBold', },
    header: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333', flex: 1, },
    // Filters
    filtersContainer: { maxHeight: 50, marginBottom: 15, },
    filtersContentContainer: { paddingHorizontal: 12, alignItems: 'center', },
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 4, backgroundColor: '#fff', justifyContent: 'center', borderWidth: 1, borderColor: '#929292', elevation: 1, minHeight: 36, },
    filterText: { color: '#444', fontSize: 13, fontFamily: 'Poppins-Regular', },
    activeFilter: { backgroundColor: '#b0ffcc', borderColor: '#4caf50', elevation: 2, },
    activeFilterText: { color: '#000', fontFamily: 'Poppins-SemiBold', },
    disabledFilter: { opacity: 0.5,},
    // Count
    countContainer: { height: height * 0.1, minHeight: 70, maxHeight: 90, backgroundColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, borderRadius: 12, marginBottom: 15, elevation: 2, paddingVertical: 8, },
    count: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, },
    countValue: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', },
    countLabel: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#666', marginTop: 2, },
    divider: { width: 1, backgroundColor: '#d0d0d0', height: '60%', },
    // List
    listContainer: { flex: 1, backgroundColor: '#f5f5f5', marginHorizontal: 15, borderRadius: 12, marginBottom: 15, elevation: 1, },
    listContentContainer: { paddingVertical: 10, paddingHorizontal: 5, flexGrow: 1, },
    loadingContainer: { flex: 1, backgroundColor: '#f5f5f5', marginHorizontal: 15, borderRadius: 12, marginBottom: 15, justifyContent: 'center', alignItems: 'center', elevation: 1, },
    emptyContainer: { flex: 1, backgroundColor: '#f5f5f5', marginHorizontal: 15, borderRadius: 12, marginBottom: 15, justifyContent: 'center', alignItems: 'center', elevation: 1, },
    noRecordsText: { textAlign: 'center', color: '#6c757d', fontFamily: 'Poppins-Regular', fontSize: 14, paddingHorizontal: 20, },
    // Action buttons
    actionsContainer: { backgroundColor: '#f5f5f5', borderRadius: 12, marginHorizontal: 15, marginBottom: 15, paddingVertical: 12, paddingHorizontal: 10, elevation: 2, },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, },
    actionBtnWrapper: { flex: 1, marginHorizontal: 6, borderRadius: 20, overflow: 'hidden', elevation: 2, },
    actionBtn: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, minHeight: 48, justifyContent: 'center', alignItems: 'center', },
    actionButtonText: { color: '#000', fontSize: 14, fontFamily: 'Poppins-Medium', textAlign: 'center', },
});