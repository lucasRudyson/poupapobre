import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useIsFocused } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

interface Expense {
  id: number;
  description: string;
  value: number;
  category: string;
  date: string;
  is_recurrent: number;
  fixed_id?: number;
}

interface FixedExpense {
  id: number;
  name: string;
  value: number;
  category: string;
  due_day: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  alimentacao: 'restaurant',
  transporte: 'directions-car',
  lazer: 'celebration',
  saude: 'medical-services',
  moradia: 'home',
  outros: 'more-horiz',
};

export default function ExpensesListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [variables, setVariables] = useState<Expense[]>([]);
  const [allFixed, setAllFixed] = useState<FixedExpense[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<number[]>([]);
  const [totalFixed, setTotalFixed] = useState(0);
  const [totalVariable, setTotalVariable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const currentMonth = new Date().toISOString().slice(0, 7);

      // 1. Load Variable Expenses (Not recurrent and not linked to fixed_id)
      const varResults = await db.getAllAsync<Expense>(
        'SELECT * FROM transactions WHERE type = "expense" AND fixed_id IS NULL ORDER BY date DESC'
      );
      setVariables(varResults);
      setTotalVariable(varResults.reduce((acc, curr) => acc + curr.value, 0));

      // 2. Load Fixed Checklist
      const fixed = await db.getAllAsync<FixedExpense>('SELECT * FROM fixed_expenses');
      setAllFixed(fixed);
      
      // Get confirmed fixed IDs for this month
      const confirmedResults = await db.getAllAsync<{ fixed_id: number }>(
        'SELECT fixed_id FROM transactions WHERE type = "expense" AND date LIKE ? AND fixed_id IS NOT NULL',
        [`${currentMonth}%`]
      );
      const cIds = confirmedResults.map(r => r.fixed_id);
      setConfirmedIds(cIds);

      // Total Fixed (all of them, as they are commitments)
      setTotalFixed(fixed.reduce((acc, curr) => acc + curr.value, 0));

    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfirm = async (fixed: FixedExpense, isConfirmed: boolean) => {
    try {
      const db = await getDatabase();
      const currentMonth = new Date().toISOString().slice(0, 7);
      const today = new Date().toISOString().split('T')[0];

      if (isConfirmed) {
        await db.runAsync(
          'DELETE FROM transactions WHERE type = "expense" AND fixed_id = ? AND date LIKE ?',
          [fixed.id, `${currentMonth}%`]
        );
      } else {
        await db.runAsync(
          'INSERT INTO transactions (user_id, type, description, value, category, date, is_recurrent, fixed_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [1, 'expense', fixed.name, fixed.value, fixed.category, today, 1, fixed.id]
        );
      }
      loadData();
    } catch (error) {
      console.error('Error toggling expense:', error);
    }
  };

  const renderFixedItem = ({ item }: { item: FixedExpense }) => {
    const isConfirmed = confirmedIds.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.fixedCard, isConfirmed && styles.fixedCardConfirmed]}
        onPress={() => handleToggleConfirm(item, isConfirmed)}
      >
        <View style={styles.cardLeft}>
          <MaterialIcons 
            name={isConfirmed ? 'check-circle' : 'radio-button-unchecked'} 
            size={24} 
            color={isConfirmed ? '#4EDE67' : Colors.outline} 
          />
          <View>
            <Text style={[styles.fixedName, isConfirmed && styles.textStrikethrough]}>{item.name}</Text>
            <Text style={styles.fixedMeta}>Vence dia {item.due_day} • R$ {item.value.toLocaleString('pt-BR')}</Text>
          </View>
        </View>
        <Text style={[styles.fixedValue, isConfirmed && styles.textStrikethrough]}>
          R$ {item.value.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderVariableItem = ({ item }: { item: Expense }) => (
    <View style={styles.varCard}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons name={CATEGORY_ICONS[item.category] || 'shopping-bag'} size={20} color={Colors.error} />
        </View>
        <View>
          <Text style={styles.varName}>{item.description}</Text>
          <Text style={styles.varMeta}>{new Date(item.date).toLocaleDateString('pt-BR')} • {item.category}</Text>
        </View>
      </View>
      <Text style={styles.varValue}>- R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Despesas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Summary ── */}
      <View style={styles.summaryContainer}>
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>FIXAS (COMPROMISSOS)</Text>
              <Text style={styles.summaryValue}>R$ {totalFixed.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={[styles.summaryLabel, { color: Colors.error }]}>VARIÁVEIS (CUIDADO!)</Text>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>R$ {totalVariable.toLocaleString('pt-BR')}</Text>
            </View>
          </View>
        </BlurView>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.error} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={variables}
            renderItem={renderVariableItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {allFixed.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Checklist de Fixas</Text>
                    {allFixed.map(item => (
                      <React.Fragment key={`fixed-${item.id}`}>
                        {renderFixedItem({ item })}
                      </React.Fragment>
                    ))}
                    <View style={styles.separator} />
                  </View>
                )}
                <Text style={[styles.sectionTitle, { color: Colors.error }]}>Gastos Variáveis do Mês</Text>
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma despesa variável ainda.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-expense')}
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
    borderRadius: 20,
  },
  summaryContainer: {
    padding: 24,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(228, 225, 238, 0.1)',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  listContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.outline,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fixedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
  },
  fixedCardConfirmed: {
    backgroundColor: 'rgba(78, 222, 163, 0.05)',
    borderColor: 'rgba(78, 222, 163, 0.1)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fixedName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  fixedMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.outline,
  },
  fixedValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  varCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  varName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  varMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.outline,
  },
  varValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: Colors.error,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(228, 225, 238, 0.05)',
    marginVertical: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.outline,
    fontFamily: 'Inter_400Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
});
