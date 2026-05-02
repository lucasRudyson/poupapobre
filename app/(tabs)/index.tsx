import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('Lucas');
  const [incomesTotal, setIncomesTotal] = useState(0);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [latestTransactions, setLatestTransactions] = useState<any[]>([]);
  const [goalsProgress, setGoalsProgress] = useState({ current: 0, target: 0, name: '', id: null as number | null });

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const fetchData = async () => {
    try {
      const db = await getDatabase();
      
      // Calculate totals from transactions table
      const transactions = await db.getAllAsync<{ value: number, type: string }>(
        'SELECT value, type FROM transactions'
      );
      
      const totalInc = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, item) => sum + item.value, 0);
        
      const totalExp = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, item) => sum + item.value, 0);

      setIncomesTotal(totalInc);
      setExpensesTotal(totalExp);
      setBalance(totalInc - totalExp);

      // Fetch latest 5 transactions
      const latest = await db.getAllAsync<any>(
        'SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT 5'
      );
      setLatestTransactions(latest);

      // Fetch goals progress and latest goal name
      const goalsData = await db.getFirstAsync<{ current: number, target: number, name: string, id: number }>(
        'SELECT id, name, current_value as current, target_value as target FROM goals ORDER BY created_at DESC LIMIT 1'
      );
      if (goalsData) {
        setGoalsProgress({ 
          current: goalsData.current || 0, 
          target: goalsData.target || 0,
          name: goalsData.name || '',
          id: goalsData.id
        });
      } else {
        setGoalsProgress({ current: 0, target: 0, name: '', id: null });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getIcon = (category: string, type: string) => {
    const icons: any = {
      salario: 'payments',
      investimento: 'trending-up',
      venda: 'sell',
      alimentacao: 'restaurant',
      transporte: 'directions-car',
      lazer: 'celebration',
      saude: 'medical-services',
      moradia: 'home',
    };
    return icons[category?.toLowerCase()] || (type === 'income' ? 'add-circle' : 'remove-circle');
  };

  return (
    <View style={styles.container}>
      {/* ── Background Glow ── */}
      <View style={styles.ambientGlow} />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' }} 
              style={styles.avatar} 
            />
          </View>
          <View>
            <Text style={styles.welcomeText}>BEM-VINDO</Text>
            <Text style={styles.userName}>Olá, {userName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="rgba(228, 225, 238, 0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Main Balance Card ── */}
        <View style={styles.balanceCardContainer}>
          <BlurView intensity={60} tint="dark" style={styles.balanceCard}>
            <View style={styles.cardGlow} />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo Atual</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.currency}>R$</Text>
                <Text style={styles.balanceValue}>
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.trendBadge}>
                <MaterialIcons name="trending-up" size={14} color={Colors.secondary} />
                <Text style={styles.trendText}>+12.5% este mês</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: Colors.primaryContainer }]}
                onPress={() => router.push('/incomes-list')}
              >
                <MaterialIcons name="add-circle" size={20} color={Colors.onPrimaryContainer} />
                <Text style={styles.actionLabel}>RECEITA</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/expenses-list')}
              >
                <MaterialIcons name="remove-circle" size={20} color={Colors.onSurface} />
                <Text style={styles.actionLabel}>DESPESA</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/goals')}
              >
                <MaterialIcons name="track-changes" size={20} color={Colors.primary} />
                <Text style={styles.actionLabel}>METAS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="receipt-long" size={20} color={Colors.onSurface} />
                <Text style={styles.actionLabel}>EXTRATO</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {latestTransactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyText}>Nenhuma transação este mês.</Text>
            </View>
          ) : (
            latestTransactions.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transInfo}>
                  <View style={[
                    styles.transIconBox, 
                    { backgroundColor: item.type === 'income' ? 'rgba(78, 222, 163, 0.1)' : 'rgba(255, 107, 107, 0.1)' }
                  ]}>
                    <MaterialIcons 
                      name={getIcon(item.category, item.type)} 
                      size={24} 
                      color={item.type === 'income' ? Colors.secondary : Colors.error} 
                    />
                  </View>
                  <View>
                    <Text style={styles.transName}>{item.description}</Text>
                    <Text style={styles.transMeta}>
                      {new Date(item.date).toLocaleDateString('pt-BR')} • {item.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.transValueBox}>
                  <Text style={[
                    styles.transValue, 
                    { color: item.type === 'income' ? Colors.secondary : Colors.onSurface }
                  ]}>
                    {item.type === 'income' ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={[
                    styles.transType, 
                    { color: item.type === 'income' ? Colors.secondary : Colors.error }
                  ]}>
                    {item.type === 'income' ? 'RECEBIDO' : 'PAGO'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── Premium Goal Card ── */}
        <TouchableOpacity 
          style={styles.premiumGoalCard}
          onPress={() => goalsProgress.id ? router.push(`/goal-details/${goalsProgress.id}`) : router.push('/goals')}
          activeOpacity={0.9}
        >
          <BlurView intensity={30} tint="dark" style={styles.premiumGoalBlur}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqxLDM3DGfRYbC98JiNrgEOD9hJmeFUVKvJpoDjdVqEwf9ow6p9i5bEbd69ecgK5NmEf_3G-4AichgeW7OfQWz16FKQiWivvD0_i_zKfXtllQ6muVNtrRgjdEj1eRO5iFJk7qIV8-oFMLOOuLupbtrEulF15huJaMSbIAU4YCrNay59sq8-IVSRVlUw1iKT_ROMGE8n3OYcm7C8NQCnVDD3WqRxJzrEzsvsp5p8flDchPUZ_uld4nzdzaq9Ufmuv0Q9zG3CJceubA' }}
              style={styles.decorativeImage}
            />
            
            <View style={styles.premiumGoalContent}>
              <View style={styles.premiumGoalTextSection}>
                <Text style={styles.premiumGoalTitle}>
                  {goalsProgress.name || 'Um futuro brilhante.'}
                </Text>
                {goalsProgress.target === 0 ? (
                  <Text style={styles.premiumGoalSubtitle}>Suas metas são o primeiro passo para o sucesso.</Text>
                ) : (
                  <View style={styles.premiumProgressInfo}>
                    <Text style={styles.premiumGoalSubtitle}>
                      R$ {goalsProgress.current.toLocaleString('pt-BR')} de R$ {goalsProgress.target.toLocaleString('pt-BR')}
                    </Text>
                    <View style={styles.premiumProgressBarBg}>
                      <View style={[
                        styles.premiumProgressBarFill, 
                        { width: `${Math.min((goalsProgress.current / goalsProgress.target) * 100, 100)}%` }
                      ]} />
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.glow1} />
            <View style={styles.glow2} />
          </BlurView>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  ambientGlow: {
    position: 'absolute',
    top: -width * 0.5,
    left: 0,
    right: 0,
    height: width,
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
    borderRadius: width / 2,
    transform: [{ scaleX: 2 }],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  userName: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  balanceCardContainer: {
    marginBottom: 40,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.1)',
  },
  balanceCard: {
    padding: 32,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
  },
  balanceLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(198, 197, 215, 0.8)',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  currency: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 8,
  },
  balanceValue: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 48,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  trendText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 70,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
  },
  seeAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  transactionsList: {
    gap: 12,
    marginBottom: 32,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
  },
  transInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  transMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  transValueBox: {
    alignItems: 'flex-end',
  },
  transValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  transType: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.error,
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
  },
  goalTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
    marginBottom: 20,
  },
  goalProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  goalValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: Colors.primary,
  },
  goalTarget: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: 'normal',
  },
  goalPercent: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.secondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(52, 52, 62, 0.3)',
    padding: 16,
    borderRadius: 16,
  },
  insightText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  emptyTransactions: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.outline,
  },
  premiumGoalCard: {
    height: 192, // h-48 equivalent
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
  },
  premiumGoalBlur: {
    flex: 1,
    padding: 32, // p-8
    justifyContent: 'flex-end',
  },
  decorativeImage: {
    position: 'absolute',
    top: 24,
    right: 32,
    width: 96,
    height: 96,
    borderRadius: 24,
    transform: [{ rotate: '12deg' }],
    opacity: 0.5,
    tintColor: 'rgba(255, 255, 255, 0.5)', // grayscale-ish effect
  },
  premiumGoalContent: {
    zIndex: 10,
  },
  premiumGoalTextSection: {
    gap: 8,
  },
  premiumGoalTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: Colors.onSurface,
  },
  premiumGoalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  premiumProgressInfo: {
    marginTop: 4,
  },
  premiumProgressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 12,
    width: '100%',
  },
  premiumProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  glow1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(88, 101, 242, 0.15)',
    borderRadius: 70,
  },
  glow2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(251, 171, 255, 0.1)',
    borderRadius: 60,
  },
});
