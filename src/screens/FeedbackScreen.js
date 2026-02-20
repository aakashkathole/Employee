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
    Alert.alert(
      "Delete Feedback",
      "Are you sure you want to delete this feedback?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFeedBack(feedbackId);
              loadData(true);
            } catch (e) {
              Alert.alert("Error", "Failed to delete feedback. Please try again.");
              console.log(e);
            }
          }
        }
      ]
    );
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
      Alert.alert("Error", "Failed to update feedback. Please try again.");
      console.log(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !refreshing) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Feedback</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.submitBtn}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 15 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {feedbackList.length === 0 ? (
          <Text style={styles.emptyText}>No feedback available</Text>
        ) : (
          feedbackList.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.statusBadge, item.status === 'New' && styles.newStatus]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.department}>Department: {item.department}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>Date: {item.date}</Text>

              {/* Edit & Delete Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPress(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Feedback</Text>
            {['name', 'department', 'subject', 'description', 'remark'].map(f => (
              <TextInput
                key={f}
                placeholder={f.toUpperCase()}
                style={styles.input}
                multiline={f === 'description'}
                value={form[f]}
                onChangeText={v => setForm({ ...form, [f]: v })}
              />
            ))}
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitFeedback}
                disabled={submitting}
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#ffffff" />
                  : <Text style={styles.submitTxt}>Submit Feedback</Text>}
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
            {['name', 'department', 'subject', 'description', 'remark'].map(f => (
              <TextInput
                key={f}
                placeholder={f.toUpperCase()}
                style={styles.input}
                multiline={f === 'description'}
                value={editForm[f]}
                onChangeText={v => setEditForm({ ...editForm, [f]: v })}
              />
            ))}
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={updating}
                style={[styles.submitButton, updating && { opacity: 0.6 }]}
              >
                {updating
                  ? <ActivityIndicator size="small" color="#ffffff" />
                  : <Text style={styles.submitTxt}>Update Feedback</Text>}
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
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 15, marginVertical: 10 },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 12, color: '#007bff', fontFamily: 'Poppins-SemiBold' },
  header: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333' },
  card: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#333' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  newStatus: { backgroundColor: '#e3f2fd' },
  statusText: { fontSize: 11, color: '#007bff', fontFamily: 'Poppins-SemiBold' },
  subject: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#333', marginTop: 5 },
  department: { fontSize: 12, color: '#666', marginTop: 2 },
  description: { fontSize: 13, color: '#555', marginTop: 6 },
  date: { fontSize: 11, color: '#999', marginTop: 6 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 14 },
  submitBtn: { color: '#007bff', backgroundColor: '#e3f2fd', fontFamily: 'Poppins-Medium', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 18 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 15, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalTitle: { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 15, color: '#000080', alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 15, padding: 10, marginBottom: 8, fontFamily: 'Poppins-Regular' },
  cancelText: { color: '#000080', fontFamily: 'Poppins-Regular', borderWidth: 0.5, borderRadius: 18, borderColor: '#000080', paddingVertical: 8, paddingHorizontal: 16 },
  submitTxt: { color: '#fff', fontFamily: 'Poppins-Medium' },
  submitButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#7cfc00', borderRadius: 18 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  editBtn: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: '#e3f2fd', borderRadius: 18 },
  editBtnText: { color: '#007bff', fontFamily: 'Poppins-Medium', fontSize: 12 },
  deleteBtn: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: '#fdecea', borderRadius: 18 },
  deleteBtnText: { color: '#e53935', fontFamily: 'Poppins-Medium', fontSize: 12 },
});