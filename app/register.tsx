import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Colors from '@/constants/Colors';
import GoogleLogo from '@/components/GoogleLogo';
import { getDatabase } from '@/services/database';
import { fetchGoogleUserInfo, handleGoogleAuthResult } from '@/services/googleAuth';
import { GOOGLE_CONFIG, isGoogleConfigured } from '@/constants/googleConfig';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Google OAuth ──
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) processGoogleSignUp(token);
    } else if (response?.type === 'error') {
      Alert.alert('Erro', 'Login com Google cancelado ou falhou.');
    }
  }, [response]);

  const processGoogleSignUp = async (accessToken: string) => {
    setGoogleLoading(true);
    try {
      const userInfo = await fetchGoogleUserInfo(accessToken);
      const { user, isNewUser } = await handleGoogleAuthResult(userInfo);

      if (isNewUser) {
        router.push({
          pathname: '/onboarding/fixed-incomes',
          params: { userId: user.id, userName: user.name },
        });
      } else {
        // Já tem conta — redireciona direto
        Alert.alert(
          'Conta encontrada!',
          `Você já possui uma conta com ${userInfo.email}. Redirecionando para o dashboard.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (user.onboarding_completed === 1) {
                  router.replace('/dashboard');
                } else {
                  router.push({
                    pathname: '/onboarding/fixed-incomes',
                    params: { userId: user.id, userName: user.name },
                  });
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Google sign up error:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar com o Google. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleButtonPress = () => {
    if (!isGoogleConfigured()) {
      Alert.alert(
        '⚙️ Configuração necessária',
        'As credenciais do Google ainda não foram configuradas.\n\nEdite o arquivo constants/googleConfig.ts e adicione seus Client IDs do Google Cloud Console.',
        [{ text: 'Entendi' }]
      );
      return;
    }
    promptAsync();
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      
      // Check if user already exists
      const existingUser = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        Alert.alert('Erro', 'Este e-mail já está cadastrado.');
        setLoading(false);
        return;
      }

      // Insert user
      await db.runAsync(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      );

      // Get the new user id
      const newUser = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      router.push({
        pathname: '/onboarding/fixed-incomes',
        params: { userId: newUser?.id, userName: name }
      });
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* ── Header Section ── */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>PoupaPobre</Text>
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Comece a poupar hoje</Text>
          </View>

          {/* ── Register Card (Glass) ── */}
          <BlurView intensity={50} tint="dark" style={styles.glassCard}>
            <View style={styles.form}>
              {/* Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor={Colors.outline}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-MAIL</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="exemplo@email.com"
                    placeholderTextColor={Colors.outline}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Passwords Grid (Two columns on web, stack on mobile) */}
              <View style={styles.passwordContainer}>
                <View style={styles.passwordInputGroup}>
                  <Text style={styles.label}>SENHA</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.outline}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>
                <View style={styles.passwordInputGroup}>
                  <Text style={styles.label}>CONFIRMAR SENHA</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.outline}
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
              </View>

              {/* CTA Button */}
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={[Colors.primaryContainer, '#3f4cda']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.registerButtonText}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <TouchableOpacity
                style={[styles.socialButton, (googleLoading || !request) && styles.buttonDisabled]}
                activeOpacity={0.7}
                onPress={handleGoogleButtonPress}
                disabled={googleLoading || !request}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={Colors.onSurface} />
                ) : (
                  <GoogleLogo size={24} />
                )}
                <Text style={styles.socialButtonText}>
                  {googleLoading ? 'Aguardando Google...' : 'Continuar com Google'}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* ── Footer Link ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Já possui uma conta?{' '}
              <Link href="/" asChild>
                <Text style={styles.footerLink}>Fazer Login</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  main: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.primaryContainer,
    letterSpacing: -1,
  },
  title: {
    fontSize: 36,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    paddingHorizontal: 16,
    color: Colors.onSurface,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
  },
  passwordContainer: {
    width: '100%',
    gap: 16,
  },
  passwordInputGroup: {
    gap: 8,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradientButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.outline,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    height: 56,
    borderRadius: 999,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialButtonText: {
    color: Colors.onSurface,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Manrope_400Regular',
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
});
