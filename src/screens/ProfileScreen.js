import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, Pressable, ToastAndroid, Platform, Alert, StatusBar } from 'react-native';
import { useDashboard } from "../context/DashboardContext"; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// Compact Info Card Component (2-column grid)
const InfoCard = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <MaterialCommunityIcons name={icon} size={18} color="#0078D4" />
    <View style={styles.infoCardContent}>
      <Text style={styles.infoCardLabel}>{label}</Text>
      <Text style={styles.infoCardValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

// Compact List Item
const CompactListItem = ({ label, value }) => (
  <View style={styles.compactListItem}>
    <Text style={styles.compactLabel}>{label}</Text>
    <Text style={styles.compactValue}>{value}</Text>
  </View>
);

// Document Link Component
const DocumentLink = ({ label, url, icon }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  const handlePress = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        showToast(`Cannot open ${label}`);
        setIsDownloading(false);
        return;
      }
      await Linking.openURL(url);
      showToast(`Opening ${label}...`);
    } catch (error) {
      showToast(`Failed to open ${label}`);
    } finally {
      setTimeout(() => setIsDownloading(false), 200);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.docCard, isDownloading && { opacity: 0.5 }]} 
      onPress={handlePress}
      disabled={isDownloading}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={24} color="#0078D4" />
      <Text style={styles.docLabel}>{label}</Text>
      {isDownloading ? (
        <ActivityIndicator size="small" color="#0078D4" style={styles.docIcon} />
      ) : (
        <MaterialCommunityIcons name="download" size={18} color="#34A853" style={styles.docIcon} />
      )}
    </TouchableOpacity>
  );
};

// Expandable Address Section
const AddressSection = ({ title, data, isExpanded, onToggle }) => (
  <View style={styles.addressSection}>
    <Pressable 
      onPress={onToggle}
      style={styles.addressHeader}
      android_ripple={{ color: '#E8E8E8' }}
    >
      <Text style={styles.addressTitle}>{title}</Text>
      <MaterialCommunityIcons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#0078D4"
      />
    </Pressable>
    {isExpanded && (
      <View style={styles.addressContent}>
        <Text style={styles.addressFull}>{data.fullAddress}</Text>
        <View style={styles.addressGrid}>
          <Text style={styles.addressDetail}>{data.city}, {data.district}</Text>
          <Text style={styles.addressDetail}>{data.state} - {data.pinCode}</Text>
        </View>
      </View>
    )}
  </View>
);

export default function ProfileScreen() {
  const { dashboardData, loading } = useDashboard();
  
  const [isCurrentExpanded, setIsCurrentExpanded] = useState(false);
  const [isPermanentExpanded, setIsPermanentExpanded] = useState(false);
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!dashboardData || !dashboardData.employee) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>No profile data</Text>
      </View>
    );
  }

  const employee = dashboardData.employee;
  const address = dashboardData.address;
  const document = dashboardData.document;
  
  const currentAddress = {
    city: address.city || 'N/A',
    state: address.state || 'N/A',
    district: address.district || 'N/A',
    pinCode: address.pinCode || 'N/A',
    fullAddress: address.currentAddress || 'N/A',
  };
  
  const permanentAddress = {
    city: address.pcity || 'N/A',
    state: address.pstate || 'N/A',
    district: address.pdistrict || 'N/A',
    pinCode: address.ppinCode || 'N/A',
    fullAddress: address.paddress || 'N/A',
  };
  
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.headerTitle}>Profile info</Text>
        </View>
        {/* Minimal Profile Header - NO EXTRA SPACE */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: document.employeePhoto }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{employee.fullName}</Text>
            <Text style={styles.profileRole}>{employee.designation}</Text>
            <View style={styles.deptBadge}>
              <MaterialCommunityIcons name="office-building" size={12} color="#0078D4" />
              <Text style={styles.deptText}>{employee.department}</Text>
            </View>
          </View>
        </View>

        {/* Quick Contact Grid - 2 Columns */}
        <View style={styles.contactGrid}>
          <InfoCard icon="email" label="Email" value={employee.empEmail} />
          <InfoCard icon="phone" label="Phone" value={employee.mobileNo} />
          <InfoCard icon="calendar" label="DOB" value={employee.dob} />
          <InfoCard icon="water" label="Blood" value={employee.bloodGroup} />
        </View>

        {/* Employment Section - Compact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="briefcase" size={18} color="#0078D4" />
            <Text style={styles.sectionTitle}>Employment</Text>
          </View>
          <View style={styles.gridContainer}>
            <CompactListItem label="Joining" value={employee.joiningDate || 'N/A'} />
            <CompactListItem label="Location" value={employee.workLocation} />
            <CompactListItem label="Employee Type" value={employee.employeeType} />
            <CompactListItem label="Duty" value={employee.dutyType} />
            <CompactListItem label="Salary" value={employee.salary} />
            <CompactListItem label="Shift" value={employee.shift} />
          </View>
        </View>

        {/* Personal Section - Compact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={18} color="#0078D4" />
            <Text style={styles.sectionTitle}>Personal</Text>
          </View>
          <View style={styles.gridContainer}>
            <CompactListItem label="Gender" value={employee.gender} />
            <CompactListItem label="Parent Contact" value={employee.parentNo} />
          </View>
        </View>

        {/* Address Section - Expandable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#0078D4" />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <AddressSection
            title="Current"
            data={currentAddress}
            isExpanded={isCurrentExpanded}
            onToggle={() => {
              setIsCurrentExpanded(!isCurrentExpanded);
              setIsPermanentExpanded(false);
            }}
          />
          <AddressSection
            title="Permanent"
            data={permanentAddress}
            isExpanded={isPermanentExpanded}
            onToggle={() => {
              setIsPermanentExpanded(!isPermanentExpanded);
              setIsCurrentExpanded(false);
            }}
          />
        </View>

        {/* Documents Grid - 2x2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-document" size={18} color="#0078D4" />
            <Text style={styles.sectionTitle}>Documents</Text>
          </View>
          <View style={styles.docGrid}>
            <DocumentLink label="Resume" url={document.resume} icon="file-document" />
            <DocumentLink label="ID Proof" url={document.idProof} icon="card-account-details" />
            <DocumentLink label="Address" url={document.addressProof} icon="home-map-marker" />
            <DocumentLink label="Experience" url={document.experienceLetter} icon="briefcase" />
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8F9FA', },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', },
  loadingText: { fontSize: 14, color: '#666', marginTop: 12, fontFamily: 'Poppins-Regular', },
  errorText: { fontSize: 16, color: '#404040', fontFamily: 'Poppins-Medium', marginTop: 12, },
  container: { flex: 1, },
  scrollContent: { paddingBottom: 20, },
  // Header
  header: { flexDirection:'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0', gap: 8 },
  backBtn: { borderWidth: 0.3, marginRight: 4, padding: 4, backgroundColor: "#2563eb", borderRadius: 8, },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: "#1A1A1A", },
  // MINIMAL Profile Header - Zero extra space
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8E8E8', borderWidth: 2, borderColor: '#0078D4', },
  profileInfo: { flex: 1, marginLeft: 14, },
  profileName: { fontSize: 18, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', marginBottom: 2, },
  profileRole: { fontSize: 13, color: '#666', fontFamily: 'Poppins-Regular', marginBottom: 4, },
  deptBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, backgroundColor: '#E8F4FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, },
  deptText: { fontSize: 11, color: '#0078D4', fontFamily: 'Poppins-Medium', },
  // Contact Grid - 2x2
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10, backgroundColor: '#FFFFFF', },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 10, width: '48%', gap: 8, },
  infoCardContent: { flex: 1, },
  infoCardLabel: { fontSize: 10, color: '#999', fontFamily: 'Poppins-Regular', marginBottom: 2, },
  infoCardValue: { fontSize: 12, color: '#1C1C1C', fontFamily: 'Poppins-Medium', },
  // Section Styles
  section: { backgroundColor: '#FFFFFF', marginTop: 8, paddingVertical: 12, },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 8, },
  sectionTitle: { fontSize: 15, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', },
  // Compact List Grid
  gridContainer: { paddingHorizontal: 16, },
  compactListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', },
  compactLabel: { fontSize: 12, color: '#666', fontFamily: 'Poppins-Regular', flex: 1, },
  compactValue: { fontSize: 12, color: '#1C1C1C', fontFamily: 'Poppins-Medium', textAlign: 'right', flex: 1, },
  // Address Section
  addressSection: { marginHorizontal: 16, marginBottom: 8, },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F8F9FA', borderRadius: 10, },
  addressTitle: { fontSize: 13, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', },
  addressContent: { paddingTop: 10, paddingHorizontal: 12, },
  addressFull: { fontSize: 12, color: '#404040', fontFamily: 'Poppins-Regular', lineHeight: 18, marginBottom: 6, },
  addressGrid: { gap: 4, },
  addressDetail: { fontSize: 11, color: '#666', fontFamily: 'Poppins-Regular', },
  // Document Grid - 2x2
  docGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, },
  docCard: { width: '48%', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E8E8E8', },
  docLabel: { fontSize: 11, color: '#1C1C1C', fontFamily: 'Poppins-Medium', textAlign: 'center', },
  docIcon: { marginTop: 2, },
  bottomSpace: { height: 16, },
});