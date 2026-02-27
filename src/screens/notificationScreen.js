import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function NotificationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff'},
  // Header
  header: { flexDirection: 'row',paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0', gap: 8, alignItems: 'center', },
  backBtn: { marginRight: 4, padding:4, backgroundColor: "#2563eb", borderRadius: 8, },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#1A1A1A', },
})