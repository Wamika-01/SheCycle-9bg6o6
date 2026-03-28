import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

export default function AppHeader() {
  const { totalEarned, totalWaste, co2Saved, points, user } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd, '#FF85A1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brandName}>SheCycle</Text>
          <Text style={styles.location}>
            <MaterialIcons name="location-on" size={12} color="rgba(255,255,255,0.8)" />
            {' '}Jalandhar • Punjab
          </Text>
        </View>
        <TouchableOpacity style={styles.pointsBadge} onPress={() => router.push('/profile')}>
          <MaterialIcons name="emoji-events" size={18} color={Colors.amberLight} />
          <View>
            <Text style={styles.pointsLabel}>Points</Text>
            <Text style={styles.pointsValue}>{points}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconRow}>
            <MaterialIcons name="trending-up" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statLabel}>  Earned</Text>
          </View>
          <Text style={styles.statValue}>₹{Math.round(totalEarned)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconRow}>
            <MaterialIcons name="shopping-bag" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statLabel}>  Waste</Text>
          </View>
          <Text style={styles.statValue}>{totalWaste.toFixed(1)} kg</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconRow}>
            <MaterialIcons name="eco" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statLabel}>  CO₂</Text>
          </View>
          <Text style={styles.statValue}>{co2Saved.toFixed(1)} kg</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  brandName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textOnPrimary,
    letterSpacing: -0.5,
  },
  location: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  pointsLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  pointsValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
});
