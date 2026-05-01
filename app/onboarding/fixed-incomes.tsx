import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

interface FixedIncome {
  id: number;
  name: string;
  value: number;
  type: string;
}

export default function FixedIncomesScreen() {
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams();
  
  const [incomes, setIncomes] = useState<FixedIncome[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<FixedIncome>(
        'SELECT * FROM fixed_incomes WHERE user_id = ? ORDER BY created_at DESC',
        [userId ? Number(userId) : 1] // Fallback to 1 for demo
      );
      setIncomes(results);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleAddIncome = async () => {
    if (!newName || !newValue) {
      Alert.alert('Erro', 'Por favor, preencha o nome e o valor.');
      return;
    }

    const valueNum = parseFloat(newValue.replace(',', '.'));
    if (isNaN(valueNum)) {
      Alert.alert('Erro', 'Valor inválido.');
      return;
    }

    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO fixed_incomes (user_id, name, value) VALUES (?, ?, ?)',
        [userId ? Number(userId) : 1, newName, valueNum]
      );
      
      setNewName('');
      setNewValue('');
      fetchIncomes();
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a receita.');
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header Navigation ── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>LUMINOUS VAULT</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Progress Indicator ── */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarActive} />
            <View style={styles.progressBarInactive} />
          </View>

          {/* ── Header Text ── */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Quais são suas receitas fixas?</Text>
            <Text style={styles.subtitle}>
              Registre aqui os valores que você recebe todo mês, como salário ou aluguéis.
            </Text>
          </View>

          {/* ── Income List ── */}
          <View style={styles.listContainer}>
            {incomes.map((item) => (
              <BlurView key={item.id} intensity={40} tint="dark" style={styles.incomeCard}>
                <View style={styles.incomeInfo}>
                  <View style={styles.iconBox}>
                    <MaterialIcons 
                      name={item.name.toLowerCase().includes('salário') ? 'work' : 'apartment'} 
                      size={20} 
                      color={Colors.primary} 
                    />
                  </View>
                  <View>
                    <Text style={styles.incomeName}>{item.name}</Text>
                    <Text style={styles.incomeType}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.incomeValue}>
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </BlurView>
            ))}
          </View>

          {/* ── Add Form ── */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <MaterialIcons name="add-circle" size={16} color={Colors.primary} />
              <Text style={styles.formTitle}>Adicionar Nova Receita</Text>
            </View>

            <View style={styles.formBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOME DA RECEITA</Text>
                <View style={styles.sunkenInput}>
                  <MaterialIcons name="edit" size={18} color={Colors.outlineVariant} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Renda Extra Freelance"
                    placeholderTextColor="rgba(198, 197, 215, 0.5)"
                    value={newName}
                    onChangeText={setNewName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VALOR (R$)</Text>
                <View style={styles.sunkenInput}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={[styles.input, styles.valueInput]}
                    placeholder="0,00"
                    placeholderTextColor="rgba(143, 143, 160, 0.5)"
                    keyboardType="numeric"
                    value={newValue}
                    onChangeText={setNewValue}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddIncome}>
                <MaterialIcons name="add" size={16} color={Colors.onSurface} />
                <Text style={styles.addButtonText}>Adicionar à lista</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacing for sticky button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Action ── */}
      <View style={styles.bottomAction}>
        <TouchableOpacity activeOpacity={0.9} style={styles.continueButton}>
          <LinearGradient
            colors={[Colors.primaryContainer, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimaryContainer} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'rgba(19, 18, 28, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#292933',
  },
  navTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    color: Colors.primary,
    letterSpacing: 3,
  },
  scrollContent: {
    padding: 24,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  progressBarActive: {
    height: 4,
    width: 48,
    borderRadius: 2,
    backgroundColor: Colors.primaryContainer,
  },
  progressBarInactive: {
    height: 4,
    width: 48,
    borderRadius: 2,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  listContainer: {
    gap: 16,
    marginBottom: 24,
  },
  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
  },
  incomeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
  },
  incomeName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  incomeType: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  incomeValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.secondary,
  },
  formCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  formBody: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  sunkenInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
  },
  inputIcon: {
    marginRight: 12,
  },
  currencyPrefix: {
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.outlineVariant,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
  },
  valueInput: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.secondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.15)',
    marginTop: 8,
  },
  addButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: Colors.surface,
  },
  continueButton: {
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 64,
  },
  continueButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onPrimaryContainer,
  },
});
