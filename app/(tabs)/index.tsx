import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Easing, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '@/hooks/useApp';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { WASTE_RATES } from '@/constants/data';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

type ScanState = 'idle' | 'scanning' | 'analyzing' | 'result' | 'error';

interface ScanResult {
  type: string;
  subtype: string;
  confidence: number;
  rate: number;
  icon: string;
  estimatedWeight: number;
  description: string;
}

export default function ScanTab() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [useEstimate, setUseEstimate] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { addTransaction } = useApp();
  const { showAlert } = useAlert();

  const scanAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanState === 'scanning' || scanState === 'analyzing') {
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [scanState]);

  const analyzeImageWithAI = async (uri: string, mimeType: string) => {
    setScanState('analyzing');
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: { imageBase64: base64, mimeType },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message}`;
          } catch {
            errorMessage = error.message;
          }
        }
        throw new Error(errorMessage);
      }

      if (!data?.success || !data?.result) {
        throw new Error(data?.error || 'AI analysis failed');
      }

      const result: ScanResult = {
        type: data.result.type || 'Plastic',
        subtype: data.result.subtype || 'Recyclable Item',
        confidence: data.result.confidence || 75,
        rate: WASTE_RATES[data.result.type] || data.result.rate || 30,
        icon: data.result.icon || '♻️',
        estimatedWeight: data.result.estimatedWeight || 1.0,
        description: data.result.description || '',
      };

      setScanResult(result);
      setWeight(result.estimatedWeight.toFixed(1));
      setScanState('result');
    } catch (err: any) {
      console.error('AI analysis error:', err);
      setErrorMsg(err?.message || 'AI analysis failed. Please try again.');
      setScanState('error');
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Camera Permission', 'Camera access is needed to scan waste');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedImageUri(asset.uri);
      setScanState('scanning');
      // Brief pause to show scanning animation then analyze
      await new Promise(r => setTimeout(r, 800));
      const mime = asset.mimeType || 'image/jpeg';
      await analyzeImageWithAI(asset.uri, mime);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedImageUri(asset.uri);
      setScanState('scanning');
      await new Promise(r => setTimeout(r, 800));
      const mime = asset.mimeType || 'image/jpeg';
      await analyzeImageWithAI(asset.uri, mime);
    }
  };

  const effectiveWeight = parseFloat(useEstimate
    ? (scanResult?.estimatedWeight?.toFixed(1) || '1.0')
    : weight) || 0;
  const totalEarnings = scanResult ? effectiveWeight * scanResult.rate : 0;
  const pointsEarned = Math.ceil(effectiveWeight * 5);

  const handleSubmit = () => {
    if (!scanResult) return;
    if (effectiveWeight <= 0 || effectiveWeight > 500) {
      showAlert('Invalid Weight', 'Please enter a weight between 0.1 and 500 kg');
      return;
    }
    addTransaction({
      id: `tx_${Date.now()}`,
      item: scanResult.subtype,
      weight: effectiveWeight,
      type: scanResult.type,
      earnings: totalEarnings,
      date: new Date().toLocaleDateString('en-IN'),
      points: pointsEarned,
    });
    setSubmitted(true);
    Animated.spring(successAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 7,
    }).start();
    setTimeout(() => {
      setScanState('idle');
      setScanResult(null);
      setCapturedImageUri(null);
      setSubmitted(false);
      successAnim.setValue(0);
    }, 3000);
  };

  const resetScan = () => {
    setScanState('idle');
    setScanResult(null);
    setCapturedImageUri(null);
    setSubmitted(false);
    setErrorMsg('');
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── IDLE ── */}
        {scanState === 'idle' && (
          <View style={styles.idleContainer}>
            <Animated.View style={[styles.cameraOrb, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialIcons name="photo-camera" size={64} color="#fff" />
            </Animated.View>
            <Text style={styles.scanTitle}>Smart Waste Scanner</Text>
            <Text style={styles.scanSubtitle}>
              Point your camera at waste to{' '}
              <Text style={{ color: Colors.primary }}>automatically detect</Text>
              {'\n'}type and value using AI
            </Text>

            <View style={styles.aiBadge}>
              <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
              <Text style={styles.aiBadgeText}>Powered by Gemini AI Vision</Text>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={openCamera}>
              <MaterialIcons name="photo-camera" size={22} color="#fff" />
              <Text style={styles.startBtnText}>Start Scanning</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryBtn} onPress={openGallery}>
              <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
              <Text style={styles.galleryBtnText}>Upload from Gallery</Text>
            </TouchableOpacity>

            {/* Rates */}
            <Text style={styles.ratesTitle}>Current Rates</Text>
            <View style={styles.hintCards}>
              {[
                { icon: '🧴', label: 'Plastic', rate: '₹30/kg' },
                { icon: '⚙️', label: 'Metal', rate: '₹80/kg' },
                { icon: '🫙', label: 'Glass', rate: '₹10/kg' },
                { icon: '📦', label: 'Paper', rate: '₹8/kg' },
                { icon: '💻', label: 'E-waste', rate: '₹120/kg' },
              ].map(item => (
                <View key={item.label} style={styles.hintCard}>
                  <Text style={styles.hintIcon}>{item.icon}</Text>
                  <Text style={styles.hintLabel}>{item.label}</Text>
                  <Text style={styles.hintRate}>{item.rate}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── SCANNING / ANALYZING ── */}
        {(scanState === 'scanning' || scanState === 'analyzing') && (
          <View style={styles.scanningContainer}>
            <View style={styles.scanFrameWrapper}>
              {capturedImageUri ? (
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.capturedImage}
                  contentFit="cover"
                />
              ) : null}

              {/* Corner brackets */}
              <View style={styles.scanCornerTL} />
              <View style={styles.scanCornerTR} />
              <View style={styles.scanCornerBL} />
              <View style={styles.scanCornerBR} />

              {/* Scan line */}
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />

              {/* Overlay */}
              <View style={styles.scanOverlay} />
            </View>

            {/* Status */}
            <View style={styles.analyzingStatus}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
              </Animated.View>
              <Text style={styles.scanningTitle}>
                {scanState === 'scanning' ? 'Processing Image...' : 'AI Analyzing Waste...'}
              </Text>
            </View>
            <Text style={styles.scanningSubtitle}>
              {scanState === 'scanning'
                ? 'Preparing image for AI analysis'
                : 'Gemini Vision is identifying waste type and value'}
            </Text>

            <View style={styles.scanSteps}>
              {[
                { label: 'Image captured', done: true },
                { label: 'Sending to AI', done: scanState === 'analyzing' },
                { label: 'Detecting waste type', done: false },
              ].map((step, i) => (
                <View key={i} style={styles.scanStep}>
                  <View style={[styles.scanStepDot, step.done && styles.scanStepDotDone]}>
                    {step.done
                      ? <MaterialIcons name="check" size={12} color="#fff" />
                      : <Animated.View style={[styles.scanStepPulse, { transform: [{ scale: pulseAnim }] }]} />
                    }
                  </View>
                  <Text style={[styles.scanStepText, step.done && styles.scanStepTextDone]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── RESULT ── */}
        {scanState === 'result' && scanResult && !submitted && (
          <View style={styles.resultContainer}>
            {/* Image preview */}
            {capturedImageUri && (
              <View style={styles.imagePreviewCard}>
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.imagePreviewBadge}>
                  <MaterialIcons name="auto-awesome" size={12} color="#fff" />
                  <Text style={styles.imagePreviewBadgeText}>AI Analyzed</Text>
                </View>
              </View>
            )}

            {/* Detection result */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{scanResult.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultType}>{scanResult.subtype}</Text>
                <View style={styles.confidenceRow}>
                  <View style={[styles.confidenceBadge, {
                    backgroundColor: scanResult.confidence >= 85 ? Colors.greenBg : Colors.amberBg
                  }]}>
                    <MaterialIcons
                      name="verified"
                      size={12}
                      color={scanResult.confidence >= 85 ? Colors.green : Colors.amber}
                    />
                    <Text style={[styles.confidenceText, {
                      color: scanResult.confidence >= 85 ? Colors.green : Colors.amber
                    }]}>
                      {scanResult.confidence}% confidence
                    </Text>
                  </View>
                  <Text style={styles.resultCategory}>{scanResult.type}</Text>
                </View>
                {scanResult.description ? (
                  <Text style={styles.resultDescription}>{scanResult.description}</Text>
                ) : null}
              </View>
              <View style={styles.rateTag}>
                <Text style={styles.rateText}>₹{scanResult.rate}/kg</Text>
              </View>
            </View>

            {/* Weight input */}
            <View style={styles.weightCard}>
              <Text style={styles.weightTitle}>Enter Weight</Text>
              <View style={styles.weightToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, useEstimate && styles.toggleBtnActive]}
                  onPress={() => setUseEstimate(true)}
                >
                  <MaterialIcons
                    name="scale"
                    size={14}
                    color={useEstimate ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.toggleBtnText, useEstimate && styles.toggleBtnTextActive]}>
                    AI Estimate ({scanResult.estimatedWeight.toFixed(1)} kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !useEstimate && styles.toggleBtnActive]}
                  onPress={() => setUseEstimate(false)}
                >
                  <MaterialIcons
                    name="edit"
                    size={14}
                    color={!useEstimate ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.toggleBtnText, !useEstimate && styles.toggleBtnTextActive]}>
                    Enter Manually
                  </Text>
                </TouchableOpacity>
              </View>

              {!useEstimate && (
                <View style={styles.weightInput}>
                  <TextInput
                    style={styles.weightField}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={Colors.gray400}
                    autoFocus
                  />
                  <Text style={styles.weightUnit}>kg</Text>
                </View>
              )}

              <View style={styles.earningsPreview}>
                <View>
                  <Text style={styles.earningsLabel}>Estimated Earnings</Text>
                  <Text style={styles.earningsValue}>₹{totalEarnings.toFixed(2)}</Text>
                </View>
                <View style={styles.pointsPreview}>
                  <MaterialIcons name="emoji-events" size={16} color={Colors.amber} />
                  <Text style={styles.pointsPreviewText}>+{pointsEarned} pts</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
              <MaterialIcons name="check-circle" size={22} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm Submission</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
              <MaterialIcons name="refresh" size={18} color={Colors.textSecondary} />
              <Text style={styles.rescanBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ERROR ── */}
        {scanState === 'error' && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}>
              <MaterialIcons name="error-outline" size={56} color={Colors.primary} />
            </View>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorMessage}>{errorMsg}</Text>
            <TouchableOpacity style={styles.startBtn} onPress={resetScan}>
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SUCCESS ── */}
        {submitted && (
          <Animated.View style={[styles.successContainer, { transform: [{ scale: successAnim }] }]}>
            <View style={styles.successCircle}>
              <MaterialIcons name="check" size={64} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Submission Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              ₹{totalEarnings.toFixed(2)} added to your earnings
            </Text>
            <View style={styles.successPoints}>
              <MaterialIcons name="emoji-events" size={24} color={Colors.amber} />
              <Text style={styles.successPointsText}>+{pointsEarned} points earned!</Text>
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  // ── Idle
  idleContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xxxl },
  cameraOrb: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  scanTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  scanSubtitle: {
    fontSize: FontSize.body, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: Spacing.md,
  },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  aiBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  startBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg,
    borderRadius: Radius.full, gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    marginBottom: Spacing.md,
  },
  startBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: '#fff' },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.primary,
    gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  galleryBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.primary },
  ratesTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, marginBottom: Spacing.md, alignSelf: 'flex-start',
  },
  hintCards: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  hintCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', minWidth: 70,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  hintIcon: { fontSize: 24, marginBottom: 4 },
  hintLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  hintRate: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },

  // ── Scanning
  scanningContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xl },
  scanFrameWrapper: {
    width: 260, height: 260,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.gray100,
  },
  capturedImage: { width: '100%', height: '100%' },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232,23,93,0.15)',
  },
  scanCornerTL: {
    position: 'absolute', top: 12, left: 12,
    width: 36, height: 36,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderColor: Colors.primary, borderRadius: 4,
  },
  scanCornerTR: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36,
    borderTopWidth: 3, borderRightWidth: 3,
    borderColor: Colors.primary, borderRadius: 4,
  },
  scanCornerBL: {
    position: 'absolute', bottom: 12, left: 12,
    width: 36, height: 36,
    borderBottomWidth: 3, borderLeftWidth: 3,
    borderColor: Colors.primary, borderRadius: 4,
  },
  scanCornerBR: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: Colors.primary, borderRadius: 4,
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 3,
    backgroundColor: Colors.primary, opacity: 0.85,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8,
  },
  analyzingStatus: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scanningTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary,
  },
  scanningSubtitle: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  scanSteps: { gap: Spacing.sm, alignSelf: 'stretch', paddingHorizontal: Spacing.lg },
  scanStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  scanStepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  scanStepDotDone: { backgroundColor: Colors.success },
  scanStepPulse: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  scanStepText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  scanStepTextDone: { color: Colors.success, fontWeight: FontWeight.semibold },

  // ── Result
  resultContainer: { padding: Spacing.lg, paddingTop: Spacing.lg },
  imagePreviewCard: {
    borderRadius: Radius.xl, overflow: 'hidden',
    marginBottom: Spacing.md, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  imagePreview: { width: '100%', height: 200 },
  imagePreviewBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  imagePreviewBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  resultHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  resultIcon: { fontSize: 40 },
  resultType: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4, flexWrap: 'wrap' },
  confidenceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  resultCategory: { fontSize: FontSize.sm, color: Colors.textSecondary },
  resultDescription: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    marginTop: 4, lineHeight: 16,
  },
  rateTag: {
    backgroundColor: Colors.surfaceTinted, borderRadius: Radius.lg,
    padding: Spacing.sm, alignSelf: 'flex-start',
  },
  rateText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  weightCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  weightTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  weightToggle: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: Spacing.sm, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.gray200,
  },
  toggleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceTinted },
  toggleBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  toggleBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  weightInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  weightField: {
    flex: 1, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
    includeFontPadding: false,
  },
  weightUnit: { fontSize: FontSize.xl, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  earningsPreview: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceTinted, borderRadius: Radius.lg, padding: Spacing.md,
  },
  earningsLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  earningsValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  pointsPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.amberBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, gap: 4,
  },
  pointsPreviewText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.amber },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  confirmBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: '#fff' },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, gap: Spacing.xs,
  },
  rescanBtnText: { fontSize: FontSize.md, color: Colors.textSecondary },

  // ── Error
  errorContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.section },
  errorCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceTinted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  errorTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xl,
    lineHeight: 20, paddingHorizontal: Spacing.lg,
  },

  // ── Success
  successContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.section },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.success, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  successTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSize.body, color: Colors.textSecondary, marginBottom: Spacing.lg,
  },
  successPoints: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.amberBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  successPointsText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.amber },
});
