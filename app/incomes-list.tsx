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

interface Income {
  id: number;
  description: string;
  value: number;
  category: string;
  date: string;
  is_recurrent: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  salario: 'payments',
  investimento: 'trending-up',
  presente: 'card-giftcard',
  venda: 'sell',
  outros: 'more-horiz',
};

interface FixedIncome {
  id: number;
  name: string;
  value: number;
  category: string;
  due_day: number;
}

export default function IncomesListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [allFixed, setAllFixed] = useState<FixedIncome[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<number[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
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
      
      // 1. Load History (Real transactions)
      const results = await db.getAllAsync<Income>(
        'SELECT * FROM transactions WHERE type = "income" ORDER BY date DESC'
      );
      setIncomes(results);

      // 2. Calculate current month's fixed incomes that are NOT confirmed yet
      const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      
      const fixed = await db.getAllAsync<FixedIncome>('SELECT * FROM fixed_incomes');
      setAllFixed(fixed);
      
      // Get IDs of fixed incomes already confirmed this month
      const confirmedResults = await db.getAllAsync<{ fixed_id: number }>(
        'SELECT fixed_id FROM transactions WHERE type = "income" AND date LIKE ? AND fixed_id IS NOT NULL',
        [`${currentMonth}%`]
      );
      const cIds = confirmedResults.map(r => r.fixed_id);
      setConfirmedIds(cIds);

      // 3. Calculate total
      const total = results.reduce((acc, curr) => acc + curr.value, 0);
      setTotalIncome(total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfirm = async (fixed: FixedIncome, isConfirmed: boolean) => {
    try {
      const db = await getDatabase();
      const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const today = new Date().toISOString().split('T')[0];

      if (isConfirmed) {
        // Desmarcar: Remover a transação do mês atual vinculada a este fixed_id
        await db.runAsync(
          'DELETE FROM transactions WHERE type = "income" AND fixed_id = ? AND date LIKE ?',
          [fixed.id, `${currentMonth}%`]
        );
      } else {
        // Marcar: Criar a transação
        await db.runAsync(
          'INSERT INTO transactions (user_id, type, description, value, category, date, is_recurrent, fixed_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [1, 'income', fixed.name, fixed.value, fixed.category, today, 1, fixed.id]
        );
      }

      // Atualiza os dados
      loadData();
    } catch (error) {
      console.error('Error toggling confirmation:', error);
    }
  };

  const renderFixedItem = ({ item }: { item: FixedIncome }) => {
    const isConfirmed = confirmedIds.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.fixedCard, isConfirmed && styles.fixedCardConfirmed]}
        onPress={() => handleToggleConfirm(item, isConfirmed)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={[
            styles.iconBox, 
            { backgroundColor: isConfirmed ? 'rgba(78, 222, 163, 0.1)' : 'rgba(228, 225, 238, 0.05)' }
          ]}>
            <MaterialIcons 
              name={isConfirmed ? 'check-circle' : 'radio-button-unchecked'} 
              size={24} 
              color={isConfirmed ? Colors.secondary : Colors.outline} 
            />
          </View>
          <View>
            <Text style={[styles.fixedDescription, isConfirmed && styles.fixedTextConfirmed]}>
              {item.name}
            </Text>
            <Text style={styles.fixedDate}>Dia {item.due_day} • R$ {item.value.toLocaleString('pt-BR')}</Text>
          </View>
        </View>
        <MaterialIcons 
          name={isConfirmed ? 'check-box' : 'check-box-outline-blank'} 
          size={24} 
          color={isConfirmed ? Colors.secondary : 'rgba(228, 225, 238, 0.2)'} 
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Income }) => (
    <View style={styles.incomeCard}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons 
            name={CATEGORY_ICONS[item.category] || 'payments'} 
            size={24} 
            color={Colors.primary} 
          />
        </View>
        <View>
          <Text style={styles.incomeDescription}>{item.description}</Text>
          <Text style={styles.incomeDate}>
            {new Date(item.date).toLocaleDateString('pt-BR')}
            {item.is_recurrent ? ' • Recurrente' : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.incomeValue}>
        + R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Receitas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Summary Card ── */}
      <View style={styles.summaryContainer}>
        <BlurView intensity={20} tint="dark" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL RECEBIDO</Text>
          <Text style={styles.summaryValue}>
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.summaryFooter}>
            <MaterialIcons name="trending-up" size={16} color={Colors.primary} />
            <Text style={styles.summaryFooterText}>Este mês você recebeu 12% mais que o anterior</Text>
          </View>
        </BlurView>
      </View>

      {/* ── List Section ── */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Histórico Recente</Text>
          <TouchableOpacity onPress={loadData}>
            <MaterialIcons name="refresh" size={20} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={incomes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {allFixed.length > 0 && (
                  <View style={styles.fixedSection}>
                    <Text style={styles.fixedSectionTitle}>Checklist do Mês</Text>
                    {allFixed.map((item) => (
                      <React.Fragment key={`fixed-${item.id}`}>
                        {renderFixedItem({ item })}
                      </React.Fragment>
                    ))}
                    <View style={styles.separator} />
                  </View>
                )}
                <Text style={styles.listTitle}>Histórico de Entradas</Text>
              </>
            }
          />
        )}
      </View>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-income')}
      >
        <MaterialIcons name="add" size={32} color={Colors.onPrimaryContainer} />
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
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(190, 194, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(190, 194, 255, 0.1)',
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.outline,
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryFooterText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.primary,
  },
  listSection: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  listContent: {
    paddingBottom: 100,
  },
  incomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(190, 194, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeDescription: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  incomeDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.outline,
    marginTop: 2,
  },
  incomeValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  incomeValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  fixedSection: {
    marginBottom: 24,
  },
  fixedSectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: Colors.outline,
    marginBottom: 12,
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
  fixedDescription: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: 'rgba(228, 225, 238, 0.8)',
  },
  fixedTextConfirmed: {
    color: Colors.secondary,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  fixedDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.outline,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(228, 225, 238, 0.05)',
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.outline,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(190, 194, 255, 0.1)',
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
