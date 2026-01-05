import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getFeedBack } from '../Services/feedbackService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const response = await getFeedBack();
      setFeedbackList(response || []); // ✅ FIXED HERE
    } catch (e) {
      console.log('Error fetching feedback:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  headerContainer:{flexDirection:'row',alignItems:'center',marginHorizontal:15,marginVertical:10},
  backButton:{marginRight:10,padding:5},
  backButtonText:{fontSize:12,color:'#007bff',fontFamily:'Poppins-SemiBold',fontWeight:'bold'},
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
});
