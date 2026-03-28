import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/ui/AppHeader';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { RECYCLING_CENTERS } from '@/constants/data';
import { useAlert } from '@/template';

export default function CentersTab() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { showAlert } = useAlert();

  const filters = ['All', 'Open', 'Plastic', 'Metal', 'E-waste'];

  const filtered = RECYCLING_CENTERS.filter(c => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Open') return c.status === 'Open';
    return c.accepts.includes(selectedFilter);
  });

  const handleNavigate = (center: typeof RECYCLING_CENTERS[0]) => {
    const query = encodeURIComponent(center.fullAddress);
    const url = `https://maps.google.com/?q=${query}`;
    Linking.openURL(url).catch(() =>
      showAlert('Cannot Open Maps', 'Please install Google Maps')
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() =>
      showAlert('Cannot Call', 'Dialer not available')
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Recycling Centers</Text>
          <Text style={styles.pageSubtitle}>Find nearby centers in Jalandhar</Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            {filters.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, selectedFilter === f && styles.filterChipActive]}
                onPress={() => setSelectedFilter(f)}
              >
                <Text style={[styles.filterText, selectedFilter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.centersList}>
          {filtered.map(center => (
            <View key={center.id} style={styles.centerCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.centerName}>{center.name}</Text>
                    <MaterialIcons name="verified" size={18} color={Colors.green} />
                  </View>
                  <View style={styles.addressRow}>
                    <MaterialIcons name="location-on" size={14} color={Colors.primary} />
                    <Text style={styles.addressShort}>{center.address}</Text>
                  </View>
                  <Text style={styles.addressFull}>{center.fullAddress}</Text>
                </View>
                <View style={[styles.statusBadge,
                  center.status === 'Open' ? styles.statusOpen : styles.statusClosed]}>
                  <Text style={[styles.statusText,
                    center.status === 'Open' ? styles.statusOpenText : styles.statusClosedText]}>
                    {center.status}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.distRow}>
                  <MaterialIcons name="navigation" size={14} color={Colors.primary} />
                  <Text style={styles.distText}>{center.distance} away</Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{center.badge}</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={14}
                    color={i < Math.floor(center.rating) ? Colors.amber : Colors.gray300}
                  />
                ))}
                <Text style={styles.ratingText}>{center.rating}</Text>
                <Text style={styles.hoursText}>  •  {center.hours}</Text>
              </View>

              <View style={styles.acceptRow}>
                {center.accepts.map(type => (
                  <View key={type} style={styles.acceptChip}>
                    <Text style={styles.acceptText}>{type}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.navBtn} onPress={() => handleNavigate(center)}>
                  <MaterialIcons name="navigation" size={18} color="#fff" />
                  <Text style={styles.navBtnText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(center.phone)}>
                  <MaterialIcons name="phone" size={18} color="#fff" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.phoneText}>{center.phone}</Text>
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
  titleSection: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  filterWrap: { height: 52 },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: FontWeight.semibold },
  centersList: { padding: Spacing.lg, gap: Spacing.md },
  centerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  centerName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  addressShort: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  addressFull: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  statusOpen: { backgroundColor: Colors.greenBg },
  statusClosed: { backgroundColor: Colors.gray100 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statusOpenText: { color: Colors.green },
  statusClosedText: { color: Colors.textSecondary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  badgePill: {
    backgroundColor: '#FFE4EE',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  ratingText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginLeft: 4 },
  hoursText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  acceptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  acceptChip: {
    backgroundColor: Colors.gray100,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  acceptText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  btnRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  callBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  phoneText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});
