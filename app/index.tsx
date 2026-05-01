import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import GoogleLogo from '@/components/GoogleLogo';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      const user = await db.getFirstAsync<{ id: number, name: string }>(
        'SELECT id, name FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (user) {
        Alert.alert('Bem-vindo', `Olá, ${user.name}! Login realizado com sucesso.`);
        // Aqui você navegaria para a home do app
        // router.push('/home'); 
      } else {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* ── Header / Logo ── */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <MaterialIcons name="savings" size={36} color="#ffffff" />
            </LinearGradient>

            <Text style={styles.title}>PoupaPobre</Text>
          </View>

          {/* ── Login Card (Glass) ── */}
          <BlurView intensity={50} tint="dark" style={styles.cardBlur}>
            <View style={styles.card}>
              {/* Subtle accent light inside card */}
              <View style={styles.cardAccent} />

              {/* ── Email Input ── */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>E-MAIL</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="mail-outline"
                    size={20}
                    color={Colors.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="nome@exemplo.com"
                    placeholderTextColor={`${Colors.outline}80`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* ── Password Input ── */}
              <View style={styles.fieldGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>SENHA</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Esqueci minha senha</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock-outline"
                    size={20}
                    color={Colors.outline}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={`${Colors.outline}80`}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={Colors.outline}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Entrar Button ── */}
              <TouchableOpacity 
                activeOpacity={0.85} 
                style={styles.loginButtonWrapper}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[Colors.primaryContainer, Colors.primaryFixedDim]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* ── Google Button ── */}
              <TouchableOpacity activeOpacity={0.85} style={styles.googleButton}>
                <GoogleLogo size={20} />
                <Text style={styles.googleButtonText}>Continuar com Google</Text>
              </TouchableOpacity>

              {/* ── Divider ── */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU ACESSE COM</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* ── Biometric ── */}
              <View style={styles.biometricRow}>
                <TouchableOpacity activeOpacity={0.7} style={styles.biometricButton}>
                  <MaterialIcons name="fingerprint" size={40} color={Colors.primary} />
                  <Text style={styles.biometricLabel}>BIOMETRIA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Não tem uma conta?{' '}
              <Link href="/register" asChild>
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    position: 'relative',
  },

  /* ── Main ── */
  main: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    zIndex: 10,
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // shadow glow
    shadowColor: '#5865f2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 36,
    letterSpacing: -0.5,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    opacity: 0.8,
  },

  /* ── Glass Card ── */
  cardBlur: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.glassBackground,
    padding: 32,
    borderRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${Colors.primary}0D`, // 5% opacity
  },

  /* ── Form Fields ── */
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    position: 'relative',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: Colors.onSurface,
    paddingVertical: 16,
    paddingLeft: 12,
    paddingRight: 16,
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  /* ── Login Button ── */
  loginButtonWrapper: {
    marginTop: 16,
    borderRadius: 9999,
    shadowColor: '#5865f2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 10,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: '#ffffff',
  },

  /* ── Google Button ── */
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}33`, // 20% opacity
  },
  googleButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },

  /* ── Divider ── */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${Colors.outlineVariant}33`,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.outline,
  },

  /* ── Biometric ── */
  biometricRow: {
    alignItems: 'center',
  },
  biometricButton: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}1A`, // 10% opacity
  },
  biometricLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.onSurfaceVariant,
  },

  /* ── Footer ── */
  footer: {
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
});
