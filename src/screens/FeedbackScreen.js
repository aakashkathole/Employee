import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFeedBack, createFeedBack } from '../Services/feedbackService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({name: '', department: '', subject: '', description: '', remark: ''});

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
      setForm({ name:'', department:'', subject:'', description:'', remark:'' });
      loadData(true);
    } catch (e) { 
      console.log(e);
    } finally {
      setSubmitting(false);
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
            </View>
          ))
        )}
      </ScrollView>

      {/* MoDaL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Feedback</Text>
            {['name','department','subject','description','remark'].map(f => (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  headerContainer:{flexDirection:'row',alignItems:'center',justifyContent: 'space-between',marginHorizontal:15,marginVertical:10},
  backButton:{padding:5},
  backButtonText:{fontSize:12,color:'#007bff',fontFamily:'Poppins-SemiBold'},
  header:{fontSize:20,fontFamily:'Poppins-SemiBold',color:'#333'},
  card:{backgroundColor:'#f9f9f9',padding:12,borderRadius:8,marginBottom:10},
  name:{fontSize:14,fontFamily:'Poppins-SemiBold',color:'#333'},
  rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  statusBadge:{paddingHorizontal:10,paddingVertical:3,borderRadius:12},
  newStatus:{backgroundColor:'#e3f2fd'},
  statusText:{fontSize:11,color:'#007bff',fontFamily:'Poppins-SemiBold'},
  subject:{fontSize:14,fontFamily:'Poppins-SemiBold',color:'#333',marginTop:5}, 
  department:{fontSize:12,color:'#666',marginTop:2},
  description:{fontSize:13,color:'#555',marginTop:6},
  date:{fontSize:11,color:'#999',marginTop:6},
  emptyText:{textAlign:'center',marginTop:50,color:'#999',fontSize:14},
  submitBtn:{color:'#007bff', backgroundColor: '#e3f2fd',fontFamily:'Poppins-Medium', paddingVertical:6, paddingHorizontal:14,borderRadius: 18},
  modalBg:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'flex-end'},
  modalCard:{backgroundColor:'#fff',padding:15,borderTopLeftRadius:25,borderTopRightRadius:25},
  modalTitle:{fontSize:16,fontFamily:'Poppins-Medium',marginBottom:15, color:'#000080', alignSelf:'center'},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:15,padding:10,marginBottom:8,fontFamily: 'Poppins-Regular'},
  cancelText:{color:'#000080', fontFamily:'Poppins-Regular', borderWidth: 0.5, borderRadius: 18, borderColor: '#000080', paddingVertical:8, paddingHorizontal: 16},
  submitTxt:{color:'#fff',fontFamily:'Poppins-Medium'},
  submitButton:{paddingVertical:8,paddingHorizontal:16,backgroundColor: '#7cfc00', borderRadius: 18},
});
