import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadGoals();
    }
  }, [isFocused]);

  const loadGoals = async () => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync<any>('SELECT * FROM goals ORDER BY created_at DESC');
      setGoals(result);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const renderGoal = ({ item }: { item: any }) => {
    const progress = Math.min((item.current_value / item.target_value) * 100, 100);
    
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/goal-details/${item.id}`)}
        activeOpacity={0.7}
      >
        <BlurView intensity={20} tint="dark" style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalDeadline}>
                {item.deadline ? `Até ${new Date(item.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.frequency}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressValue}>
                R$ {item.current_value.toLocaleString('pt-BR')} <Text style={styles.targetValue}>/ R$ {item.target_value.toLocaleString('pt-BR')}</Text>
              </Text>
              <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(191, 194, 255, 0.1)', 'transparent']}
        style={styles.bgGlow}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Metas</Text>
        <TouchableOpacity 
          onPress={() => router.push('/add-goal')}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={24} color={Colors.onPrimaryContainer} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGoal}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="track-changes" size={64} color="rgba(191, 194, 255, 0.2)" />
            <Text style={styles.emptyTitle}>Sem metas ainda</Text>
            <Text style={styles.emptySubtitle}>Que tal definir seu primeiro objetivo financeiro hoje?</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/add-goal')}
            >
              <Text style={styles.emptyButtonText}>Começar agora</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    height: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurface,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  goalCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  goalName: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(88, 101, 242, 0.1)',
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  progressContainer: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressValue: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: Colors.onSurface,
  },
  targetValue: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.secondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onSurface,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: Colors.onPrimaryContainer,
  },
});
