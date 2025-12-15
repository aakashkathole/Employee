import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Linking, 
  ScrollView, 
  Pressable
} from 'react-native';

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
const ProfileLinkItem = ({ label, url }) => (
  <TouchableOpacity style={styles.listItemAction} onPress={() => Linking.openURL(url)}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.linkText}>{label}</Text>
    </View>
    <MaterialCommunityIcons name={'download'} size={24} color="#34A853" />
  </TouchableOpacity>
);

// --- NEW: Collapsible Section Component (Accordion View) ---
const CollapsibleAddressSection = ({ title, addressData, isExpanded, handlePress }) => {
  return (
    <View style={styles.collapsibleSection}>
      {/* 1. Header (Tappable Area) */}
      <Pressable 
        onPress={handlePress}
        style={({ pressed }) => [
          styles.collapsibleHeader,
          {
            backgroundColor: pressed ? '#f0f0f0' : '#fff', // Change color when pressed
          },
        ]}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        {/* Use a simple character as a visual cue */}
        <MaterialCommunityIcons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={24}
        color="#000080"
        style={styles.collapseIcon}
         />
      </Pressable>

      {/* 2. Content (Conditionally Rendered) */}
      {isExpanded && (
        <View style={styles.collapsibleContent}>
          <ProfileListItem label="Landmark" value={addressData.landmark} />
          <ProfileListItem label="City" value={addressData.city} />
          <ProfileListItem label="Taluka" value={addressData.taluka} />
          <ProfileListItem label="District" value={addressData.district} />
          <ProfileListItem label="Pincode" value={addressData.pinCode} />
          <ProfileListItem label="State" value={addressData.state} />
          <ProfileListItem label="Country" value={addressData.country} />
          <ProfileListItem label="Full Address" value={addressData.fullAddress} />
        </View>
      )}
    </View>
  );
};


export default function ProfileScreen() {
  const { dashboardData, loading } = useDashboard();
  
  // State for Accordion Sections
  const [isCurrentExpanded, setIsCurrentExpanded] = useState(true); // Current Address starts expanded
  const [isPermanentExpanded, setIsPermanentExpanded] = useState(false); // Permanent Address starts collapsed

  const handleAddressPress = (section) => {
    if (section === 'current') {
        // If current is pressed, toggle current and ensure permanent is closed
        setIsCurrentExpanded(prev => !prev);
        setIsPermanentExpanded(false);
    } else if (section === 'permanent') {
        // If permanent is pressed, toggle permanent and ensure current is closed
        setIsPermanentExpanded(prev => !prev);
        setIsCurrentExpanded(false);
    }
};

  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // 2. Error/No Data State
  if (!dashboardData || !dashboardData.employee) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ No profile data available</Text>
      </View>
    );
  }

  const employee = dashboardData.employee;
  const address = dashboardData.address;
  const document = dashboardData.document;
  
  // --- Address Data Standardization ---
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
  
  // --- JSX Structure ---
  return (
    <ScrollView style={styles.container}>
      
      {/* Primary Info Block */}
      <View style={styles.primaryInfoBlock}>
        <View> 
            <Text style={styles.primaryName}>{employee.fullName}</Text>
            <Text style={styles.primaryDesignation}>{employee.designation}</Text> 
        </View>
        <Image
          source={{ uri: document.employeePhoto }}
          style={styles.profilePhoto}
        />
      </View>

      {/* Card: Personal Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <ProfileListItem label="Email" value={employee.empEmail} />
        <ProfileListItem label="Mobile" value={employee.mobileNo} />
        <ProfileListItem label="Parent No" value={employee.parentNo} />
        <ProfileListItem label="DOB" value={employee.dob} />
        <ProfileListItem label="Gender" value={employee.gender} />
        <ProfileListItem label="Blood Group" value={employee.bloodGroup} />
      </View>

      {/* Card: Employee Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Employment Details</Text>
        <ProfileListItem label="Designation" value={employee.designation} />
        <ProfileListItem label="Department" value={employee.department} />
        <ProfileListItem label="Joining Date" value={employee.joiningDate || 'N/A'} />
        <ProfileListItem label="Work Location" value={employee.workLocation}/>
        <ProfileListItem label="Duty Type" value={employee.dutyType}/>
        <ProfileListItem label="Employee Type" value={employee.employeeType} />
        <ProfileListItem label="Salary" value={employee.salary}/>
        <ProfileListItem label="Shift" value={employee.shift}/>
      </View>

      {/* 5. Card: Address Information (Accordion Implementation) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        
        {/* Current Address Section */}
        <CollapsibleAddressSection
            title="Current Address"
            addressData={currentAddress}
            isExpanded={isCurrentExpanded}
            handlePress={() => handleAddressPress('current')}
        />
        
        {/* Separator between the two collapsible sections */}
        <View style={styles.separator} /> 

        {/* Permanent Address Section */}
        <CollapsibleAddressSection
            title="Permanent Address"
            addressData={permanentAddress}
            isExpanded={isPermanentExpanded}
            handlePress={() => handleAddressPress('permanent')}
        />
      </View>

      {/* Card: Documents */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <ProfileLinkItem label="Resume" url={document.resume} />
        <ProfileLinkItem label="ID Proof" url={document.idProof} />
        <ProfileLinkItem label="Address Proof" url={document.addressProof} />
        <ProfileLinkItem label="Experience Letter" url={document.experienceLetter} />
      </View>
    </ScrollView>
  );
}

// --- Stylesheet for One UI Look ---
const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F7F7F7'
  },
  errorText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 15,
    backgroundColor: '#F1F5F9',
  },
  
  // Primary Info Block (Horizontal Top Card)
  primaryInfoBlock: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 25,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilePhoto: { 
    width: 60,
    height: 60, 
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ffa500',
  },
  primaryName: {
    fontFamily:'Poppins-Medium',
    fontSize: 18,
    color: '#000000',
  },
  primaryDesignation: {
    fontFamily:'Poppins-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Card Styles (Focus Blocks)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sectionTitle: { 
    fontFamily:'Poppins-Medium',
    fontSize: 16, 
    color: '#333',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 5,
  },

  // --- Accordion/Collapsible Specific Styles ---
  collapsibleSection: {
    paddingVertical: 5,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 5,
    // Add borderBottomWidth to distinguish it from list items if needed
  },
  collapsibleTitle: {
    fontFamily:'Poppins-Medium',
    fontSize: 14,
    color: '#000',
  },
  
  collapsibleContent: {
    // Content padding is already handled by listItem padding
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 5,
    marginHorizontal: 1, // Extends separator to card edges
  },
  
  // List Item Styles (Key-Value Pairs)
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    color: '#002b59'
  },
  listItemLabel: {
    fontFamily:'Poppins-Regular', 
    color: '#000',
    fontSize: 15,
  },
  listItemValue: { 
    fontFamily:'Poppins-Regular',
    fontSize: 14, 
    color: '#000080',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },

  // Action Link Styles (Documents)
  listItemAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    color: '#000080',
    fontSize: 14,
    fontFamily:'Poppins-Regular'
  },
  
});