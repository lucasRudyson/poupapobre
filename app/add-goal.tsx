import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

export default function AddGoalScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [frequency, setFrequency] = useState('Mensal');

  const handleSave = async () => {
    if (!name || !targetValue) {
      Alert.alert('Erro', 'Por favor, preencha o nome e o valor total da meta.');
      return;
    }

    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO goals (name, target_value, current_value, deadline, frequency) VALUES (?, ?, ?, ?, ?)',
        [name, parseFloat(targetValue), parseFloat(currentValue || '0'), deadline, frequency]
      );
      router.back();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Erro', 'Não foi possível salvar a meta.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(88, 101, 242, 0.15)', 'transparent']}
        style={styles.bgGlow}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Meta</Text>
        <Text style={styles.brandText}>PoupaPobre</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Text */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Qual o seu próximo <Text style={{ color: Colors.primary }}>objetivo?</Text>
            </Text>
            <Text style={styles.subtitle}>Defina o caminho para a sua liberdade financeira.</Text>
          </View>

          {/* Name Input Card */}
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <Text style={styles.label}>NOME DO OBJETIVO</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.nameInput}
                placeholder="Ex: Viagem para o Japão"
                placeholderTextColor="rgba(198, 197, 215, 0.3)"
                value={name}
                onChangeText={setName}
              />
              <MaterialIcons name="edit" size={20} color="rgba(198, 197, 215, 0.4)" />
            </View>
          </BlurView>

          <View style={styles.grid}>
            {/* Target Value Card */}
            <BlurView intensity={20} tint="dark" style={[styles.glassCard, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>VALOR TOTAL</Text>
              <View style={styles.valueRow}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.valueInput}
                  placeholder="0,00"
                  placeholderTextColor="rgba(198, 197, 215, 0.2)"
                  keyboardType="numeric"
                  value={targetValue}
                  onChangeText={setTargetValue}
                />
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '25%' }]} />
              </View>
            </BlurView>

            {/* Already Saved Card */}
            <BlurView intensity={20} tint="dark" style={[styles.glassCard, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: Colors.secondary }]}>JÁ GUARDADO</Text>
              <View style={styles.valueRow}>
                <Text style={[styles.currencyPrefix, { color: Colors.secondary }]}>R$</Text>
                <TextInput
                  style={[styles.valueInput, { color: Colors.secondary }]}
                  placeholder="0,00"
                  placeholderTextColor="rgba(78, 222, 163, 0.2)"
                  keyboardType="numeric"
                  value={currentValue}
                  onChangeText={setCurrentValue}
                />
              </View>
              <View style={styles.trendingRow}>
                <MaterialIcons name="trending-up" size={14} color={Colors.secondary} />
                <Text style={styles.trendingText}>Começando bem!</Text>
              </View>
            </BlurView>
          </View>

          {/* Date Picker Section */}
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <Text style={styles.label}>DATA LIMITE / PRAZO</Text>
            <View style={styles.dateInputWrapper}>
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} style={{ marginRight: 12 }} />
              <TextInput
                style={styles.dateInput}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="rgba(198, 197, 215, 0.3)"
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </BlurView>

          {/* Frequency Selection */}
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <Text style={styles.label}>FREQUÊNCIA DE RESERVA</Text>
            <View style={styles.frequencyWrapper}>
              {['Diário', 'Semanal', 'Mensal'].map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={[
                    styles.frequencyButton,
                    frequency === item && styles.frequencyButtonActive
                  ]}
                  onPress={() => setFrequency(item)}
                >
                  <Text style={[
                    styles.frequencyText,
                    frequency === item && styles.frequencyTextActive
                  ]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          {/* Decorative Card */}
          <BlurView intensity={20} tint="dark" style={styles.decorativeCard}>
            <View style={styles.decorativeContent}>
              <Text style={styles.decorativeTitle}>Um futuro brilhante.</Text>
              <Text style={styles.decorativeSubtitle}>Suas metas são o primeiro passo para o sucesso.</Text>
            </View>
            <View style={styles.glow1} />
            <View style={styles.glow2} />
          </BlurView>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Salvar Meta</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(19, 18, 28, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.primary,
  },
  brandText: {
    marginLeft: 'auto',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.primaryContainer,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.onSurface,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurfaceVariant,
  },
  glassCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.onSurface,
  },
  grid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyPrefix: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurfaceVariant,
    marginRight: 4,
  },
  valueInput: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurface,
    padding: 0,
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 2,
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  trendingText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurface,
  },
  frequencyWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 4,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.onSurfaceVariant,
  },
  frequencyTextActive: {
    color: Colors.onPrimaryContainer,
  },
  decorativeCard: {
    height: 160,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-end',
    marginBottom: 24,
    overflow: 'hidden',
  },
  decorativeTitle: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurface,
  },
  decorativeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurfaceVariant,
  },
  glow1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(88, 101, 242, 0.2)',
    borderRadius: 60,
  },
  glow2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(251, 171, 255, 0.1)',
    borderRadius: 50,
  },
  saveButton: {
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onPrimaryContainer,
  },
});
