import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, TextInput, Keyboard, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllQueries } from '../Services/queryService';
import { createNewQuery } from '../Services/queryService';
import { deleteQuery } from '../Services/queryService';
import { updateQuery } from '../Services/queryService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function QueryScreen() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState(null);

  const loadData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchAllQueries();
      setQueries(data);

      // Reset edit query to submit query
      setQuery('');
      setIsEditing(false);
      setEditingQueryId(null);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch queries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show a loader while fetching the first time
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const handleSubmitQuery = async () => {
    // Validate
    if (!query || query.trim().length === 0) {
      Alert.alert("Missing Information", "What is the query?");
      return;
    }

    Keyboard.dismiss();
    setSubmitting(true);

    try {
      if (isEditing) {
        // UPDATE
        await updateQuery(editingQueryId, query.trim());
        Alert.alert("Success", "Query updated successfully.");
      } else {
        // CREATE
        await createNewQuery({ query: query.trim() });
        Alert.alert("Success", "Your query has been submitted successfully.");
      }

      // Reset
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
    setQuery('');
    setIsEditing(false);
    setEditingQueryId(null);
  };

  const handleDeleteQuery = (queryId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this query?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const message = await deleteQuery(queryId);
              Alert.alert("Success", message);
              loadData();
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="message-question-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Queries Yet</Text>
      <Text style={styles.emptyStateText}>Submit your first query using the form above</Text>
    </View>
  );

  const renderQueryCard = (item, index) => (
    <View key={item.id || index} style={[
      styles.card,
      isEditing && editingQueryId === item.id && styles.cardEditing
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>#{index + 1}</Text>
        </View>
        <Text style={styles.cardDate}>{item.date || 'N/A'}</Text>
      </View>
      
      <Text style={styles.cardQuery}>{item.query || 'N/A'}</Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            setQuery(item.query);
            setIsEditing(true);
            setEditingQueryId(item.id);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#007bff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDeleteQuery(item.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#dc3545" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>
            {isEditing ? 'Edit Query' : 'Submit New Query'}
          </Text>
          
          {isEditing && (
            <View style={styles.editModeBanner}>
              <MaterialCommunityIcons name="information" size={18} color="#856404" />
              <Text style={styles.editModeText}>Editing mode active</Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, isEditing && styles.inputContainerEditing]}>
            <TextInput 
              style={styles.input} 
              onChangeText={setQuery} 
              value={query} 
              placeholder='What is your query?' 
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="send"
              onSubmitEditing={handleSubmitQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitQuery}
            activeOpacity={0.7}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons 
                  name={isEditing ? 'check' : 'send'} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Query' : 'Submit Query'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Queries List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>All Queries</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{queries.length}</Text>
            </View>
          </View>

          {queries.length > 0 ? (
            queries.map((item, index) => renderQueryCard(item, index))
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa', },
  scrollContent: { flexGrow: 1, paddingBottom: 20, },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa', },
  // Input Section
  inputSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 20, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e1e4e8', },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', marginBottom: 12, },
  editModeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', borderColor: '#ffc107', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, },
  editModeText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#856404', marginLeft: 8, flex: 1, },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 4, },
  cancelButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#856404', },
  inputContainer: { borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 12, minHeight: 80, },
  inputContainerEditing: { borderColor: '#007bff', backgroundColor: '#f0f8ff', },
  input: { fontFamily: 'Poppins-Regular', fontSize: 15, color: '#333', flex: 1, },
  submitButton: { backgroundColor: '#007bff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, },
  submitButtonDisabled: { backgroundColor: '#6c757d', },
  submitButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#fff', },
  // List Section
  listSection: { paddingHorizontal: 16, },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  listTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#333', },
  countBadge: { backgroundColor: '#007bff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, },
  countBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#fff', },
  // Card Styles
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e1e4e8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, },
  cardEditing: { borderColor: '#007bff', borderWidth: 2, backgroundColor: '#f0f8ff', },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  cardBadge: { backgroundColor: '#e7f3ff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, },
  cardBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#007bff', },
  cardDate: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#6c757d', },
  cardQuery: { fontFamily: 'Poppins-Regular', fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12, },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e1e4e8', },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e7f3ff', borderRadius: 8, paddingVertical: 10, gap: 6, minHeight: 44, },
  editButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#007bff', },
  deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffe5e5', borderRadius: 8, paddingVertical: 10, gap: 6, minHeight: 44, },
  deleteButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#dc3545', },
  // Empty State
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, },
  emptyStateTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#666', marginTop: 16, marginBottom: 8, },
  emptyStateText: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#999', textAlign: 'center', },
});