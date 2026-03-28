import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { WASTE_COLORS } from '@/constants/data';

export default function HistoryScreen() {
  const { transactions } = useApp();
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const typeFilters = ['All', 'Plastic', 'Metal', 'Glass', 'Paper', 'E-waste'];
  const dateFilters = ['All', 'Today', 'This Week', 'This Month'];

  const filtered = transactions.filter(tx => {
    const typeOk = typeFilter === 'All' || tx.type === typeFilter;
    return typeOk;
  });

  const totalEarned = filtered.reduce((s, t) => s + t.earnings, 0);
  const totalWeight = filtered.reduce((s, t) => s + t.weight, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earned</Text>
          <Text style={styles.summaryValue}>₹{totalEarned.toFixed(0)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Weight</Text>
          <Text style={styles.summaryValue}>{totalWeight.toFixed(1)} kg</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={{ height: 48 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {typeFilters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, typeFilter === f && styles.filterChipActive]}
              onPress={() => setTypeFilter(f)}
            >
              <Text style={[styles.filterText, typeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(tx => {
          const wcolor = WASTE_COLORS[tx.type] || Colors.gray400;
          return (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: wcolor + '20' }]}>
                <MaterialIcons name="inventory-2" size={22} color={wcolor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txItem}>{tx.item}</Text>
                <Text style={styles.txMeta}>{tx.weight} kg • {tx.date}</Text>
                <View style={styles.txTypeBadge}>
                  <View style={[styles.typeDot, { backgroundColor: wcolor }]} />
                  <Text style={[styles.txTypeText, { color: wcolor }]}>{tx.type}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txEarnings}>+₹{tx.earnings.toFixed(2)}</Text>
                <View style={styles.txPoints}>
                  <MaterialIcons name="emoji-events" size={12} color={Colors.amber} />
                  <Text style={styles.txPointsText}>+{tx.points} pts</Text>
                </View>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="inventory-2" size={48} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptyText}>Start scanning waste to see transactions here</Text>
          </View>
        )}
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
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  summaryRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 2 },
  filterRow: { paddingHorizontal: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  list: { flex: 1, padding: Spacing.lg },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txItem: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  txMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  txTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  txTypeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txEarnings: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  txPoints: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  txPointsText: { fontSize: FontSize.xs, color: Colors.amber, fontWeight: FontWeight.semibold },
  emptyState: { alignItems: 'center', paddingTop: Spacing.section, gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
});
