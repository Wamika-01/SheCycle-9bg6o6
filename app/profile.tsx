import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { BADGES } from '@/constants/data';
import { useAlert } from '@/template';

export default function ProfileScreen() {
  const { user, logout, points, totalEarned, totalWaste } = useApp();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');

  const badge = BADGES.find(b => points >= b.minPoints && points <= b.maxPoints) || BADGES[0];

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        }
      }
    ]);
  };

  const roleLabel: Record<string, string> = {
    collector: 'Waste Collector',
    center: 'Recycling Center',
    company: 'Company / CSR',
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd, '#FF85A1']}
            style={styles.heroSection}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{roleLabel[user?.role || 'collector']}</Text>
            <Text style={styles.userLocation}>
              <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.8)" />
              {' '}{user?.location}
            </Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{badge.icon} {badge.name}</Text>
            </View>
          </LinearGradient>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>₹{Math.round(totalEarned)}</Text>
              <Text style={styles.statLbl}>Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{totalWaste.toFixed(1)} kg</Text>
              <Text style={styles.statLbl}>Collected</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{points}</Text>
              <Text style={styles.statLbl}>Points</Text>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text style={styles.editBtn}>{editing ? 'Done' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Full Name', value: name, setter: setName, icon: 'person', editable: true },
              { label: 'Email', value: user?.email || '', setter: () => {}, icon: 'email', editable: false },
              { label: 'Phone', value: phone, setter: setPhone, icon: 'phone', editable: true },
              { label: 'Location', value: location, setter: setLocation, icon: 'location-on', editable: true },
            ].map(field => (
              <View key={field.label} style={styles.fieldRow}>
                <MaterialIcons name={field.icon as any} size={18} color={Colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {editing && field.editable ? (
                    <TextInput
                      style={styles.fieldInput}
                      value={field.value}
                      onChangeText={field.setter as any}
                      placeholderTextColor={Colors.gray400}
                    />
                  ) : (
                    <Text style={styles.fieldValue}>{field.value}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {[
              { icon: 'history', label: 'Transaction History', action: () => router.push('/history') },
              { icon: 'emoji-events', label: 'Rewards & Badges', action: () => router.push('/rewards') },
              { icon: 'share', label: 'Invite Friends', action: () => {} },
              { icon: 'help', label: 'Help & Support', action: () => {} },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.actionRow} onPress={item.action}>
                <View style={styles.actionIcon}>
                  <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.gray400} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>SheCycle v1.0 • Jalandhar, Punjab</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: '#fff' },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#fff' },
  userRole: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  userLocation: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroBadge: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  heroBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  statLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: Colors.gray200, marginVertical: 4 },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  editBtn: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  fieldValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  fieldInput: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
    includeFontPadding: false,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.error + '40',
    backgroundColor: '#FFF0F0',
    gap: Spacing.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.error },
  footer: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xxxl },
});
