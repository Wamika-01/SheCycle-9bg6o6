import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { EMERGENCY_HELPLINES, SAFE_ZONES } from '@/constants/data';
import { useAlert } from '@/template';

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Verified: { bg: Colors.greenBg, text: Colors.green },
  CCTV: { bg: Colors.blueBg, text: Colors.blue },
  'Well Lit': { bg: Colors.amberBg, text: Colors.amber },
  Guards: { bg: Colors.purpleBg, text: Colors.purple },
};

export default function SafeZoneTab() {
  const { showAlert } = useAlert();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() =>
      showAlert('Cannot Call', 'Dialer not available')
    );
  };

  const handleNavigate = (name: string) => {
    const q = encodeURIComponent(`${name} Jalandhar Punjab`);
    Linking.openURL(`https://maps.google.com/?q=${q}`).catch(() =>
      showAlert('Cannot Open Maps', 'Maps app not available')
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Emergency Helplines Card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.alertIcon}>
              <MaterialIcons name="warning" size={24} color={Colors.amber} />
            </View>
            <View>
              <Text style={styles.emergencyTitle}>Emergency Helplines</Text>
              <Text style={styles.emergencySubtitle}>Available 24/7</Text>
            </View>
          </View>
          {EMERGENCY_HELPLINES.map(line => (
            <View key={line.number} style={styles.helplineRow}>
              <View style={styles.helplineIcon}>
                <MaterialIcons name="phone" size={18} color={Colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helplineName}>{line.name}</Text>
                <Text style={styles.helplineType}>{line.type}</Text>
              </View>
              <TouchableOpacity
                style={styles.numberBtn}
                onPress={() => handleCall(line.number)}
              >
                <Text style={styles.numberBtnText}>{line.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Safe Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safe Zones Nearby</Text>
          <Text style={styles.sectionSubtitle}>Verified safe areas in Jalandhar</Text>
        </View>

        <View style={styles.zonesList}>
          {SAFE_ZONES.map(zone => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <View style={styles.zoneMetaRow}>
                    <MaterialIcons name="navigation" size={14} color={Colors.primary} />
                    <Text style={styles.zoneDist}>{zone.distance}</Text>
                    <Text style={styles.zoneDivider}>•</Text>
                    <MaterialIcons name="access-time" size={14} color={Colors.textSecondary} />
                    <Text style={styles.zoneTime}>{zone.timings}</Text>
                  </View>
                </View>
                <View style={styles.safeIcon}>
                  <MaterialIcons name="verified-user" size={22} color={Colors.green} />
                </View>
              </View>

              <Text style={styles.zoneDesc}>{zone.description}</Text>

              <View style={styles.badgeRow}>
                {zone.badges.map(badge => {
                  const bc = BADGE_COLORS[badge] || { bg: Colors.gray100, text: Colors.gray500 };
                  return (
                    <View key={badge} style={[styles.badge, { backgroundColor: bc.bg }]}>
                      <Text style={[styles.badgeText, { color: bc.text }]}>{badge}</Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.navigateBtn} onPress={() => handleNavigate(zone.name)}>
                <MaterialIcons name="navigation" size={18} color="#fff" />
                <Text style={styles.navigateBtnText}>Navigate to Safe Zone</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={20} color={Colors.amber} />
            <Text style={styles.tipsTitle}>Safety Tips</Text>
          </View>
          {[
            'Always inform family before waste collection routes',
            'Carry your registered SheCycle ID card',
            'Prefer well-lit collection routes after sunset',
            'Travel in groups when visiting remote areas',
            'Keep emergency numbers saved on your phone',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  emergencyCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.amberBg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.amber + '40',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.amber + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  emergencySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helplineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  helplineType: { fontSize: FontSize.xs, color: Colors.textSecondary },
  numberBtn: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  numberBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sectionSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  zonesList: { paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.lg },
  zoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  zoneTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  zoneName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  zoneMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneDist: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  zoneDivider: { fontSize: FontSize.sm, color: Colors.textMuted, marginHorizontal: 2 },
  zoneTime: { fontSize: FontSize.sm, color: Colors.textSecondary },
  safeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  navigateBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  tipsCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  tipsTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
