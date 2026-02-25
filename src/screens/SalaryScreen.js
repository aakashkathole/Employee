import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, RefreshControl, Alert, Platform, ToastAndroid, BackHandler, LayoutAnimation, UIManager, } from "react-native";
import { WebView } from 'react-native-webview';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchSalaries, getBranchAddress } from "../Services/salaryServices";
import { generateHTML, monthName, imageUrlToBase64 } from "../utils/salaryUtils";
import { requestAllPermissions, openAppSettings } from "../utils/permissions";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = [2024, 2025, 2026, 2027];

// Matches original SalaryCard formatAmount exactly
const fmt = (value) => {
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

//  Compact Salary Card 
const SalaryCard = ({ item, isDownloading, onDownload }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  // Exact field from original: item.finalNetSalary
  const finalSalary = Number(item.finalNetSalary) || 0;
  const isNegative = finalSalary < 0;
  const isPaid = item.status === "Paid";

  return (
    <View style={cs.card}>
      {/* ── Compact Header (always visible) ── */}
      <TouchableOpacity style={cs.cardHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={cs.headerLeft}>
          <View style={cs.monthRow}>
            <Text style={cs.monthText}>
              {MONTHS[(item.month || 1) - 1]} {item.year}
            </Text>
            <View style={[cs.badge, isPaid ? cs.badgePaid : cs.badgePending]}>
              <MaterialCommunityIcons
                name={isPaid ? "check-circle-outline" : "clock-outline"}
                size={10}
                color={isPaid ? "#16a34a" : "#b45309"}
                style={{ marginRight: 3 }}
              />
              <Text style={[cs.badgeText, { color: isPaid ? "#16a34a" : "#b45309" }]}>
                {item.status}
              </Text>
            </View>
          </View>
          {/* item.paymentDate — exact field from original */}
          <View style={cs.subRow}>
            <MaterialCommunityIcons name="bank-outline" size={11} color="#9ca3af" />
            <Text style={cs.subText}> Payment: {item.paymentDate ?? '—'}</Text>
          </View>
        </View>
        <View style={cs.headerRight}>
          <Text style={[cs.netAmount, isNegative && { color: '#ef4444' }]}>
            {fmt(finalSalary)}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9ca3af"
          />
        </View>
      </TouchableOpacity>

      {/*  Expanded Details  */}
      {expanded && (
        <View style={cs.expanded}>
          <View style={cs.divider} />

          {/*  Quick Info: Working Days + Transaction ID  */}
          <View style={cs.quickInfo}>
            <View style={cs.infoCell}>
              <MaterialCommunityIcons name="calendar-check-outline" size={14} color="#6b7280" />
              <Text style={cs.infoLabel}>Working Days</Text>
              {/* item.workingDays / item.daysOfMonth — exact from original */}
              <Text style={cs.infoValue}>{item.workingDays ?? '—'}/{item.daysOfMonth ?? '—'}</Text>
            </View>
            <View style={cs.infoDivider} />
            <View style={cs.infoCell}>
              <MaterialCommunityIcons name="identifier" size={14} color="#6b7280" />
              <Text style={cs.infoLabel}>Transaction ID</Text>
              {/* item.transactionId — exact from original */}
              <Text style={cs.infoValue} numberOfLines={1}>{item.transactionId ?? '—'}</Text>
            </View>
          </View>

          <View style={cs.divider} />

          {/*  Earnings + Deductions side by side  */}
          <View style={cs.twoCol}>

            {/* Earnings — all fields from original SalaryCard */}
            <View style={cs.col}>
              <View style={cs.colTitleRow}>
                <MaterialCommunityIcons name="trending-up" size={12} color="#16a34a" />
                <Text style={[cs.colTitle, { color: '#16a34a' }]}>  Earnings</Text>
              </View>
              {[
                { label: 'Basic Salary',  value: fmt(item.basicSalary) },
                { label: 'Actual Basic',  value: fmt(item.actualBasic) },
                { label: 'HRA',           value: fmt(item.hraAllowance) },
                { label: 'TA',            value: fmt(item.taAllowance) },
                { label: 'Incentive',     value: fmt(item.incentive) },
                { label: 'SPI',           value: fmt(item.spi) },
                { label: 'Medical',       value: fmt(item.medicalAllowance) },
              ].map((r, i) => (
                <View key={i} style={cs.miniRow}>
                  <Text style={cs.miniLabel}>{r.label}</Text>
                  <Text style={cs.miniValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            <View style={cs.colDivider} />

            {/* Deductions — all fields from original SalaryCard */}
            <View style={cs.col}>
              <View style={cs.colTitleRow}>
                <MaterialCommunityIcons name="trending-down" size={12} color="#ef4444" />
                <Text style={[cs.colTitle, { color: '#ef4444' }]}>  Deductions</Text>
              </View>
              {[
                { label: 'PF',               value: fmt(item.pf),               color: '#ef4444' },
                { label: 'ESIC',             value: fmt(item.esic),             color: '#ef4444' },
                { label: 'Professional Tax', value: fmt(item.professionalTax),  color: '#ef4444' },
                { label: 'Income Tax',       value: fmt(item.incomeTax),        color: item.incomeTax < 0 ? '#ef4444' : '#ef4444' },
                { label: 'Company Fund',     value: fmt(item.companyFund),      color: '#ef4444' },
                { label: 'Other Deductions', value: fmt(item.deductions),       color: '#ef4444' },
                { label: 'TDS',              value: fmt(item.tds),              color: '#ef4444' },
                ...(item.penalty > 0
                  ? [{ label: 'Penalty', value: fmt(item.penalty), color: '#f97316' }]
                  : []),
              ].map((r, i) => (
                <View key={i} style={cs.miniRow}>
                  <Text style={cs.miniLabel}>{r.label}</Text>
                  <Text style={[cs.miniValue, { color: r.color }]}>{r.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={cs.divider} />

          {/*  Summary — matches original summary section  */}
          <View style={cs.summaryGrid}>
            <View style={cs.summaryCell}>
              <Text style={cs.summaryLabel}>Before Taxes</Text>
              {/* item.netSalaryBeforeTaxes — exact from original */}
              <Text style={[cs.summaryValue, item.netSalaryBeforeTaxes < 0 && { color: '#ef4444' }]}>
                {fmt(item.netSalaryBeforeTaxes)}
              </Text>
            </View>
            <View style={cs.summarySep} />
            <View style={cs.summaryCell}>
              <Text style={cs.summaryLabel}>Final Net Salary</Text>
              {/* item.finalNetSalary — exact from original */}
              <Text style={[cs.summaryValue, { color: isNegative ? '#ef4444' : '#1d4ed8', fontSize: 14 }]}>
                {fmt(finalSalary)}
              </Text>
            </View>
          </View>

          <View style={[cs.divider, { marginTop: 10 }]} />

          {/*  Download Button  */}
          <TouchableOpacity
            style={[cs.dlBtn, isDownloading && cs.dlBtnDisabled]}
            onPress={() => onDownload(item)}
            disabled={isDownloading}
          >
            {isDownloading
              ? <ActivityIndicator size="small" color="#2196F3" />
              : (
                <View style={cs.dlBtnInner}>
                  <MaterialCommunityIcons name="file-download-outline" size={16} color="#2196F3" />
                  <Text style={cs.dlBtnText}> Download Salary Slip</Text>
                </View>
              )
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

//  Main Screen 
const SalaryScreen = () => {
  const [salaryList, setSalaryList]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear]   = useState(null);
  const [monthModal, setMonthModal]       = useState(false);
  const [yearModal, setYearModal]         = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [slipModal, setSlipModal]         = useState(false);
  const [slipHtml, setSlipHtml]           = useState('');
  const [slipItem, setSlipItem]           = useState(null);
  const webViewRef = useRef(null);
  const navigation = useNavigation();

  const loadSalaries = async (month = null, year = null, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await fetchSalaries({ month, year });
      const sortedData = [...data].sort((a, b) => b.year - a.year || b.month - a.month);
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
    if (selectedMonth && selectedYear) loadSalaries(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const backAction = () => {
      if (slipModal && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          (function() {
            if (window.history.length > 1) { window.history.back(); }
          })();
        `);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [slipModal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSelectedMonth(null);
    setSelectedYear(null);
    loadSalaries(null, null, true);
  }, []);

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
      const permissionsGranted = await requestAllPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to save PDF files. Please grant permission and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ]
        );
        return;
      }

      const timestamp = Date.now();
      const baseFileName = `salary_slip_${monthName(slipItem.month)}_${slipItem.year}_${timestamp}`;
      const fileName = `${baseFileName}.pdf`;
      let directory;

      if (Platform.OS === 'android') {
        const possibleDirs = [
          `${RNFS.ExternalStorageDirectoryPath}/Download`,
          RNFS.DownloadDirectoryPath,
          `${RNFS.ExternalDirectoryPath}/Downloads`,
        ];
        directory = null;
        for (let dirPath of possibleDirs) {
          try {
            const dirExists = await RNFS.exists(dirPath);
            if (dirExists) { directory = dirPath; break; }
            else { await RNFS.mkdir(dirPath); directory = dirPath; break; }
          } catch (error) { continue; }
        }
        if (!directory) directory = RNFS.ExternalDirectoryPath;
      } else {
        directory = RNFS.DocumentDirectoryPath;
      }

      const fullPath = `${directory}/${fileName}`;
      const file = await generatePDF({ html: slipHtml, fileName: baseFileName, directory });

      if (!await RNFS.exists(fullPath) && file.filePath !== fullPath) {
        try { await RNFS.moveFile(file.filePath, fullPath); } catch (e) { console.warn('Move failed:', e); }
      }

      const finalExists = await RNFS.exists(fullPath);
      const originalExists = file.filePath !== fullPath ? await RNFS.exists(file.filePath) : false;

      if (finalExists || originalExists) {
        if (Platform.OS === 'android') {
          const actualPath = finalExists ? fullPath : file.filePath;
          const displayPath = actualPath.includes('Download') ? 'Downloads' :
                              actualPath.includes('Employee') ? 'Files/Employee' : 'Files';
          ToastAndroid.showWithGravity(
            `Salary slip downloaded!\nSaved to: ${displayPath}/${actualPath.split('/').pop()}`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        } else {
          Alert.alert('Download Complete', `Salary slip saved!\nFile: ${fileName}`, [{ text: 'OK' }]);
        }
      } else {
        throw new Error('File was not saved properly');
      }
    } catch (error) {
      console.error('Error saving salary slip:', error);
      Alert.alert('Download Failed', `Failed to save: ${error.message}`, [{ text: 'OK' }]);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return (
    <View style={s.loader}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={s.loadingText}>Loading...</Text>
    </View>
  );

  const activeFilter = selectedMonth || selectedYear;

  return (
    <View style={s.container}>
      {/*  Filter Bar  */}
      <View style={s.filterBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBTN}
          activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.filterChip} onPress={() => setMonthModal(true)}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={14}
            color={selectedMonth ? "#1565C0" : "#6b7280"}
          />
          <Text style={[s.chipText, selectedMonth && s.chipActive]}>
            {' '}{selectedMonth ? MONTHS[selectedMonth - 1].slice(0, 3) : 'Month'}
          </Text>
          <MaterialCommunityIcons name="menu-down" size={16} color={selectedMonth ? "#1565C0" : "#6b7280"} />
        </TouchableOpacity>

        <TouchableOpacity style={s.filterChip} onPress={() => setYearModal(true)}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={14}
            color={selectedYear ? "#1565C0" : "#6b7280"}
          />
          <Text style={[s.chipText, selectedYear && s.chipActive]}>
            {' '}{selectedYear || 'Year'}
          </Text>
          <MaterialCommunityIcons name="menu-down" size={16} color={selectedYear ? "#1565C0" : "#6b7280"} />
        </TouchableOpacity>

        {activeFilter && (
          <TouchableOpacity
            style={s.clearChip}
            onPress={() => { setSelectedMonth(null); setSelectedYear(null); loadSalaries(); }}
          >
            <MaterialCommunityIcons name="close-circle" size={14} color="#dc2626" />
            <Text style={s.clearText}> Clear</Text>
          </TouchableOpacity>
        )}

        <Text style={s.countText}>{salaryList.length} record{salaryList.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={salaryList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SalaryCard item={item} isDownloading={isDownloading} onDownload={handleDownload} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color="#d1d5db" />
            <Text style={s.emptyText}>No salary records found</Text>
          </View>
        }
      />

      {/*  Month Modal  */}
      <Modal visible={monthModal} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setMonthModal(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetTitleRow}>
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#374151" />
              <Text style={s.sheetTitle}> Select Month</Text>
            </View>
            <View style={s.monthGrid}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.monthCell, selectedMonth === i + 1 && s.monthCellActive]}
                  onPress={() => { setSelectedMonth(i + 1); setMonthModal(false); }}
                >
                  <Text style={[s.monthCellText, selectedMonth === i + 1 && s.monthCellTextActive]}>
                    {m.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/*  Year Modal  */}
      <Modal visible={yearModal} transparent animationType="slide">
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setYearModal(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetTitleRow}>
              <MaterialCommunityIcons name="calendar-outline" size={18} color="#374151" />
              <Text style={s.sheetTitle}> Select Year</Text>
            </View>
            <View style={s.yearRow}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[s.yearCell, selectedYear === y && s.monthCellActive]}
                  onPress={() => { setSelectedYear(y); setYearModal(false); }}
                >
                  <Text style={[s.yearCellText, selectedYear === y && s.monthCellTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/*  Slip Modal  */}
      <Modal visible={slipModal} animationType="slide">
        <View style={s.slipContainer}>
          <View style={s.slipHeader}>
            <TouchableOpacity onPress={() => setSlipModal(false)} style={s.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#2196F3" />
            </TouchableOpacity>
            <Text style={s.slipTitle}>Salary Slip</Text>
            <TouchableOpacity
              style={[s.dlBtn2, isDownloading && { opacity: 0.6 }]}
              onPress={downloadPDF}
              disabled={isDownloading}
            >
              {isDownloading
                ? <ActivityIndicator size="small" color="#fff" />
                : (
                  <View style={s.dlBtn2Inner}>
                    <MaterialCommunityIcons name="download" size={15} color="#fff" />
                    <Text style={s.dlBtn2Text}> PDF</Text>
                  </View>
                )
              }
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ html: slipHtml }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={(navState) => {}}
          />
        </View>
      </Modal>
    </View>
  );
};

export default SalaryScreen;

//  Card Styles 
const cs = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end', marginLeft: 8, gap: 4 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  monthText: { fontSize: 16, fontWeight: '700', color: '#212121' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgePaid: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  subText: { fontSize: 11, color: '#9ca3af' },
  netAmount: { fontSize: 17, fontWeight: '700', color: '#2196F3' },
  // Expanded
  expanded: { paddingHorizontal: 12, paddingBottom: 12 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 10 },
  // Quick Info
  quickInfo: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, marginBottom: 10, },
  infoCell: { flex: 1, alignItems: 'center', gap: 3 },
  infoLabel: { fontSize: 11, color: '#757575', textAlign: 'center' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#212121', textAlign: 'center' },
  infoDivider: { width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 8 },
  // Two column
  twoCol: { flexDirection: 'row', marginBottom: 10 },
  col: { flex: 1 },
  colTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  colTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  colDivider: { width: 1, backgroundColor: '#f3f4f6', marginHorizontal: 8 },
  miniRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  miniLabel: { fontSize: 11, color: '#616161', flex: 1 },
  miniValue: { fontSize: 11, fontWeight: '600', color: '#212121' },
  // Summary
  summaryGrid: { flexDirection: 'row', backgroundColor: '#f0f7ff', borderRadius: 8, padding: 10, marginBottom: 2, },
  summaryCell: { flex: 1, alignItems: 'center' },
  summarySep: { width: 1, backgroundColor: '#bbdefb', marginHorizontal: 8 },
  summaryLabel: { fontSize: 10, color: '#757575', marginBottom: 3 },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#212121' },
  // Download button — matches original style
  dlBtn: { marginTop: 10, paddingVertical: 11, backgroundColor: '#f0f7ff', borderRadius: 8, borderWidth: 1, borderColor: '#2196F3', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', },
  dlBtnDisabled: { borderColor: '#BDBDBD', backgroundColor: '#F5F5F5' },
  dlBtnInner: { flexDirection: 'row', alignItems: 'center' },
  dlBtnText: { color: '#2196F3', fontWeight: 'bold', fontSize: 14 },
});

//  Screen Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  // Filter Bar
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', gap: 6, },
  backBTN: { borderWidth: 0.3, marginRight: 4, padding: 4, backgroundColor: "#2563eb", borderRadius: 8,  },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f5f5f5', borderRadius: 20, },
  chipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  chipActive: { color: '#1565C0', fontWeight: '700' },
  clearChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#ffebee', borderRadius: 20, },
  clearText: { fontSize: 12, color: '#d32f2f', fontWeight: '600' },
  countText: { marginLeft: 'auto', fontSize: 12, color: '#9ca3af' },
  list: { padding: 12 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 16, color: '#757575' },
  // Bottom Sheet Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 32, },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 14, },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  // Month grid (4 cols)
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell: { width: '22%', paddingVertical: 10, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', },
  monthCellActive: { backgroundColor: '#2196F3' },
  monthCellText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  monthCellTextActive: { color: '#fff' },
  // Year row
  yearRow: { flexDirection: 'row', gap: 10 },
  yearCell: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', },
  yearCellText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  // Slip Modal
  slipContainer: { flex: 1, backgroundColor: '#fff' },
  slipHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', gap: 10, },
  backBtn: { padding: 4 },
  slipTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#212121', textAlign: 'center' },
  dlBtn2: { backgroundColor: '#2196F3', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 7, },
  dlBtn2Inner: { flexDirection: 'row', alignItems: 'center' },
  dlBtn2Text: { color: '#fff', fontWeight: '700', fontSize: 13 },
});