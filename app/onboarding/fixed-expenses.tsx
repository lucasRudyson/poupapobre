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

interface FixedExpense {
  id: number;
  name: string;
  value: number;
  category: string;
}

export default function FixedExpensesScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<FixedExpense>(
        'SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY created_at DESC',
        [userId ? Number(userId) : 1]
      );
      setExpenses(results);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = async () => {
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
        'INSERT INTO fixed_expenses (user_id, name, value) VALUES (?, ?, ?)',
        [userId ? Number(userId) : 1, newName, valueNum]
      );
      
      setNewName('');
      setNewValue('');
      setIsAdding(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a despesa.');
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + item.value, 0);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('aluguel') || n.includes('casa')) return 'home';
    if (n.includes('luz') || n.includes('energia')) return 'bolt';
    if (n.includes('internet') || n.includes('wifi')) return 'wifi';
    if (n.includes('água')) return 'water-drop';
    return 'receipt';
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
            <View style={styles.progressBarDone} />
            <View style={styles.progressBarActive} />
            <Text style={styles.progressLabel}>Passo 2 de 2</Text>
          </View>

          {/* ── Header Text ── */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              E quais são suas <Text style={styles.highlightText}>despesas fixas?</Text>
            </Text>
            <Text style={styles.subtitle}>
              Contas recorrentes como aluguel, luz, internet ou assinaturas.
            </Text>
          </View>

          {/* ── Expense List ── */}
          <View style={styles.listContainer}>
            {expenses.map((item) => (
              <BlurView key={item.id} intensity={30} tint="dark" style={styles.expenseCard}>
                <View style={styles.expenseInfo}>
                  <View style={[styles.iconBox, { borderColor: 'rgba(255, 180, 171, 0.2)' }]}>
                    <MaterialIcons name={getIcon(item.name)} size={22} color={Colors.error} />
                  </View>
                  <View>
                    <Text style={styles.expenseName}>{item.name}</Text>
                    <Text style={styles.expenseCategory}>Mensal</Text>
                  </View>
                </View>
                <Text style={styles.expenseValue}>
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </BlurView>
            ))}
          </View>

          {/* ── Add Action or Form ── */}
          {!isAdding ? (
            <TouchableOpacity 
              style={styles.addPlaceholder} 
              onPress={() => setIsAdding(true)}
            >
              <MaterialIcons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addPlaceholderText}>Adicionar nova despesa</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <View style={styles.formGlow} />
              <Text style={styles.formTitle}>Nova Despesa</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOME DA DESPESA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Internet"
                  placeholderTextColor="rgba(198, 197, 215, 0.4)"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VALOR (R$)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor="rgba(198, 197, 215, 0.4)"
                  keyboardType="numeric"
                  value={newValue}
                  onChangeText={setNewValue}
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setIsAdding(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
                  <Text style={styles.saveButtonText}>Salvar Despesa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
          <Text style={styles.totalValue}>
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.finishButton}
          onPress={() => Alert.alert('Sucesso', 'Configuração finalizada!')}
        >
          <LinearGradient
            colors={[Colors.primaryContainer, '#3f4cda']}
            style={styles.finishGradient}
          >
            <Text style={styles.finishButtonText}>Concluir</Text>
            <MaterialIcons name="check-circle" size={20} color={Colors.onPrimaryContainer} />
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  progressBarDone: {
    height: 6,
    width: 48,
    borderRadius: 3,
    backgroundColor: 'rgba(88, 101, 242, 0.4)',
  },
  progressBarActive: {
    height: 6,
    width: 48,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  progressLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  headerTextContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 36,
    color: Colors.onSurface,
    lineHeight: 44,
    marginBottom: 12,
  },
  highlightText: {
    color: Colors.primary, // Could be a gradient but using primary for now
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 18,
    color: Colors.onSurfaceVariant,
    lineHeight: 26,
  },
  listContainer: {
    gap: 16,
    marginBottom: 20,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.2)',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  expenseName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  expenseCategory: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  expenseValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  addPlaceholder: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(143, 143, 160, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPlaceholderText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.primary,
  },
  formCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.2)',
    overflow: 'hidden',
  },
  formGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
  },
  formTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    color: Colors.onSurface,
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  },
  cancelText: {
    fontFamily: 'Manrope_500Medium',
    color: Colors.onSurfaceVariant,
  },
  saveButton: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 85, 0.3)',
  },
  saveButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(69, 70, 85, 0.1)',
  },
  totalLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: Colors.onSurface,
  },
  finishButton: {
    borderRadius: 99,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  finishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 28,
    height: 56,
  },
  finishButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onPrimaryContainer,
  },
});
