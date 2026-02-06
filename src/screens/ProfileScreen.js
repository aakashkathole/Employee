import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, Pressable, ToastAndroid, Platform, Alert, StatusBar } from 'react-native';
import { useDashboard } from "../context/DashboardContext"; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Component for Key-Value Data Row
const ProfileListItem = ({ label, value }) => (
  <View style={styles.listItem}>
    <Text style={styles.listItemLabel}>{label}</Text>
    <Text style={styles.listItemValue}>{value}</Text>
  </View>
);

// Component for Actionable Links
const ProfileLinkItem = ({ label, url }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const showToast = (message, gravity = ToastAndroid.BOTTOM) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        gravity
      );
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
        showToast(` Cannot open ${label}`, ToastAndroid.CENTER);
        setIsDownloading(false);
        return;
      }

      showToast(` Opening ${label}...`, ToastAndroid.BOTTOM);
      
      await Linking.openURL(url);
      
      setTimeout(() => {
        showToast(` ${label} opened successfully!`, ToastAndroid.BOTTOM);
      }, 250);
      
    } catch (error) {
      console.error('Link error:', error);
      showToast(` Failed to open ${label}`, ToastAndroid.CENTER);
    } finally {
      setTimeout(() => setIsDownloading(false), 200);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.listItemAction, isDownloading && { opacity: 0.5 }]} 
      onPress={handlePress}
      disabled={isDownloading}
      activeOpacity={0.7}
    >
      <View style={styles.linkContainer}>
        <MaterialCommunityIcons 
          name={
            label.includes('Resume') ? 'file-document' :
            label.includes('ID') ? 'card-account-details' :
            label.includes('Address') ? 'home-map-marker' :
            label.includes('Experience') ? 'briefcase' : 'file'
          } 
          size={24} 
          color="#0078D4" 
          style={styles.linkIcon}
        />
        <Text style={styles.linkText}>{label}</Text>
      </View>
      {isDownloading ? (
        <ActivityIndicator size="small" color="#0078D4" />
      ) : (
        <MaterialCommunityIcons name={'download'} size={22} color="#34A853" />
      )}
    </TouchableOpacity>
  );
};

// Collapsible Section Component
const CollapsibleAddressSection = ({ title, addressData, isExpanded, handlePress }) => {
  return (
    <View style={styles.collapsibleSection}>
      <Pressable 
        onPress={handlePress}
        style={({ pressed }) => [
          styles.collapsibleHeader,
          pressed && styles.collapsibleHeaderPressed,
        ]}
        android_ripple={{ color: '#E8E8E8', borderless: false }}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#404040"
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.collapsibleContent}>
          <ProfileListItem label="Landmark" value={addressData.landmark} />
          <ProfileListItem label="City" value={addressData.city} />
          <ProfileListItem label="Taluka" value={addressData.taluka} />
          <ProfileListItem label="District" value={addressData.district} />
          <ProfileListItem label="Pincode" value={addressData.pinCode} />
          <ProfileListItem label="State" value={addressData.state} />
          <ProfileListItem label="Country" value={addressData.country} />
          {/* Full Address - Special handling for long text */}
          <View style={styles.fullAddressItem}>
            <Text style={styles.listItemLabel}>Full Address</Text>
            <Text style={styles.fullAddressValue}>{addressData.fullAddress}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { dashboardData, loading } = useDashboard();
  
  const [isCurrentExpanded, setIsCurrentExpanded] = useState(true);
  const [isPermanentExpanded, setIsPermanentExpanded] = useState(false);

  const handleAddressPress = (section) => {
    if (section === 'current') {
      setIsCurrentExpanded(prev => !prev);
      setIsPermanentExpanded(false);
    } else if (section === 'permanent') {
      setIsPermanentExpanded(prev => !prev);
      setIsCurrentExpanded(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error/No Data State
  if (!dashboardData || !dashboardData.employee) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>No profile data available</Text>
        <Text style={styles.errorSubText}>Please try again later</Text>
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
    landmark: address.landmark || 'N/A',
    taluka: address.taluka || 'N/A',
    country: address.country || 'N/A',
  };
  
  const permanentAddress = {
    city: address.pcity || 'N/A',
    state: address.pstate || 'N/A',
    district: address.pdistrict || 'N/A',
    pinCode: address.ppinCode || 'N/A',
    fullAddress: address.paddress || 'N/A',
    landmark: address.plandmark || 'N/A',
    taluka: address.ptaluka || 'N/A',
    country: address.pcountry || 'N/A',
  };
  
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Hero Section - One UI Style */}
        <View style={styles.heroSection}>
          <View style={styles.profilePhotoContainer}>
            <Image
              source={{ uri: document.employeePhoto }}
              style={styles.profilePhoto}
            />
            <View style={styles.photoBadge}>
              <MaterialCommunityIcons name="check" size={16} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.heroName}>{employee.fullName}</Text>
          <Text style={styles.heroDesignation}>{employee.designation}</Text>
          <View style={styles.heroDepartment}>
            <MaterialCommunityIcons name="office-building" size={16} color="#666" />
            <Text style={styles.heroDepartmentText}>{employee.department}</Text>
          </View>
        </View>

        {/* Quick Info Cards - One UI Style */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#0078D4" />
            <Text style={styles.quickInfoLabel}>Email</Text>
            <Text style={styles.quickInfoValue} numberOfLines={1}>{employee.empEmail}</Text>
          </View>
          
          <View style={styles.quickInfoCard}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#0078D4" />
            <Text style={styles.quickInfoLabel}>Mobile</Text>
            <Text style={styles.quickInfoValue}>{employee.mobileNo}</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-circle" size={24} color="#0078D4" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.cardContent}>
            <ProfileListItem label="Date of Birth" value={employee.dob} />
            <ProfileListItem label="Gender" value={employee.gender} />
            <ProfileListItem label="Blood Group" value={employee.bloodGroup} />
            <ProfileListItem label="Parent Contact" value={employee.parentNo} />
          </View>
        </View>

        {/* Employment Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="briefcase" size={24} color="#0078D4" />
            <Text style={styles.sectionTitle}>Employment Details</Text>
          </View>
          <View style={styles.cardContent}>
            <ProfileListItem label="Designation" value={employee.designation} />
            <ProfileListItem label="Department" value={employee.department} />
            <ProfileListItem label="Joining Date" value={employee.joiningDate || 'N/A'} />
            <ProfileListItem label="Work Location" value={employee.workLocation}/>
            <ProfileListItem label="Duty Type" value={employee.dutyType}/>
            <ProfileListItem label="Employee Type" value={employee.employeeType} />
            <ProfileListItem label="Salary" value={employee.salary}/>
            <ProfileListItem label="Shift" value={employee.shift}/>
          </View>
        </View>

        {/* Address Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#0078D4" />
            <Text style={styles.sectionTitle}>Address Information</Text>
          </View>
          <View style={styles.cardContent}>
            <CollapsibleAddressSection
              title="Current Address"
              addressData={currentAddress}
              isExpanded={isCurrentExpanded}
              handlePress={() => handleAddressPress('current')}
            />
            
            <View style={styles.separator} /> 

            <CollapsibleAddressSection
              title="Permanent Address"
              addressData={permanentAddress}
              isExpanded={isPermanentExpanded}
              handlePress={() => handleAddressPress('permanent')}
            />
          </View>
        </View>

        {/* Documents Card */}
        <View style={[styles.card, styles.lastCard]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-document-multiple" size={24} color="#0078D4" />
            <Text style={styles.sectionTitle}>Documents</Text>
          </View>
          <View style={styles.cardContent}>
            <ProfileLinkItem label="Resume" url={document.resume} />
            <ProfileLinkItem label="ID Proof" url={document.idProof} />
            <ProfileLinkItem label="Address Proof" url={document.addressProof} />
            <ProfileLinkItem label="Experience Letter" url={document.experienceLetter} />
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F5F5', },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 20, },
  loadingText: { fontSize: 16, color: '#666', marginTop: 16, fontFamily: 'Poppins-Regular', },
  errorText: { fontSize: 20, color: '#404040', fontFamily: 'Poppins-Medium', marginTop: 16, },
  errorSubText: { fontSize: 14, color: '#999', marginTop: 8, fontFamily: 'Poppins-Regular', },
  container: { flex: 1, },
  scrollContent: { paddingHorizontal: 20, },
  // Hero Section 
  heroSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 32, },
  profilePhotoContainer: { position: 'relative', marginBottom: 20, },
  profilePhoto: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: '#E8E8E8', },
  photoBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#34A853', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F5F5F5', },
  heroName: { fontSize: 28, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', textAlign: 'center', marginBottom: 4, },
  heroDesignation: { fontSize: 16, color: '#666', fontFamily: 'Poppins-Regular', textAlign: 'center', marginBottom: 8, },
  heroDepartment: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#E8F4FD', borderRadius: 20, },
  heroDepartmentText: { fontSize: 14, color: '#0078D4', fontFamily: 'Poppins-Medium', },
  // Quick Info Cards 
  quickInfoContainer: { flexDirection: 'row', gap: 12, marginBottom: 20, },
  quickInfoCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, },
  quickInfoLabel: { fontSize: 12, color: '#999', fontFamily: 'Poppins-Regular', marginTop: 8, marginBottom: 2, },
  quickInfoValue: { fontSize: 13, color: '#1C1C1C', fontFamily: 'Poppins-Medium', textAlign: 'center', },
  // Card Styles 
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, },
  lastCard: { marginBottom: 0, },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 12, },
  sectionTitle: { fontSize: 18, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', flex: 1, },
  cardContent: { paddingHorizontal: 20, paddingBottom: 12, },
  // List Item Styles 
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', },
  listItemLabel: { fontSize: 15, color: '#666', fontFamily: 'Poppins-Regular', flex: 1, },
  listItemValue: { fontSize: 15, color: '#1C1C1C', fontFamily: 'Poppins-Medium', textAlign: 'right', flexShrink: 1, marginLeft: 16, },
  // Full Address Item - Special styling for long text
  fullAddressItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', },
  fullAddressValue: { fontSize: 15, color: '#1C1C1C', fontFamily: 'Poppins-Medium', marginTop: 6, lineHeight: 22, },
  // Action Link Styles 
  listItemAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', minHeight: 56, },
  linkContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, },
  linkIcon: { marginRight: 12, },
  linkText: { color: '#0078D4', fontSize: 15, fontFamily: 'Poppins-Medium', flex: 1, },
  // Accordion/Collapsible Styles 
  collapsibleSection: { marginVertical: 4, },
  collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4, borderRadius: 12, },
  collapsibleHeaderPressed: { backgroundColor: '#F5F5F5', },
  collapsibleTitle: { fontSize: 16, color: '#1C1C1C', fontFamily: 'Poppins-SemiBold', flex: 1, },
  collapsibleContent: { paddingTop: 4, },
  separator: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 12, },
  // Bottom Spacer
  bottomSpacer: { height: 24, },
});