import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFeedBack, createFeedBack, deleteFeedBack, updateFeedBack, getDepartments } from '../Services/feedbackService';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ✅ OUTSIDE main component
const DepartmentDropdown = ({ value, onSelect, show, setShow, departments }) => (
  <View style={{ flex: 1 }}>
    <TouchableOpacity
      style={[styles.inlineInput, styles.dropdownToggle, show && styles.inputFocused]}
      onPress={() => setShow(prev => !prev)}
    >
      <Text style={value ? styles.dropdownSelectedText : styles.dropdownPlaceholder} numberOfLines={1}>
        {value || 'Department *'}
      </Text>
      <MaterialCommunityIcons name={show ? 'chevron-up' : 'chevron-down'} size={16} color="#007bff" />
    </TouchableOpacity>
    {show && (
      <View style={styles.dropdownList}>
        <ScrollView
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
        {departments.map((dept, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dropdownItem,
              value === dept && styles.dropdownItemSelected,
              index === departments.length - 1 && { borderBottomWidth: 0 }
            ]}
            onPress={() => { onSelect(dept); setShow(false); }}
          >
            <Text style={[styles.dropdownItemText, value === dept && styles.dropdownItemTextSelected]}>
              {dept}
            </Text>
            {value === dept && <MaterialCommunityIcons name="check" size={14} color="#007bff" />}
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>
    )}
  </View>
);

// ✅ OUTSIDE main component
const FeedbackForm = ({ formState, setFormState, showDept, setShowDept, departments }) => (
  <>
    <View style={styles.inputRow}>
      <TextInput
        placeholder="Name *"
        style={[styles.inlineInput, { flex: 1, marginRight: 6 }]}
        value={formState.name}
        onChangeText={v => setFormState(prev => ({ ...prev, name: v }))}
      />
      <DepartmentDropdown
        value={formState.department}
        onSelect={dept => setFormState(prev => ({ ...prev, department: dept }))}
        show={showDept}
        setShow={setShowDept}
        departments={departments}
      />
    </View>

    <TextInput
      placeholder="Subject *"
      style={styles.fullInput}
      value={formState.subject}
      onChangeText={v => setFormState(prev => ({ ...prev, subject: v }))}
    />

    <View>
      <TextInput
        placeholder="Description *"
        style={[styles.fullInput, styles.textArea]}
        multiline
        maxLength={200}
        value={formState.description}
        onChangeText={v => setFormState(prev => ({ ...prev, description: v }))}
      />
      <Text style={styles.charCount}>{formState.description.length}/200</Text>
    </View>

    <TextInput
      placeholder="Remark (optional)"
      style={styles.fullInput}
      value={formState.remark}
      onChangeText={v => setFormState(prev => ({ ...prev, remark: v }))}
    />
  </>
);

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', subject: '', description: '', remark: '' });
  const [showCreateDeptDropdown, setShowCreateDeptDropdown] = useState(false);

  // Edit Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', subject: '', description: '', remark: '', date: '', status: '' });
  const [updating, setUpdating] = useState(false);
  const [showEditDeptDropdown, setShowEditDeptDropdown] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [feedbackResponse, departmentsResponse] = await Promise.all([
        getFeedBack(),
        getDepartments(),
      ]);
      setFeedbackList(feedbackResponse || []);
      setDepartments(departmentsResponse?.map(d => d.department) || []);
    } catch (e) {
      console.log('Error fetching data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const submitFeedback = async () => {
    if (!form.name || !form.department || !form.subject || !form.description) {
      Alert.alert("Validation", "Please fill in all required fields marked with *");
      return;
    }
    try {
      setSubmitting(true);
      await createFeedBack(form);
      setModalVisible(false);
      setShowCreateDeptDropdown(false);
      setForm({ name: '', department: '', subject: '', description: '', remark: '' });
      loadData(true);
    } catch (e) {
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
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
    if (!editForm.name || !editForm.department || !editForm.subject || !editForm.description) {
      Alert.alert("Validation", "Please fill in all required fields marked with *");
      return;
    }
    try {
      setUpdating(true);
      await updateFeedBack(editingItem.id, editForm);
      setEditModalVisible(false);
      setShowEditDeptDropdown(false);
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

                <Text style={styles.subject} numberOfLines={isExpanded ? undefined : 1}>{item.subject}</Text>

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
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setModalVisible(false); setShowCreateDeptDropdown(false); }}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.rowCenter}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={15} color="#000080" />
                <Text style={styles.modalTitle}> Submit Feedback</Text>
              </View>
              <TouchableOpacity onPress={() => { setModalVisible(false); setShowCreateDeptDropdown(false); }}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <Text style={styles.requiredNote}>Fields marked * are required</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <FeedbackForm
                formState={form}
                setFormState={setForm}
                showDept={showCreateDeptDropdown}
                setShowDept={setShowCreateDeptDropdown}
                departments={departments}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setModalVisible(false); setShowCreateDeptDropdown(false); }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitFeedback}
                  disabled={submitting}
                  style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                >
                  {submitting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <View style={styles.submitBtnInner}>
                        <Text style={styles.submitTxt}>Submit</Text>
                        <MaterialCommunityIcons name="send-outline" size={13} color="#fff" />
                      </View>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setEditModalVisible(false); setShowEditDeptDropdown(false); }}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.rowCenter}>
                <MaterialCommunityIcons name="clipboard-edit-outline" size={15} color="#000080" />
                <Text style={styles.modalTitle}> Edit Feedback</Text>
              </View>
              <TouchableOpacity onPress={() => { setEditModalVisible(false); setShowEditDeptDropdown(false); }}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <Text style={styles.requiredNote}>Fields marked * are required</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <FeedbackForm
                formState={editForm}
                setFormState={setEditForm}
                showDept={showEditDeptDropdown}
                setShowDept={setShowEditDeptDropdown}
                departments={departments}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setEditModalVisible(false); setShowEditDeptDropdown(false); }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdate}
                  disabled={updating}
                  style={[styles.submitButton, updating && { opacity: 0.6 }]}
                >
                  {updating
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <View style={styles.submitBtnInner}>
                        <Text style={styles.submitTxt}>Update</Text>
                        <MaterialCommunityIcons name="check-outline" size={13} color="#fff" />
                      </View>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
  modalCard: { backgroundColor: '#fff', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#000080' },
  requiredNote: { fontSize: 10, color: '#aaa', fontFamily: 'Poppins-Regular', marginBottom: 10 },
  // Form Inputs
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  inlineInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, fontFamily: 'Poppins-Regular', fontSize: 12, backgroundColor: '#fff' },
  fullInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 6, fontFamily: 'Poppins-Regular', fontSize: 12, backgroundColor: '#fff' },
  inputFocused: { borderColor: '#007bff' },
  textArea: { height: 60, textAlignVertical: 'top' },
  charCount: { fontSize: 10, color: '#aaa', fontFamily: 'Poppins-Regular', textAlign: 'right', marginTop: -4, marginBottom: 6 },
  // Dropdown
  dropdownToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownPlaceholder: { color: '#aaa', fontFamily: 'Poppins-Regular', fontSize: 12, flex: 1 },
  dropdownSelectedText: { color: '#333', fontFamily: 'Poppins-Regular', fontSize: 12, flex: 1 },
  dropdownList: { position: 'absolute', top: 38, left: 0, right: 0, zIndex: 999, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fff', overflow: 'hidden', elevation: 4, maxHeight: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownItemSelected: { backgroundColor: '#e3f2fd' },
  dropdownItemText: { fontSize: 12, color: '#333', fontFamily: 'Poppins-Regular' },
  dropdownItemTextSelected: { color: '#007bff', fontFamily: 'Poppins-Medium' },
  // Modal Actions
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cancelButton: { borderWidth: 0.5, borderColor: '#000080', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 20 },
  cancelText: { color: '#000080', fontFamily: 'Poppins-Regular', fontSize: 12 },
  submitButton: { flex: 1, marginLeft: 10, backgroundColor: '#7cfc00', borderRadius: 18, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  submitTxt: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 12 },
});