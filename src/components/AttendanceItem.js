// components/AttendanceItem.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusStyle = (status) => {
    switch (status) {
        case 'Late':    return { backgroundColor: '#ffc107', color: 'black' };
        case 'OnTime': return { backgroundColor: '#28a745', color: 'white' };
        default:        return { backgroundColor: '#6c757d', color: 'white' };
    }
};

const formatOverTime = (mins) => {
    if (!mins || mins === 0) return '0h 00m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

const formatTime = (time) => {
    if (!time || typeof time !== 'string') return '--:--';
    try {
        const mainTime = time.split('.')[0];
        let [hours, minutes] = mainTime.split(':');
        hours = parseInt(hours, 10);
        if (isNaN(hours)) return '--:--';
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return '--:--';
    }
};

export default function AttendanceItem({ record }) {
    const statusStyle = getStatusStyle(record.status);

    return (
        <View style={styles.card}>

            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.dateText}>{record.todaysDate}</Text>
                    <Text style={styles.dayText}>{record.day}</Text>
                </View>
                <Text style={[styles.statusBadge, statusStyle]}>{record.status}</Text>
            </View>

            {/* Combined Time Grid: 2x2 + overtime */}
            <View style={styles.grid}>

                {/* Row 1: Check In | Check Out */}
                <View style={styles.gridRow}>
                    <TimeBlock label="Check In"  value={formatTime(record.loginTime)}  highlight />
                    <View style={styles.colDivider} />
                    <TimeBlock label="Check Out" value={formatTime(record.logoutTime)} />
                </View>

                <View style={styles.rowDivider} />

                {/* Row 2: Break In | Break Out */}
                <View style={styles.gridRow}>
                    <TimeBlock label="Break In"  value={record.breakIn  ? formatTime(record.breakIn)  : '--'} />
                    <View style={styles.colDivider} />
                    <TimeBlock label="Break Out" value={record.breakOut ? formatTime(record.breakOut) : '--'} />
                </View>

                <View style={styles.rowDivider} />

                {/* Row 3: Overtime full width */}
                <View style={styles.overtimeRow}>
                    <Text style={styles.overtimeLabel}>Over Time</Text>
                    <Text style={styles.overtimeValue}>{formatOverTime(record.overTime)}</Text>
                </View>

            </View>
        </View>
    );
}

const TimeBlock = ({ label, value, highlight }) => (
    <View style={styles.timeBlock}>
        <Text style={styles.timeLabel}>{label}</Text>
        <Text style={[styles.timeValue, highlight && styles.timeValueHighlight]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, marginHorizontal: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, },
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, },
    dateText: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#333', },
    dayText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#999', },
    statusBadge: { paddingVertical: 2, paddingHorizontal: 9, borderRadius: 20, fontFamily: 'Poppins-SemiBold', fontSize: 11, overflow: 'hidden', },
    // Grid
    grid: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, overflow: 'hidden', },
    gridRow: { flexDirection: 'row', },
    timeBlock: { flex: 1, paddingVertical: 6, paddingHorizontal: 10, },
    timeLabel: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#999', marginBottom: 1, },
    timeValue: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#444', },
    timeValueHighlight: { fontFamily: 'Poppins-SemiBold', color: '#222', },
    // Dividers
    rowDivider: { height: 1, backgroundColor: '#eee', },
    colDivider: { width: 1, backgroundColor: '#eee', },
    // Overtime
    overtimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f9f9f9', },
    overtimeLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#999', },
    overtimeValue: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#333', },
});