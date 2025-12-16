// screens/AttendanceScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

// Import services and components
import { fetchAttendanceRecords, logAttendanceAction } from '../Services/attendanceServices';
import AttendanceItem from '../components/AttendanceItem';
import { SafeAreaView } from 'react-native-safe-area-context';


// Placeholder for a camera utility (you need to implement this!)
const getPlaceholderImageUri = async () => {
    // ⚠️ IMPORTANT: Implement your camera logic here (e.g., using 'expo-camera').
    // This dummy returns a promise to simulate the time taken.
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, this should return the actual path or URI after capture.
    return "file:///dummy/path/replace_with_actual_image_uri.jpg"; 
};


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
    // isActionLoading will prevent multiple quick actions being fired simultaneously
    const [isActionLoading, setIsActionLoading] = useState(false);

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

    // Load data on component mount and filter change
    useEffect(() => {
        loadAttendance(selectedTimeFrame);
    }, [selectedTimeFrame]); // Depend on selectedTimeFrame


    // --- Quick Action Logic (Check In, Break, etc.) ---
    const handleQuickAction = async (actionType) => {
        // Prevent action if already loading
        if (isActionLoading) return;
        
        setIsActionLoading(true);
        try {
            // 1. Capture image (simulated)
            const localImagePath = await getPlaceholderImageUri(); 

            // 2. Log the action via API
            // The actionType is passed directly (e.g., 'Check In')
            await logAttendanceAction(actionType, localImagePath);

            // 3. Success feedback
            Toast.show({ 
                type: 'success', 
                text1: `${actionType} successful!`, 
                text2: `Action logged at ${new Date().toLocaleTimeString()}`,
                position: 'top' 
            });

            // 4. Refresh data after successful action
            // This ensures the current day's record updates immediately.
            loadAttendance(selectedTimeFrame); 

        } catch (error) {
            console.error(`Action failed: ${actionType}`, error);
            Toast.show({ 
                type: 'error', 
                text1: `${actionType} failed!`, 
                text2: error.message || "Server or network error. Please try again.", 
                position: 'top'
            });
        } finally {
            setIsActionLoading(false);
        }
    };

    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Attendance</Text>
            
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

        <View style={[styles.spacer, { flex: 2 }]} /> 
        {/*   Action Section */}
        <View style={styles.actionsContainer}>
            <View style={{ flexDirection:'row', justifyContent:'space-between'}}>
                <View>
                 <TouchableOpacity
                    style={styles}
                    onPress={() => navigation.navigate('CheckInScreen')}
                    >
                    <Text>Check In</Text>
                    </TouchableOpacity>
                </View>
               <View>
                    <TouchableOpacity
                    style={styles}
                    onPress={() => navigation.navigate('BreakStartScreen')}
                    >
                        <Text>Break Start</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-between'}}>
                <View>
                    <TouchableOpacity
                    style={styles}
                    onPress={() => navigation.navigate('BreakEndScreen')}
                    >
                        <Text>Break End</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                    style={styles}
                    onPress={() => navigation.navigate('CheckOutScreen')}
                    >
                        <Text>Check Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

         
        <Toast />
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { 
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold', 
        marginHorizontal: 15, 
        marginVertical: 10,
        marginBottom: 10, 
        color: '#333', 
    },
    
    // Quick Actions
    quickActionsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    actionButton: { 
        backgroundColor: '#28a745', // Green
        paddingVertical: 10, 
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        // flex: 1 added to ensure equal spacing for all buttons
        flex: 1,
        marginHorizontal: 4, // Add a little space between buttons
        justifyContent: 'center',
    },
    checkoutButton: {
        backgroundColor: '#dc3545', // Red for Check Out
    },
    actionButtonText: { 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 12, // Reduced font size for better fit
        textAlign: 'center',
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
        maxHeight: 325,
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
        padding: 10,
        marginBottom: 20
    },
});


//{/* Quick Actions */}
  //          <View style={styles.quickActionsContainer}>
    //            {['Check In', 'Break Start', 'Break End', 'Check Out'].map(action => (
      //              <TouchableOpacity 
        //                key={action} 
          //              style={[
            //                styles.actionButton, 
              //              action === 'Check Out' && styles.checkoutButton,
                //            // Dim the button when loading
                  //          isActionLoading && { opacity: 0.6 }
                    //    ]} 
                      //  onPress={() => handleQuickAction(action)}
 //                       disabled={isActionLoading}
   //                 >
     //                   {/* Only show loader in the middle of the button for better centering */}
       //                 {isActionLoading ? (
         //                   <ActivityIndicator color="white" />
           //             ) : (
             //               <Text style={styles.actionButtonText}>{action}</Text>
               //         )}
                 //   </TouchableOpacity>
     //           ))}
       //     </View>