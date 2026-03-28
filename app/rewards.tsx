import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { BADGES, REWARDS_CATALOG } from '@/constants/data';
import { useAlert } from '@/template';

export default function RewardsScreen() {
  const { points } = useApp();
  const router = useRouter();
  const { showAlert } = useAlert();

  const currentBadge = BADGES.find(b => points >= b.minPoints && points <= b.maxPoints) || BADGES[0];
  const nextBadge = BADGES.find(b => b.minPoints > points);
  const progressToNext = nextBadge
    ? ((points - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100
    : 100;

  const handleRedeem = (reward: typeof REWARDS_CATALOG[0]) => {
    if (points < reward.points) {
      showAlert('Not Enough Points', `You need ${reward.points - points} more points to redeem this reward`);
      return;
    }
    showAlert('Redeem Reward', `Redeem "${reward.name}" for ${reward.points} points?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem', onPress: () =>
          showAlert('Success!', 'Reward redeemed successfully. Check your email for details.')
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Hero */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          style={styles.pointsHero}
        >
          <MaterialIcons name="emoji-events" size={48} color={Colors.amber} />
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsHint}>1 kg waste = 5 points</Text>
        </LinearGradient>

        {/* Badge Progress */}
        <View style={styles.badgeCard}>
          <Text style={styles.badgeSectionTitle}>Your Badge</Text>
          <View style={styles.currentBadgeRow}>
            <Text style={styles.badgeIconLg}>{currentBadge.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeNameLg}>{currentBadge.name}</Text>
              <Text style={styles.badgeRange}>{currentBadge.minPoints}–{currentBadge.maxPoints === 99999 ? '∞' : currentBadge.maxPoints} pts</Text>
            </View>
          </View>

          {nextBadge && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Progress to {nextBadge.name}</Text>
                <Text style={styles.progressPct}>{Math.round(progressToNext)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressToNext}%` }]} />
              </View>
              <Text style={styles.progressHint}>
                {nextBadge.minPoints - points} points to {nextBadge.icon} {nextBadge.name}
              </Text>
            </View>
          )}
        </View>

        {/* All Badges */}
        <View style={styles.allBadgesCard}>
          <Text style={styles.badgeSectionTitle}>All Badges</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map(b => {
              const unlocked = points >= b.minPoints;
              return (
                <View key={b.name} style={[styles.badgeItem, !unlocked && styles.badgeItemLocked]}>
                  <Text style={[styles.badgeItemIcon, !unlocked && styles.lockedIcon]}>{b.icon}</Text>
                  <Text style={[styles.badgeItemName, !unlocked && styles.lockedText]}>{b.name}</Text>
                  <Text style={[styles.badgeItemPts, !unlocked && styles.lockedText]}>
                    {b.minPoints}+ pts
                  </Text>
                  {unlocked && (
                    <View style={styles.unlockedBadge}>
                      <MaterialIcons name="check" size={12} color="#fff" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Redeem Catalog */}
        <View style={styles.redeemSection}>
          <Text style={styles.badgeSectionTitle}>Redeem Points</Text>
          {REWARDS_CATALOG.map(reward => {
            const canRedeem = points >= reward.points;
            return (
              <View key={reward.id} style={styles.rewardCard}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardCat}>{reward.category}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                  onPress={() => handleRedeem(reward)}
                >
                  <Text style={[styles.redeemBtnText, !canRedeem && styles.redeemBtnTextDisabled]}>
                    {reward.points} pts
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
  pointsHero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  pointsValue: { fontSize: 56, fontWeight: FontWeight.extrabold, color: '#fff' },
  pointsLabel: { fontSize: FontSize.lg, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  pointsHint: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeSectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  currentBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  badgeIconLg: { fontSize: 48 },
  badgeNameLg: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  badgeRange: { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressSection: { gap: Spacing.sm },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressHint: { fontSize: FontSize.xs, color: Colors.textMuted },
  allBadgesCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  badgeItem: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.surfaceTinted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  badgeItemLocked: { backgroundColor: Colors.gray100, opacity: 0.6 },
  badgeItemIcon: { fontSize: 32, marginBottom: 4 },
  lockedIcon: { opacity: 0.4 },
  badgeItemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  badgeItemPts: { fontSize: FontSize.xs, color: Colors.textSecondary },
  lockedText: { color: Colors.gray400 },
  unlockedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.md,
  },
  rewardIcon: { fontSize: 28 },
  rewardName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  rewardCat: { fontSize: FontSize.xs, color: Colors.textSecondary },
  redeemBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  redeemBtnDisabled: { backgroundColor: Colors.gray200 },
  redeemBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff' },
  redeemBtnTextDisabled: { color: Colors.gray400 },
});
