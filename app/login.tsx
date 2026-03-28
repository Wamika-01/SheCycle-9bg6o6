import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { UserRole } from '@/contexts/AppContext';
import { useAlert } from '@/template';

type AuthMode = 'login' | 'signup';

const ROLES: { id: UserRole; label: string; icon: string; desc: string }[] = [
  { id: 'collector', label: 'Waste Collector', icon: '♻️', desc: 'Sell waste & earn rewards' },
  { id: 'center', label: 'Recycling Center', icon: '🏭', desc: 'Manage waste purchases' },
  { id: 'company', label: 'Company / CSR', icon: '🏢', desc: 'ESG tracking & reporting' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useApp();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('collector');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'login') {
      if (!email || !password) {
        showAlert('Missing Fields', 'Please enter email and password');
        return;
      }
    } else {
      if (!name || !email || !phone || !password) {
        showAlert('Missing Fields', 'Please fill in all required fields');
        return;
      }
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const mockUser = {
      id: `u_${Date.now()}`,
      name: mode === 'login' ? 'Sunita Devi' : name,
      email,
      phone: mode === 'login' ? '+91 98765 43210' : phone,
      role: selectedRole,
      location: 'Jalandhar, Punjab',
      companyName: selectedRole === 'company' ? companyName || 'SheCycle Corp' : undefined,
      joinDate: '1/1/2026',
    };

    await login(mockUser);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const quickLogin = async (role: UserRole) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const names: Record<UserRole, string> = {
      collector: 'Sunita Devi',
      center: 'Green Recyclers Hub',
      company: 'EcoCorp Punjab',
    };
    await login({
      id: `demo_${role}`,
      name: names[role],
      email: `demo@shecycle.in`,
      phone: '+91 98765 00000',
      role,
      location: 'Jalandhar, Punjab',
      companyName: role === 'company' ? 'EcoCorp Punjab' : undefined,
      joinDate: '1/1/2026',
    });
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd, '#FF85A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + Spacing.xxxl }]}
        >
          <Text style={styles.logo}>SheCycle</Text>
          <Text style={styles.tagline}>Empowering Women Waste Collectors</Text>
          <Text style={styles.subTagline}>Jalandhar • Punjab</Text>
        </LinearGradient>

        <View style={styles.card}>
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'signup' && styles.modeBtnActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeBtnText, mode === 'signup' && styles.modeBtnTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Select Role</Text>
          {ROLES.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[styles.roleCard, selectedRole === role.id && styles.roleCardActive]}
              onPress={() => setSelectedRole(role.id)}
            >
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleLabel, selectedRole === role.id && styles.roleLabelActive]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </View>
              {selectedRole === role.id && (
                <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}

          {/* Form */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="person" size={18} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email / Phone *</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={18} color={Colors.gray400} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'login' ? 'test@shecycle.in' : 'Enter email'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.gray400}
              />
            </View>
          </View>

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="phone" size={18} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={18} color={Colors.gray400} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'login' ? '123456' : 'Create password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.gray400}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={18}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signup' && selectedRole === 'company' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="business" size={18} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter company name"
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            </View>
          )}

          {mode === 'login' && (
            <View style={styles.demoHint}>
              <MaterialIcons name="info" size={14} color={Colors.primary} />
              <Text style={styles.demoHintText}>  Demo: test@shecycle.in / 123456</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or try demo</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickLogins}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.id}
                style={styles.quickBtn}
                onPress={() => quickLogin(r.id)}
                disabled={loading}
              >
                <Text style={styles.quickBtnIcon}>{r.icon}</Text>
                <Text style={styles.quickBtnText}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl + Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  subTagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  card: {
    margin: Spacing.lg,
    marginTop: -Spacing.xxxl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  modeBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.gray200,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceTinted,
  },
  roleIcon: { fontSize: 24 },
  roleLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  roleLabelActive: { color: Colors.primary },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.gray100,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceTinted,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  demoHintText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  submitBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  submitGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  submitText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  dividerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  quickLogins: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    gap: 4,
  },
  quickBtnIcon: { fontSize: 20 },
  quickBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});
