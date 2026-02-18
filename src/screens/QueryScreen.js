import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, TextInput, Keyboard, LayoutAnimation, UIManager, Platform, } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllQueries } from '../Services/queryService';
import { createNewQuery } from '../Services/queryService';
import { deleteQuery } from '../Services/queryService';
import { updateQuery } from '../Services/queryService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function QueryScreen() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState(null);
  const [formExpanded, setFormExpanded] = useState(false);    
  const navigation = useNavigation();

  const loadData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      const data = await fetchAllQueries();
      setQueries(data);
      setQuery('');
      setIsEditing(false);
      setEditingQueryId(null);
      setFormExpanded(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch queries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFormExpanded(prev => !prev);
    if (formExpanded && isEditing) handleCancelEdit();
  };

  const handleSubmitQuery = async () => {
    if (!query || query.trim().length === 0) {
      Alert.alert("Missing Information", "Please enter a query.");
      return;
    }
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateQuery(editingQueryId, query.trim());
        Alert.alert("Success", "Query updated.");
      } else {
        await createNewQuery({ query: query.trim() });
        Alert.alert("Success", "Query submitted.");
      }
      setQuery('');
      setIsEditing(false);
      setEditingQueryId(null);
      loadData();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuery('');
    setIsEditing(false);
    setEditingQueryId(null);
    setFormExpanded(false);
  };

  const handleEditQuery = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuery(item.query);
    setIsEditing(true);
    setEditingQueryId(item.id);
    setFormExpanded(true);
  };

  const handleDeleteQuery = (queryId) => {
    Alert.alert("Delete Query", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            const message = await deleteQuery(queryId);
            Alert.alert("Deleted", message);
            loadData();
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        }
      }
    ]);
  };

  const renderQueryCard = (item, index) => (
    <View key={item.id || index} style={[
      styles.card,
      isEditing && editingQueryId === item.id && styles.cardEditing
    ]}>
      <View style={styles.cardRow}>
        <View style={styles.cardContent}>
          <View style={styles.cardMeta}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>#{index + 1}</Text>
            </View>
            {item.date ? <Text style={styles.cardDate}>{item.date}</Text> : null}
          </View>
          <Text style={styles.cardQuery} numberOfLines={4}>{item.query || 'N/A'}</Text>
        </View>
        <View style={styles.cardIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleEditQuery(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnDanger]}
            onPress={() => handleDeleteQuery(item.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>Queries</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{queries.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, (formExpanded && !isEditing) && styles.addBtnActive]}
          onPress={toggleForm}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={formExpanded && !isEditing ? 'close' : 'plus'}
            size={18}
            color="#fff"
          />
          <Text style={styles.addBtnText}>
            {formExpanded && !isEditing ? 'Close' : 'New'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collapsible Form */}
      {formExpanded && (
        <View style={[styles.formPanel, isEditing && styles.formPanelEditing]}>
          {isEditing && (
            <View style={styles.editBanner}>
              <MaterialCommunityIcons name="pencil-circle" size={14} color="#92400e" />
              <Text style={styles.editBannerText}>
                Editing query #{queries.findIndex(q => q.id === editingQueryId) + 1}
              </Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.input}
            onChangeText={setQuery}
            value={query}
            placeholder="What is your query?"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            autoFocus={formExpanded}
          />
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmitQuery}
            activeOpacity={0.8}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name={isEditing ? 'check' : 'send'} size={16} color="#fff" />
                <Text style={styles.submitBtnText}>{isEditing ? 'Update' : 'Submit'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Queries List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
        keyboardShouldPersistTaps="handled"
      >
        {queries.length > 0 ? (
          queries.map((item, index) => renderQueryCard(item, index))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-question-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No queries yet</Text>
            <Text style={styles.emptyText}>Tap + New to submit your first query</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 17, color: '#0f172a' },
  countBadge: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#bfdbfe' },
  countBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#2563eb' },
  backBtn: { marginRight: 4, padding: 4, backgroundColor: '#2563eb', borderRadius: 8, },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnActive: { backgroundColor: '#64748b' },
  addBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#fff' },
  // Form Panel
  formPanel: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 8 },
  formPanelEditing: { borderBottomColor: '#93c5fd', backgroundColor: '#f8faff' },
  editBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  editBannerText: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#92400e', flex: 1 },
  cancelText: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#2563eb' },
  input: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#1e293b', borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minHeight: 60, backgroundColor: '#fff', textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10 },
  submitBtnDisabled: { backgroundColor: '#94a3b8' },
  submitBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#fff' },
  // Scroll / List
  scrollContent: { padding: 12, gap: 8, flexGrow: 1 },
  // Card
  card: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  cardEditing: { borderColor: '#2563eb', borderWidth: 1.5, backgroundColor: '#f0f7ff' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardContent: { flex: 1, gap: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardBadge: { backgroundColor: '#eff6ff', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  cardBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: 10, color: '#2563eb' },
  cardDate: { fontFamily: 'Poppins-Regular', fontSize: 10, color: '#94a3b8' },
  cardQuery: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#334155', lineHeight: 19 },
  // Card Icons
  cardIcons: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { backgroundColor: '#fef2f2' },
  // Empty State
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#94a3b8', marginTop: 10, marginBottom: 4 },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#cbd5e1', textAlign: 'center' },
});