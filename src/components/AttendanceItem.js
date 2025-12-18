// components/AttendanceItem.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusStyle = (status) => {
    switch (status) {
        case 'Late': return { backgroundColor: '#ffc107', color: 'black' };
        case 'Present': return { backgroundColor: '#28a745', color: 'white' };
        case 'Absent': return { backgroundColor: '#dc3545', color: 'white' };
        default: return { backgroundColor: '#6c757d', color: 'white' };
    }
};

export default function AttendanceItem({ record }) {
    const statusStyle = getStatusStyle(record.status);
    
    // optimized formatTime function
    const formatTime = (time) => {
    // 1. Handle null, undefined, or empty values
    if (!time || typeof time !== 'string') return '--:--';

    try {
        // 2. Remove milliseconds (split by '.' and take first part)
        const mainTime = time.split('.')[0]; 
        
        // 3. Extract hours and minutes
        let [hours, minutes] = mainTime.split(':');
        hours = parseInt(hours, 10);

        if (isNaN(hours)) return '--:--';

        // 4. Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // 5. Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle 0 as 12

        return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return '--:--';
    }
};

    return (
        <View style={styles.card}>
            {/* Header: Date and Day */}
            <View style={styles.header}>
                <Text style={styles.dateText}>{record.todaysDate}</Text>
                <Text style={styles.dayText}>{record.day}</Text>
            </View>
            
            {/* Status Badge */}
            <Text style={[styles.statusBadge, statusStyle]}>{record.status}</Text>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
                <Row label="Check In" value={formatTime(record.loginTime)} isBold={true} />
                <Row label="Check Out" value={formatTime(record.logoutTime)} />
                <Row label="Break In" value={formatTime(record.breakIn || '--')} />
                <Row label="Break Out" value={formatTime(record.breakOut || '--')} />
                <Row label="Over Time" value={record.overTime || '00:00'} isBold={true} />
            </View>
        </View>
    );
}

// Simple Row Component for the grid
const Row = ({ label, value, isBold }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={[styles.detailValue, isBold && { fontWeight: 'bold' }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
        marginHorizontal: 1, // Fixes elevation cutting off edges
        elevation: 2,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    dateText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#333' },
    dayText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#666' },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginBottom: 10,
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        overflow: 'hidden',
    },
    detailsGrid: { borderWidth: 1, borderColor: '#eee', borderRadius: 5, padding: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    detailLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#555' },
    detailValue: { fontSize: 14, fontFamily: 'Poppins-Regular', fontWeight: '600' },
});