import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { TOP_COLLECTORS } from '@/constants/data';

export default function ImpactTab() {
  const { totalWaste, co2Saved, transactions } = useApp();

  const plasticKg = transactions.filter(t => t.type === 'Plastic').reduce((s, t) => s + t.weight, 0);
  const metalKg = transactions.filter(t => t.type === 'Metal').reduce((s, t) => s + t.weight, 0);
  const glassKg = transactions.filter(t => t.type === 'Glass').reduce((s, t) => s + t.weight, 0);
  const treesSaved = (co2Saved / 21).toFixed(1);

  const impactCards = [
    {
      label: 'CO₂ Saved',
      value: co2Saved.toFixed(1),
      unit: 'kg',
      icon: 'eco',
      color: Colors.green,
      bg: Colors.greenBg,
      desc: 'Carbon emissions prevented',
    },
    {
      label: 'Plastic Recycled',
      value: plasticKg.toFixed(1),
      unit: 'kg',
      icon: 'recycling',
      color: Colors.primary,
      bg: Colors.surfaceTinted,
      desc: 'Diverted from oceans and landfills',
    },
    {
      label: 'Metal Recovered',
      value: metalKg.toFixed(1),
      unit: 'kg',
      icon: 'military-tech',
      color: Colors.amber,
      bg: Colors.amberBg,
      desc: 'Energy-intensive materials saved',
    },
    {
      label: 'Glass Recycled',
      value: glassKg.toFixed(1),
      unit: 'kg',
      icon: 'water-drop',
      color: Colors.blue,
      bg: Colors.blueBg,
      desc: 'Infinitely recyclable material',
    },
    {
      label: 'Trees Saved',
      value: treesSaved,
      unit: 'equiv.',
      icon: 'park',
      color: Colors.green,
      bg: Colors.greenBg,
      desc: 'Annual CO₂ absorption equivalent',
    },
    {
      label: 'Landfill Diverted',
      value: totalWaste.toFixed(1),
      unit: 'kg',
      icon: 'delete-outline',
      color: Colors.purple,
      bg: Colors.purpleBg,
      desc: 'Waste kept out of landfills',
    },
  ];

  const realDifferenceItems = [
    {
      icon: 'eco',
      color: Colors.green,
      bg: Colors.greenBg,
      title: 'Cleaner Air',
      desc: 'Reducing CO₂ emissions helps combat climate change',
    },
    {
      icon: 'water',
      color: Colors.primary,
      bg: Colors.surfaceTinted,
      title: 'Protected Waterways',
      desc: 'Keeping plastic out of rivers and water sources',
    },
    {
      icon: 'notifications',
      color: Colors.amber,
      bg: Colors.amberBg,
      title: 'Resource Conservation',
      desc: 'Preserving natural resources for future generations',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerBadge}>
            <MaterialIcons name="eco" size={18} color={Colors.green} />
            <Text style={styles.headerBadgeText}>Environmental Impact</Text>
          </View>
          <Text style={styles.pageSubtitle}>Your contribution to a cleaner Jalandhar</Text>
        </View>

        {/* Impact Cards */}
        <View style={styles.cardsList}>
          {impactCards.map(card => (
            <View key={card.label} style={styles.impactCard}>
              <View style={[styles.impactIconBox, { backgroundColor: card.bg }]}>
                <MaterialIcons name={card.icon as any} size={24} color={card.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.impactLabel}>{card.label}</Text>
                <View style={styles.impactValueRow}>
                  <Text style={styles.impactValue}>{card.value}</Text>
                  <Text style={styles.impactUnit}> {card.unit}</Text>
                </View>
                <Text style={styles.impactDesc}>{card.desc}</Text>
              </View>
              <MaterialIcons name="trending-up" size={22} color={Colors.green} />
            </View>
          ))}
        </View>

        {/* Making a Real Difference */}
        <View style={styles.differenceCard}>
          <View style={styles.differenceIcon}>
            <MaterialIcons name="recycling" size={28} color="#fff" />
          </View>
          <Text style={styles.differenceTitle}>Making a Real Difference</Text>
          <Text style={styles.differenceSubtitle}>
            Your recycling efforts are creating tangible environmental benefits
          </Text>
          <View style={styles.differenceItems}>
            {realDifferenceItems.map(item => (
              <View key={item.title} style={styles.differenceItem}>
                <View style={[styles.differenceItemIcon, { backgroundColor: item.bg }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.differenceItemTitle}>{item.title}</Text>
                  <Text style={styles.differenceItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Collectors Leaderboard */}
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <MaterialIcons name="leaderboard" size={20} color={Colors.primary} />
            <Text style={styles.leaderboardTitle}>Top Collectors This Week</Text>
          </View>
          <View style={styles.weekBonus}>
            <MaterialIcons name="star" size={16} color={Colors.amber} />
            <Text style={styles.weekBonusText}>Top collector gets 500 bonus points!</Text>
          </View>
          {TOP_COLLECTORS.map((c, i) => (
            <View key={c.rank} style={[styles.leaderRow, i === 0 && styles.leaderRowTop]}>
              <View style={[styles.rankBadge,
                i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : styles.rank3]}>
                <Text style={styles.rankText}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${c.rank}`}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{c.name}</Text>
                <Text style={styles.leaderMeta}>{c.kg} kg • {c.badge}</Text>
              </View>
              <View style={styles.leaderRight}>
                <Text style={styles.leaderPoints}>{c.points} pts</Text>
                <Text style={styles.leaderEarnings}>₹{c.earnings.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cta}
        >
          <MaterialIcons name="emoji-events" size={32} color="rgba(255,255,255,0.9)" />
          <Text style={styles.ctaTitle}>Keep Collecting!</Text>
          <Text style={styles.ctaText}>
            Every kg of waste you collect makes Jalandhar greener and earns you rewards
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  pageHeader: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greenBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  headerBadgeText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
  cardsList: { paddingHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.lg },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  impactIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  impactValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  impactValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  impactUnit: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  impactDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  differenceCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  differenceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  differenceTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  differenceSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  differenceItems: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    gap: 0,
  },
  differenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  differenceItemIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  differenceItemTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  differenceItemDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  leaderboardCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  leaderboardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  weekBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberBg,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  weekBonusText: { fontSize: FontSize.xs, color: Colors.amber, fontWeight: FontWeight.semibold },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.md,
  },
  leaderRowTop: {
    backgroundColor: Colors.amberBg,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    marginHorizontal: -Spacing.md,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank1: { backgroundColor: Colors.amberBg },
  rank2: { backgroundColor: Colors.gray100 },
  rank3: { backgroundColor: Colors.orangeBg },
  rankText: { fontSize: FontSize.lg },
  leaderName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  leaderMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  leaderRight: { alignItems: 'flex-end' },
  leaderPoints: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  leaderEarnings: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cta: {
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ctaTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#fff' },
  ctaText: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
