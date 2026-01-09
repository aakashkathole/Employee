import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, RefreshControl, ScrollView, Alert, Platform, ToastAndroid, BackHandler } from "react-native";
import { WebView } from 'react-native-webview';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { fetchSalaries, getBranchAddress } from "../Services/salaryServices";
import { generateHTML, monthName, imageUrlToBase64 } from "../utils/salaryUtils";
import { requestAllPermissions, openAppSettings } from "../utils/permissions";
import SalaryCard from "../components/SalaryCard";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = [2027, 2026, 2025, 2024];

const SalaryScreen = () => {
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [monthModal, setMonthModal] = useState(false);
  const [yearModal, setYearModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [slipHtml, setSlipHtml] = useState('');
  const [slipItem, setSlipItem] = useState(null);
  const webViewRef = useRef(null);

  const loadSalaries = async (month = null, year = null, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await fetchSalaries({ month, year });
      const sortedData = [...data].sort(
        (a, b) => b.year - a.year || b.month - a.month
      );
      setSalaryList(sortedData);
    } catch (error) {
      console.log("Salary fetch error:", error);
      setSalaryList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSalaries(); }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadSalaries(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  // Handle WebView back button
  useEffect(() => {
    const backAction = () => {
      if (slipModal && webViewRef.current) {
        // Check if WebView can go back
        webViewRef.current.injectJavaScript(`
          (function() {
            if (window.history.length > 1) {
              window.history.back();
              true;
            } else {
              false;
            }
          })();
        `);
        return true; // Prevent default back action when modal is open
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [slipModal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedMonth(null);
    setSelectedYear(null);
    loadSalaries(null, null, true);
  }, []);

  const clearFilter = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
    loadSalaries(null, null);
  };

  const handleDownload = async (item) => {
    setIsDownloading(true);
    try {
      const branch = await getBranchAddress(item.branchCode);
      const logoBase64 = branch?.branchImage ? await imageUrlToBase64(branch.branchImage) : null;
      const html = generateHTML(item, branch, logoBase64);
      setSlipHtml(html);
      setSlipItem(item);
      setSlipModal(true);
    } catch (error) {
      console.error('Error generating salary slip:', error);
      Alert.alert('Error', 'Error generating salary slip. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);

      // Request permissions first
      const permissionsGranted = await requestAllPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to save PDF files. Please grant permission and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: openAppSettings
            }
          ]
        );
        return;
      }

      // Generate PDF with proper file path
      const timestamp = Date.now();
      const baseFileName = `salary_slip_${monthName(slipItem.month)}_${slipItem.year}_${timestamp}`;
      const fileName = `${baseFileName}.pdf`; // Full filename with extension
      let directory;

      if (Platform.OS === 'android') {
        // For Android, try multiple directory approaches
        let possibleDirs = [
          `${RNFS.ExternalStorageDirectoryPath}/Download`, // Primary Downloads
          RNFS.DownloadDirectoryPath, // RNFS Downloads (may not work)
          `${RNFS.ExternalDirectoryPath}/Downloads`, // App-specific Downloads
        ];

        directory = null;
        for (let dirPath of possibleDirs) {
          try {
            const dirExists = await RNFS.exists(dirPath);
            if (dirExists) {
              directory = dirPath;
              console.log('Using existing directory:', directory);
              break;
            } else {
              // Try to create the directory
              await RNFS.mkdir(dirPath);
              directory = dirPath;
              console.log('Created and using directory:', directory);
              break;
            }
          } catch (error) {
            console.log('Directory not accessible:', dirPath, error.message);
            continue;
          }
        }

        // Final fallback
        if (!directory) {
          directory = RNFS.ExternalDirectoryPath;
          console.log('Using fallback directory:', directory);
        }
      } else {
        // Use Documents directory for iOS (fallback)
        directory = RNFS.DocumentDirectoryPath;
      }

      const fullPath = `${directory}/${fileName}`;
      console.log('Target file path:', fullPath);

      // Use react-native-html-to-pdf with just filename (library will handle path)
      const options = {
        html: slipHtml,
        fileName: baseFileName, // Without .pdf extension to avoid double extension
        directory: directory,
      };

      console.log('Generating PDF with options:', options);
      const file = await generatePDF(options);
      console.log('PDF generated at:', file.filePath);

      // Check if file was created in the expected location
      const fileExistsAtTarget = await RNFS.exists(fullPath);
      console.log('File exists at target location:', fileExistsAtTarget, fullPath);

      if (!fileExistsAtTarget && file.filePath !== fullPath) {
        // File was created elsewhere, try to move it
        try {
          console.log('Moving file from', file.filePath, 'to', fullPath);
          await RNFS.moveFile(file.filePath, fullPath);
          console.log('File moved successfully');
        } catch (moveError) {
          console.warn('Could not move file:', moveError);
          // Check if the file exists at the original location
          const originalExists = await RNFS.exists(file.filePath);
          if (originalExists) {
            console.log('File exists at original location, using that path');
          }
        }
      }

      // Verify file exists and show success message
      const finalFileExists = await RNFS.exists(fullPath);
      const originalFileExists = file.filePath !== fullPath ? await RNFS.exists(file.filePath) : false;

      console.log('Final file check - Target exists:', finalFileExists, 'Original exists:', originalFileExists);

      if (finalFileExists || originalFileExists) {
        // Show success notification
        if (Platform.OS === 'android') {
          const actualPath = finalFileExists ? fullPath : file.filePath;
          const displayPath = actualPath.includes('Download') ? 'Downloads' :
                             actualPath.includes('Employee') ? 'Files/Employee' : 'Files';
          const displayFileName = actualPath.split('/').pop();

          ToastAndroid.showWithGravity(
            `Salary slip downloaded successfully!\nSaved to: ${displayPath}/${displayFileName}`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        } else {
          Alert.alert(
            'Download Complete',
            `Salary slip saved successfully!\nFile: ${fileName}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('File was not saved properly');
      }

    } catch (error) {
      console.error('Error saving salary slip:', error);
      Alert.alert(
        'Download Failed',
        `Failed to save salary slip: ${error.message}\nPlease check storage permissions and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setMonthModal(true)}
          >
            <Text style={styles.filterText}>
              {selectedMonth ? MONTHS[selectedMonth - 1] : "Select Month"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setYearModal(true)}
          >
            <Text style={styles.filterText}>{selectedYear || "Select Year"}</Text>
          </TouchableOpacity>

          {(selectedMonth || selectedYear) && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={salaryList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SalaryCard
            item={item}
            isDownloading={isDownloading}
            onDownload={handleDownload}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#2196F3"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No salary records found</Text>
          </View>
        }
      />

      {/* Month Modal */}
      <Modal visible={monthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setMonthModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {MONTHS.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    setMonthModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Modal */}
      <Modal visible={yearModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setYearModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedYear(y);
                    setYearModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Slip Modal */}
      <Modal visible={slipModal} animationType="slide">
        <View style={styles.slipContainer}>
          <View style={styles.slipHeader}>
            <Text style={styles.slipTitle}>Salary Slip</Text>
            <TouchableOpacity onPress={() => setSlipModal(false)}>
              <Text style={styles.slipClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ html: slipHtml }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={(navState) => {
              // Handle WebView navigation state changes if needed
            }}
          />
          <TouchableOpacity
            style={[styles.printBtn, isDownloading && styles.disabledBtn]}
            onPress={downloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.printBtnText}>Download PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default SalaryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center",backgroundColor: "#f5f5f5" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  // Filters
  filterContainer: { backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  filterRow: { flexDirection: "row", gap: 10 },
  filterBtn: { flex: 1, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 8, alignItems: "center" },
  filterText: { fontSize: 14, color: "#333", fontWeight: "500" },
  clearBtn: { padding: 12, backgroundColor: "#ffebee", borderRadius: 8, justifyContent: "center" },
  clearText: { color: "#d32f2f", fontWeight: "600", fontSize: 14 },
  listContent: { padding: 16,},
  // Card
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, padding: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  monthText: { fontSize: 18, fontWeight: "700", color: "#212121", marginBottom: 4 },
  dateText: { fontSize: 13, color: "#757575" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: 12,  fontWeight: "600", color: "#fff", },
  // Net Salary
  netSalaryBox: { backgroundColor: "#2196F3", padding: 16, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  netSalaryNegative: { backgroundColor: "#d32f2f" },
  netLabel: { fontSize: 13, color: "#fff", opacity: 0.9, marginBottom: 4 },
  netAmount: { fontSize: 28, fontWeight: "700", color: "#fff" },
  // Quick Info
  quickInfo: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, marginBottom: 16 },
  infoItem: { flex: 1, alignItems: "center" },
  infoLabel: { fontSize: 12, color: "#757575", marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#212121" },
  divider: { width: 1, backgroundColor: "#e0e0e0", marginHorizontal: 12 },
  // Sections
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 10, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: "#2196F3" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 14, color: "#616161" },
  value: { fontSize: 14, fontWeight: "600", color: "#212121" },
  negative: { color: "#d32f2f" },
  penalty: { color: "#f57c00" },
  // Summary
  summary: { borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: "#616161" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#212121" },
  finalRow: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  finalLabel: { fontSize: 15, fontWeight: "700", color: "#212121" },
  finalValue: { fontSize: 16, fontWeight: "700", color: "#2196F3" },
  // Empty State
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#757575" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", borderRadius: 12, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#212121" },
  modalClose: { fontSize: 22, color: "#757575" },
  modalScroll: { maxHeight: 400 },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  modalItemText: { fontSize: 16, color: "#212121" },
  // salary slip download btn
  downloadFullBtn: { marginTop: 15, paddingVertical: 12, backgroundColor: "#f0f7ff", borderRadius: 8, borderWidth: 1, borderColor: "#2196F3", flexDirection: "row", justifyContent: "center", alignItems: "center", },
  disabledBtn: { borderColor: "#BDBDBD", backgroundColor: "#F5F5F5", },
  downloadBtnText: { color: "#2196F3", fontWeight: "bold", fontSize: 14, },
  // Slip Modal
  slipContainer: { flex: 1, backgroundColor: "#fff" },
  slipHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  slipTitle: { fontSize: 18, fontWeight: "700", color: "#212121" },
  slipClose: { fontSize: 22, color: "#757575" },
  webView: { flex: 1 },
  printBtn: { padding: 16, backgroundColor: "#2196F3", alignItems: "center" },
  printBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});