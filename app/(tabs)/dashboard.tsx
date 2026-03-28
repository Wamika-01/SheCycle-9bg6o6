import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Rect, G, Text as SvgText, Circle, Path } from 'react-native-svg';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { WEEKLY_EARNINGS, WASTE_DISTRIBUTION, BADGES } from '@/constants/data';
import { useApp } from '@/hooks/useApp';

const { width } = Dimensions.get('window');
const CHART_W = width - Spacing.lg * 2 - Spacing.xxl * 2;

function BarChart() {
  const maxVal = Math.max(...WEEKLY_EARNINGS.map(d => d.value));
  const barW = (CHART_W - 40) / WEEKLY_EARNINGS.length - 8;
  const chartH = 160;

  return (
    <Svg width={CHART_W} height={chartH + 30}>
      {WEEKLY_EARNINGS.map((d, i) => {
        const barH = (d.value / maxVal) * chartH * 0.85;
        const x = 20 + i * (barW + 8);
        const y = chartH - barH;
        return (
          <G key={d.day}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill={Colors.primary}
              opacity={0.9}
            />
            <SvgText
              x={x + barW / 2}
              y={chartH + 20}
              textAnchor="middle"
              fontSize={9}
              fill={Colors.textSecondary}
            >
              {d.day.replace(' ', '\n')}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function PieChart() {
  const total = WASTE_DISTRIBUTION.reduce((s, d) => s + d.value, 0);
  const r = 70;
  const cx = 80;
  const cy = 80;
  let cumAngle = -Math.PI / 2;

  const slices = WASTE_DISTRIBUTION.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
    return { ...d, path };
  });

  return (
    <View style={pieStyles.container}>
      <Svg width={160} height={160}>
        {slices.map(s => (
          <Path key={s.name} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
        ))}
      </Svg>
      <View style={pieStyles.legend}>
        {WASTE_DISTRIBUTION.map(d => (
          <View key={d.name} style={pieStyles.legendItem}>
            <View style={[pieStyles.dot, { backgroundColor: d.color }]} />
            <Text style={pieStyles.legendText}>{d.name} {d.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pieStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  legend: { gap: Spacing.sm, flex: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});

export default function DashboardTab() {
  const { totalEarned, totalWaste, co2Saved, points, transactions } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  const getUserBadge = () => {
    return BADGES.find(b => points >= b.minPoints && points <= b.maxPoints) || BADGES[0];
  };

  const badge = getUserBadge();

  const typeFilters = ['All', 'Plastic', 'Metal', 'Glass', 'Paper', 'E-waste'];
  const filteredTx = transactions.filter(t =>
    activeFilter === 'All' ? true : t.type === activeFilter
  );

  const statCards = [
    {
      label: 'Total Earned',
      value: `₹${totalEarned.toFixed(2)}`,
      badge: 'Total',
      icon: 'trending-up',
      colors: [Colors.primaryGradientStart, Colors.primaryGradientEnd] as [string, string],
    },
    {
      label: 'Total Waste',
      value: `${totalWaste.toFixed(1)} kg`,
      badge: 'Collected',
      icon: 'shopping-bag',
      colors: [Colors.green, Colors.greenLight] as [string, string],
    },
    {
      label: 'CO₂ Saved',
      value: `${co2Saved.toFixed(1)} kg`,
      badge: 'Impact',
      icon: 'eco',
      colors: [Colors.orange, Colors.amber] as [string, string],
    },
    {
      label: 'Points',
      value: `${points}`,
      badge: 'Rewards',
      icon: 'emoji-events',
      colors: [Colors.purple, '#9B7EC8'] as [string, string],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Your Dashboard</Text>
          <Text style={styles.pageSubtitle}>Track your earnings and impact</Text>
        </View>

        {/* Badge */}
        <TouchableOpacity style={styles.badgeCard} onPress={() => router.push('/rewards')}>
          <Text style={styles.badgeIcon}>{badge.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgePoints}>{points} points earned</Text>
          </View>
          <View style={styles.badgeArrow}>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textSecondary} />
            <Text style={styles.badgeRedeemText}>Redeem</Text>
          </View>
        </TouchableOpacity>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {statCards.map(card => (
            <LinearGradient
              key={card.label}
              colors={card.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statCardTop}>
                <MaterialIcons name={card.icon as any} size={24} color="rgba(255,255,255,0.9)" />
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{card.badge}</Text>
                </View>
              </View>
              <Text style={styles.statCardLabel}>{card.label}</Text>
              <Text style={styles.statCardValue}>{card.value}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Weekly Earnings Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialIcons name="calendar-today" size={18} color={Colors.primary} />
            <Text style={styles.chartTitle}>Weekly Earnings</Text>
          </View>
          <BarChart />
        </View>

        {/* Waste Distribution */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialIcons name="inventory-2" size={18} color={Colors.primary} />
            <Text style={styles.chartTitle}>Waste Distribution</Text>
          </View>
          <PieChart />
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleRow}>
              <MaterialIcons name="trending-up" size={18} color={Colors.primary} />
              <Text style={styles.activityTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}>
              {typeFilters.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {filteredTx.slice(0, 8).map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIcon}>
                <MaterialIcons name="inventory-2" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txItem}>{tx.item}</Text>
                <Text style={styles.txMeta}>{tx.weight} kg • {tx.date}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txEarnings}>+₹{tx.earnings.toFixed(2)}</Text>
                <Text style={styles.txType}>{tx.type}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Motivation Card */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.motivationCard}
        >
          <MaterialIcons name="emoji-events" size={36} color="rgba(255,255,255,0.9)" />
          <Text style={styles.motivationTitle}>Keep Going!</Text>
          <Text style={styles.motivationText}>
            You are making a real difference in Jalandhar's recycling ecosystem
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  badgePoints: { fontSize: FontSize.sm, color: Colors.textSecondary },
  badgeArrow: { alignItems: 'center' },
  badgeRedeemText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.semibold },
  statCardLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  statCardValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#fff' },
  chartCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  chartTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  activityCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  activityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  activityTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  viewAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  filterRow: { marginBottom: Spacing.md },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.md,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txItem: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  txMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txEarnings: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  txType: { fontSize: FontSize.xs, color: Colors.textSecondary },
  motivationCard: {
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  motivationTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  motivationText: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
