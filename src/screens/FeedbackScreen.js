import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFeedBack, createFeedBack, deleteFeedBack, updateFeedBack } from '../Services/feedbackService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', subject: '', description: '', remark: '' });

  // Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', subject: '', description: '', remark: '', date: '', status: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const response = await getFeedBack();
      setFeedbackList(response || []);
    } catch (e) {
      console.log('Error fetching feedback:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const submitFeedback = async () => {
    if (!form.name || !form.department || !form.subject || !form.description) return;
    try {
      setSubmitting(true);
      await createFeedBack(form);
      setModalVisible(false);
      setForm({ name: '', department: '', subject: '', description: '', remark: '' });
      loadData(true);
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (feedbackId) => {
    Alert.alert("Delete Feedback", "Are you sure you want to delete this feedback?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteFeedBack(feedbackId);
            loadData(true);
          } catch (e) {
            Alert.alert("Error", "Failed to delete feedback.");
            console.log(e);
          }
        }
      }
    ]);
  };

  const handleEditPress = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      department: item.department,
      subject: item.subject,
      description: item.description,
      remark: item.remark || '',
      date: item.date,
      status: item.status,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editForm.name || !editForm.department || !editForm.subject || !editForm.description) return;
    try {
      setUpdating(true);
      await updateFeedBack(editingItem.id, editForm);
      setEditModalVisible(false);
      setEditingItem(null);
      loadData(true);
    } catch (e) {
      Alert.alert("Error", "Failed to update feedback.");
      console.log(e);
    } finally {
      setUpdating(false);
    }
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const renderFormFields = (formState, setFormState, fields) =>
    fields.map(f => (
      <TextInput
        key={f}
        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
        style={styles.input}
        multiline={f === 'description'}
        numberOfLines={f === 'description' ? 2 : 1}
        value={formState[f]}
        onChangeText={v => setFormState({ ...formState, [f]: v })}
      />
    ));

  if (loading && !refreshing) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Feedback</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.submitBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{ padding: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {feedbackList.length === 0 ? (
          <Text style={styles.emptyText}>No feedback available</Text>
        ) : (
          feedbackList.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity key={item.id} style={styles.card} onPress={() => toggleExpand(item.id)} activeOpacity={0.85}>

                {/* Row 1 — Name + Status + Date */}
                <View style={styles.rowBetween}>
                  <View style={styles.rowCenter}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.dept}> · {item.department}</Text>
                  </View>
                  <View style={styles.rowCenter}>
                    <View style={[styles.statusBadge, item.status === 'New' && styles.newStatus]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                    <Text style={styles.date}> {item.date}</Text>
                  </View>
                </View>

                {/* Row 2 — Subject always visible */}
                <Text style={styles.subject} numberOfLines={isExpanded ? undefined : 1}>{item.subject}</Text>

                {/* Expanded — Description + Remark + Actions */}
                {isExpanded && (
                  <>
                    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
                    {item.remark ? <Text style={styles.remark}>Remark: {item.remark}</Text> : null}
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPress(item)}>
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Feedback</Text>
            {renderFormFields(form, setForm, ['name', 'department', 'subject', 'description', 'remark'])}
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitFeedback} disabled={submitting} style={[styles.submitButton, submitting && { opacity: 0.6 }]}>
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitTxt}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Feedback</Text>
            {renderFormFields(editForm, setEditForm, ['name', 'department', 'subject', 'description', 'remark'])}
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} disabled={updating} style={[styles.submitButton, updating && { opacity: 0.6 }]}>
                {updating
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.submitTxt}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14, marginVertical: 8 },
  backButtonText: { fontSize: 12, color: '#007bff', fontFamily: 'Poppins-SemiBold' },
  header: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#333' },
  submitBtn: { color: '#007bff', backgroundColor: '#e3f2fd', fontFamily: 'Poppins-Medium', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 18, fontSize: 12 },
  // Card
  card: { backgroundColor: '#f9f9f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#333' },
  dept: { fontSize: 11, color: '#888', fontFamily: 'Poppins-Regular' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  newStatus: { backgroundColor: '#e3f2fd' },
  statusText: { fontSize: 10, color: '#007bff', fontFamily: 'Poppins-SemiBold' },
  date: { fontSize: 10, color: '#aaa', fontFamily: 'Poppins-Regular' },
  subject: { fontSize: 12, fontFamily: 'Poppins-Medium', color: '#444', marginTop: 3 },
  description: { fontSize: 12, color: '#555', marginTop: 5, lineHeight: 18 },
  remark: { fontSize: 11, color: '#888', marginTop: 3, fontFamily: 'Poppins-Regular' },
  // Actions
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  editBtn: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: '#e3f2fd', borderRadius: 18 },
  editBtnText: { color: '#007bff', fontFamily: 'Poppins-Medium', fontSize: 11 },
  deleteBtn: { paddingVertical: 4, paddingHorizontal: 14, backgroundColor: '#fdecea', borderRadius: 18 },
  deleteBtnText: { color: '#e53935', fontFamily: 'Poppins-Medium', fontSize: 11 },
  // Empty
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 13 },
  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 14, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  modalTitle: { fontSize: 15, fontFamily: 'Poppins-Medium', marginBottom: 10, color: '#000080', alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 6, fontFamily: 'Poppins-Regular', fontSize: 13 },
  cancelText: { color: '#000080', fontFamily: 'Poppins-Regular', borderWidth: 0.5, borderRadius: 18, borderColor: '#000080', paddingVertical: 7, paddingHorizontal: 14, fontSize: 13 },
  submitTxt: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 13 },
  submitButton: { paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#7cfc00', borderRadius: 18 },
});