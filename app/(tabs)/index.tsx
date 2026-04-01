import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Easing, Platform, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/hooks/useApp';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { WASTE_RATES } from '@/constants/data';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

type ScanState = 'idle' | 'scanning' | 'analyzing' | 'result' | 'saving' | 'success' | 'error';

interface ScanResult {
  type: string;
  subtype: string;
  confidence: number;
  ratePerKg: number;
  priceMin: number;
  priceMax: number;
  estimatedWeight: number;
  icon: string;
  description: string;
  recyclable: boolean;
  recyclingInstructions: string[];
  environmentalImpact: string;
  funFact: string;
}

const WASTE_TYPE_COLORS: Record<string, string> = {
  Plastic: '#E8175D',
  Metal: '#F5A623',
  Glass: '#4A90D9',
  Paper: '#666680',
  'E-waste': '#7B5EA7',
  Organic: '#4A7C59',
  Unknown: '#999',
};

export default function ScanTab() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [useEstimate, setUseEstimate] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { addTransaction, user } = useApp();
  const { showAlert } = useAlert();

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanState === 'scanning' || scanState === 'analyzing') {
      Animated.loop(
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      scanAnim.stopAnimation(); scanAnim.setValue(0);
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      rotateAnim.stopAnimation(); rotateAnim.setValue(0);
    }
    if (scanState === 'result') {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [scanState]);

  const analyzeImageWithAI = async (uri: string, mimeType: string) => {
    setScanState('analyzing');
    try {
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
          } catch { errorMessage = error.message; }
        }
        throw new Error(errorMessage);
      }

      if (!data?.success || !data?.result) throw new Error(data?.error || 'AI analysis failed');

      const r = data.result;
      const result: ScanResult = {
        type: r.type || 'Plastic',
        subtype: r.subtype || 'Recyclable Item',
        confidence: r.confidence || 75,
        ratePerKg: WASTE_RATES[r.type] || r.ratePerKg || 30,
        priceMin: r.priceMin || 0,
        priceMax: r.priceMax || 0,
        estimatedWeight: r.estimatedWeight || 1.0,
        icon: r.icon || '♻️',
        description: r.description || '',
        recyclable: r.recyclable !== false,
        recyclingInstructions: r.recyclingInstructions || [],
        environmentalImpact: r.environmentalImpact || '',
        funFact: r.funFact || '',
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
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedImageUri(asset.uri);
      setScanState('scanning');
      await new Promise(r => setTimeout(r, 700));
      await analyzeImageWithAI(asset.uri, asset.mimeType || 'image/jpeg');
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedImageUri(asset.uri);
      setScanState('scanning');
      await new Promise(r => setTimeout(r, 700));
      await analyzeImageWithAI(asset.uri, asset.mimeType || 'image/jpeg');
    }
  };

  const effectiveWeight = parseFloat(
    useEstimate ? (scanResult?.estimatedWeight?.toFixed(1) || '1.0') : weight
  ) || 0;
  const totalEarnings = scanResult ? effectiveWeight * scanResult.ratePerKg : 0;
  const pointsEarned = Math.ceil(effectiveWeight * 5);
  const typeColor = WASTE_TYPE_COLORS[scanResult?.type || ''] || Colors.primary;

  const saveScan = async (asSold: boolean) => {
    if (!scanResult) return;
    if (effectiveWeight <= 0) {
      showAlert('Invalid Weight', 'Please enter a valid weight');
      return;
    }

    setScanState('saving');
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('scan_results').insert({
        user_id: user?.id || 'demo_user',
        waste_type: scanResult.type,
        subtype: scanResult.subtype,
        confidence: scanResult.confidence,
        estimated_weight: scanResult.estimatedWeight,
        actual_weight: effectiveWeight,
        price_min: scanResult.priceMin,
        price_max: scanResult.priceMax,
        total_earnings: asSold ? totalEarnings : null,
        recycling_instructions: scanResult.recyclingInstructions.join(' | '),
        fun_fact: scanResult.funFact,
        status: asSold ? 'sold' : 'saved',
      }).select().single();

      if (error) throw error;
      setSavedId(data?.id || 'saved');

      if (asSold) {
        addTransaction({
          id: `tx_${Date.now()}`,
          item: scanResult.subtype,
          weight: effectiveWeight,
          type: scanResult.type,
          earnings: totalEarnings,
          date: new Date().toLocaleDateString('en-IN'),
          points: pointsEarned,
        });
      }

      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
      setScanState('success');

      setTimeout(() => {
        setScanState('idle');
        setScanResult(null);
        setCapturedImageUri(null);
        setSavedId(null);
        successScale.setValue(0);
      }, 3500);
    } catch (err: any) {
      setScanState('result');
      showAlert('Save Failed', err?.message || 'Could not save scan. Please try again.');
    }
  };

  const resetScan = () => {
    setScanState('idle');
    setScanResult(null);
    setCapturedImageUri(null);
    setErrorMsg('');
    setSavedId(null);
    successScale.setValue(0);
  };

  const scanLineY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });
  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

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
              {'\n'}type, price, and recycling info
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

            {/* Rates grid */}
            <Text style={styles.ratesTitle}>Current Market Rates</Text>
            <View style={styles.ratesGrid}>
              {[
                { icon: '🧴', label: 'Plastic', rate: '₹30/kg', color: '#FFE4EE' },
                { icon: '⚙️', label: 'Metal', rate: '₹80/kg', color: '#FFF3E0' },
                { icon: '🫙', label: 'Glass', rate: '₹10/kg', color: '#E3F2FD' },
                { icon: '📦', label: 'Paper', rate: '₹8/kg', color: '#F3E5F5' },
                { icon: '💻', label: 'E-waste', rate: '₹120/kg', color: '#EDE7F6' },
                { icon: '🌿', label: 'Organic', rate: '₹5/kg', color: '#E8F5E9' },
              ].map(item => (
                <View key={item.label} style={[styles.rateCard, { backgroundColor: item.color }]}>
                  <Text style={styles.rateIcon}>{item.icon}</Text>
                  <Text style={styles.rateLabel}>{item.label}</Text>
                  <Text style={styles.rateValue}>{item.rate}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── SCANNING / ANALYZING ── */}
        {(scanState === 'scanning' || scanState === 'analyzing') && (
          <View style={styles.scanningContainer}>
            <View style={styles.scanFrame}>
              {capturedImageUri ? (
                <Image source={{ uri: capturedImageUri }} style={styles.capturedImg} contentFit="cover" />
              ) : null}
              <View style={styles.scanOverlay} />
              {['TL', 'TR', 'BL', 'BR'].map(pos => (
                <View key={pos} style={[styles.corner,
                  pos === 'TL' ? styles.cornerTL : pos === 'TR' ? styles.cornerTR :
                  pos === 'BL' ? styles.cornerBL : styles.cornerBR]} />
              ))}
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
            </View>

            <View style={styles.analyzingRow}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialIcons name="auto-awesome" size={22} color={Colors.primary} />
              </Animated.View>
              <Text style={styles.analyzingTitle}>
                {scanState === 'scanning' ? 'Processing Image...' : 'AI Analyzing Waste...'}
              </Text>
            </View>
            <Text style={styles.analyzingSubtitle}>
              {scanState === 'analyzing' ? 'Gemini Vision is detecting waste type, price & recycling info' : 'Preparing image for analysis'}
            </Text>

            <View style={styles.stepsList}>
              {[
                { label: 'Image captured', done: true },
                { label: 'Sending to Gemini AI', done: scanState === 'analyzing' },
                { label: 'Detecting waste type & price', done: false },
                { label: 'Generating recycling instructions', done: false },
              ].map((step, i) => (
                <View key={i} style={styles.step}>
                  <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                    {step.done
                      ? <MaterialIcons name="check" size={10} color="#fff" />
                      : <Animated.View style={[styles.stepPulse, { transform: [{ scale: pulseAnim }] }]} />}
                  </View>
                  <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── RESULT ── */}
        {scanState === 'result' && scanResult && (
          <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
            {/* Image preview */}
            {capturedImageUri && (
              <View style={styles.imgPreviewWrap}>
                <Image source={{ uri: capturedImageUri }} style={styles.imgPreview} contentFit="cover" transition={200} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.imgGradient}
                />
                <View style={styles.imgBadgeRow}>
                  <View style={styles.aiBadgeImg}>
                    <MaterialIcons name="auto-awesome" size={12} color="#fff" />
                    <Text style={styles.aiBadgeImgText}>AI Analyzed</Text>
                  </View>
                  {scanResult.recyclable && (
                    <View style={styles.recyclableBadge}>
                      <MaterialIcons name="recycling" size={12} color={Colors.green} />
                      <Text style={styles.recyclableBadgeText}>Recyclable</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Detection result */}
            <View style={[styles.detectionCard, { borderLeftColor: typeColor, borderLeftWidth: 4 }]}>
              <View style={styles.detectionTop}>
                <Text style={styles.resultIcon}>{scanResult.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultSubtype}>{scanResult.subtype}</Text>
                  <Text style={[styles.resultType, { color: typeColor }]}>{scanResult.type}</Text>
                  {scanResult.description ? (
                    <Text style={styles.resultDesc}>{scanResult.description}</Text>
                  ) : null}
                </View>
                <View style={[styles.confidencePill, {
                  backgroundColor: scanResult.confidence >= 85 ? Colors.greenBg : Colors.amberBg
                }]}>
                  <Text style={[styles.confidenceVal, {
                    color: scanResult.confidence >= 85 ? Colors.green : Colors.amber
                  }]}>{scanResult.confidence}%</Text>
                  <Text style={[styles.confidenceLabel, {
                    color: scanResult.confidence >= 85 ? Colors.green : Colors.amber
                  }]}>match</Text>
                </View>
              </View>
            </View>

            {/* Price range */}
            <View style={styles.priceCard}>
              <View style={styles.priceCardHeader}>
                <MaterialIcons name="payments" size={18} color={Colors.primary} />
                <Text style={styles.priceCardTitle}>Price Estimate</Text>
                <Text style={styles.rateTag}>₹{scanResult.ratePerKg}/kg</Text>
              </View>
              <View style={styles.priceRange}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Min</Text>
                  <Text style={styles.priceBoxVal}>₹{scanResult.priceMin.toFixed(0)}</Text>
                </View>
                <View style={styles.priceRangeLine}>
                  <View style={[styles.priceRangeFill, { backgroundColor: typeColor }]} />
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Max</Text>
                  <Text style={[styles.priceBoxVal, { color: typeColor }]}>₹{scanResult.priceMax.toFixed(0)}</Text>
                </View>
              </View>
            </View>

            {/* Weight input */}
            <View style={styles.weightCard}>
              <Text style={styles.weightTitle}>Enter Weight</Text>
              <View style={styles.weightToggleRow}>
                <TouchableOpacity
                  style={[styles.weightToggleBtn, useEstimate && styles.weightToggleBtnActive]}
                  onPress={() => setUseEstimate(true)}
                >
                  <MaterialIcons name="scale" size={14} color={useEstimate ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.weightToggleText, useEstimate && styles.weightToggleTextActive]}>
                    AI Estimate ({scanResult.estimatedWeight.toFixed(1)} kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.weightToggleBtn, !useEstimate && styles.weightToggleBtnActive]}
                  onPress={() => setUseEstimate(false)}
                >
                  <MaterialIcons name="edit" size={14} color={!useEstimate ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.weightToggleText, !useEstimate && styles.weightToggleTextActive]}>
                    Enter Manually
                  </Text>
                </TouchableOpacity>
              </View>

              {!useEstimate && (
                <View style={styles.weightInputRow}>
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

              <View style={styles.earningsRow}>
                <View>
                  <Text style={styles.earningsLabel}>Your Earnings</Text>
                  <Text style={styles.earningsValue}>₹{totalEarnings.toFixed(2)}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <MaterialIcons name="emoji-events" size={16} color={Colors.amber} />
                  <Text style={styles.pointsText}>+{pointsEarned} pts</Text>
                </View>
              </View>
            </View>

            {/* Recycling Instructions */}
            {scanResult.recyclingInstructions.length > 0 && (
              <View style={styles.instructionsCard}>
                <View style={styles.instructionsHeader}>
                  <View style={styles.instructionsIconBox}>
                    <MaterialIcons name="recycling" size={20} color={Colors.green} />
                  </View>
                  <Text style={styles.instructionsTitle}>Recycling Instructions</Text>
                </View>
                {scanResult.recyclingInstructions.map((step, i) => (
                  <View key={i} style={styles.instructionRow}>
                    <View style={[styles.stepNum, { backgroundColor: typeColor + '20' }]}>
                      <Text style={[styles.stepNumText, { color: typeColor }]}>{i + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{step}</Text>
                  </View>
                ))}
                {scanResult.environmentalImpact ? (
                  <View style={styles.impactRow}>
                    <MaterialIcons name="eco" size={16} color={Colors.green} />
                    <Text style={styles.impactText}>{scanResult.environmentalImpact}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Fun fact */}
            {scanResult.funFact ? (
              <View style={styles.funFactCard}>
                <Text style={styles.funFactEmoji}>💡</Text>
                <Text style={styles.funFactText}>{scanResult.funFact}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => saveScan(false)}
              >
                <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
                <Text style={styles.saveBtnText}>Save Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sellBtn}
                onPress={() => saveScan(true)}
              >
                <LinearGradient
                  colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.sellGradient}
                >
                  <MaterialIcons name="sell" size={20} color="#fff" />
                  <Text style={styles.sellBtnText}>Sell Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
              <MaterialIcons name="refresh" size={18} color={Colors.textSecondary} />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── SAVING ── */}
        {scanState === 'saving' && (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.savingText}>Saving to database...</Text>
          </View>
        )}

        {/* ── ERROR ── */}
        {scanState === 'error' && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}>
              <MaterialIcons name="error-outline" size={56} color={Colors.primary} />
            </View>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>
            <TouchableOpacity style={styles.startBtn} onPress={resetScan}>
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SUCCESS ── */}
        {scanState === 'success' && scanResult && (
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
              <MaterialIcons name="check" size={64} color="#fff" />
            </Animated.View>
            <Text style={styles.successTitle}>
              {savedId ? 'Scan Saved!' : 'Sold!'}
            </Text>
            <Text style={styles.successSubtitle}>
              {savedId
                ? `${scanResult.subtype} saved to your history`
                : `₹${totalEarnings.toFixed(2)} added to your earnings`}
            </Text>
            {savedId && (
              <View style={styles.successPoints}>
                <MaterialIcons name="emoji-events" size={24} color={Colors.amber} />
                <Text style={styles.successPointsText}>+{pointsEarned} points earned!</Text>
              </View>
            )}
            <View style={styles.successDetails}>
              <Text style={styles.successDetailText}>
                {scanResult.icon} {scanResult.subtype} • {effectiveWeight} kg
              </Text>
              <Text style={styles.successDetailText}>
                Stored in database ✓
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  // Idle
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
  scanTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  scanSubtitle: { fontSize: FontSize.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.md },
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
  ratesTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  ratesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', width: '100%' },
  rateCard: {
    width: '30%', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  rateIcon: { fontSize: 24, marginBottom: 4 },
  rateLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  rateValue: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },

  // Scanning
  scanningContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xl },
  scanFrame: {
    width: 260, height: 260, borderRadius: Radius.xl,
    overflow: 'hidden', position: 'relative', marginBottom: Spacing.xl,
    backgroundColor: Colors.gray100,
  },
  capturedImg: { width: '100%', height: '100%' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(232,23,93,0.12)' },
  corner: { position: 'absolute', width: 36, height: 36 },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.primary, borderRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.primary, borderRadius: 4 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 3,
    backgroundColor: Colors.primary, opacity: 0.8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8,
  },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  analyzingTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  analyzingSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20, paddingHorizontal: Spacing.lg },
  stepsList: { gap: Spacing.sm, alignSelf: 'stretch', paddingHorizontal: Spacing.lg },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: Colors.success },
  stepPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  stepText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  stepTextDone: { color: Colors.success, fontWeight: FontWeight.semibold },

  // Result
  resultContainer: { padding: Spacing.lg, paddingTop: Spacing.md },
  imgPreviewWrap: {
    borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
    position: 'relative',
  },
  imgPreview: { width: '100%', height: 220 },
  imgGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  imgBadgeRow: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 6 },
  aiBadgeImg: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  aiBadgeImgText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  recyclableBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.greenBg,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  recyclableBadgeText: { fontSize: FontSize.xs, color: Colors.green, fontWeight: FontWeight.bold },

  detectionCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  detectionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  resultIcon: { fontSize: 44 },
  resultSubtype: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  resultType: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginTop: 2 },
  resultDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, lineHeight: 16 },
  confidencePill: { borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  confidenceVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  confidenceLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  priceCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  priceCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  priceCardTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  rateTag: {
    backgroundColor: Colors.surfaceTinted, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary,
  },
  priceRange: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  priceBox: { alignItems: 'center' },
  priceBoxLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2 },
  priceBoxVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  priceRangeLine: {
    flex: 1, height: 6, backgroundColor: Colors.gray100, borderRadius: 3, overflow: 'hidden',
  },
  priceRangeFill: { height: '100%', width: '60%', borderRadius: 3 },

  weightCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  weightTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  weightToggleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  weightToggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.gray200,
  },
  weightToggleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceTinted },
  weightToggleText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  weightToggleTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  weightInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  weightField: {
    flex: 1, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, paddingVertical: Spacing.md,
    includeFontPadding: false,
  },
  weightUnit: { fontSize: FontSize.xl, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  earningsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceTinted, borderRadius: Radius.lg, padding: Spacing.md,
  },
  earningsLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  earningsValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.amberBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, gap: 4,
  },
  pointsText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.amber },

  instructionsCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  instructionsIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.greenBg, alignItems: 'center', justifyContent: 'center',
  },
  instructionsTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  instructionText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  impactRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.greenBg, borderRadius: Radius.lg,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  impactText: { flex: 1, fontSize: FontSize.sm, color: Colors.green, lineHeight: 18 },

  funFactCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.amberBg, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
  },
  funFactEmoji: { fontSize: 22 },
  funFactText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },

  actionButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
    borderRadius: Radius.full, paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  sellBtn: {
    flex: 1.4, borderRadius: Radius.full, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  sellGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  sellBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, gap: Spacing.xs, marginBottom: Spacing.xxxl,
  },
  rescanText: { fontSize: FontSize.md, color: Colors.textSecondary },

  // Saving
  savingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl, gap: Spacing.lg, minHeight: 300 },
  savingText: { fontSize: FontSize.body, color: Colors.textSecondary },

  // Error
  errorContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xxxl },
  errorCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceTinted,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  errorTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  errorMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20, paddingHorizontal: Spacing.lg },

  // Success
  successContainer: { alignItems: 'center', padding: Spacing.xl, paddingTop: Spacing.xxxl },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
    shadowColor: Colors.success, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 12,
  },
  successTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  successSubtitle: { fontSize: FontSize.body, color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' },
  successPoints: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.amberBg, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  successPointsText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.amber },
  successDetails: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.sm, alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: Colors.border,
  },
  successDetailText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
