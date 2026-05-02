import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { validateDateSelection } from '../../utils/validators';
import * as SQLite from 'expo-sqlite';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface Goal {
  id: number;
  name: string;
  target_value: number;
  current_value: number;
  deadline: string;
}

interface GoalLog {
  id: number;
  value: number;
  date: string;
  description: string;
}

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = SQLite.useSQLiteContext();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<GoalLog[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoalData();
  }, [id]);

  const fetchGoalData = async () => {
    try {
      const goalResult = await db.getFirstAsync<Goal>(
        'SELECT * FROM goals WHERE id = ?',
        [id as string]
      );
      
      if (goalResult) {
        setGoal(goalResult);
        const logsResult = await db.getAllAsync<GoalLog>(
          'SELECT * FROM goal_logs WHERE goal_id = ? ORDER BY date DESC',
          [id as string]
        );
        setLogs(logsResult);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goal details:', error);
      setLoading(false);
    }
  };

  const handleAddContribution = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    // Validação Universal de Data
    const dateValidation = validateDateSelection(date);
    if (!dateValidation.isValid) {
      Alert.alert('Data Inválida', dateValidation.message);
      return;
    }

    const value = parseFloat(amount);
    const dateStr = date.toISOString();

    try {
      // 1. Add to logs
      await db.runAsync(
        'INSERT INTO goal_logs (goal_id, value, date, description) VALUES (?, ?, ?, ?)',
        [id as string, value, dateStr, description || 'Aporte']
      );

      // 2. Update goal current_value
      await db.runAsync(
        'UPDATE goals SET current_value = current_value + ? WHERE id = ?',
        [value, id as string]
      );

      setAmount('');
      setDescription('');
      fetchGoalData();
    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Erro', 'Não foi possível salvar o aporte.');
    }
  };

  const handleDeleteLog = async (logId: number, value: number) => {
    Alert.alert(
      'Excluir Aporte',
      'Tem certeza que deseja remover este valor da sua meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Delete from logs
              await db.runAsync('DELETE FROM goal_logs WHERE id = ?', [logId]);

              // 2. Subtract from goal current_value
              await db.runAsync(
                'UPDATE goals SET current_value = current_value - ? WHERE id = ?',
                [value, id as string]
              );

              fetchGoalData();
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('Erro', 'Não foi possível excluir o aporte.');
            }
          },
        },
      ]
    );
  };

  const renderLeftActions = (logId: number, value: number) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteLog(logId, value)}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={28} color="#fff" />
      </TouchableOpacity>
    );
  };

  if (!goal && !loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Meta não encontrada.</Text>
      </View>
    );
  }

  const progress = goal ? (goal.current_value / goal.target_value) : 0;
  const progressPercent = Math.min(Math.round(progress * 100), 100);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: goal?.name || 'Detalhes da Meta',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSpacer} />

        {/* Hero Progress Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(190, 194, 255, 0.2)', 'transparent']}
            style={styles.heroGradient}
          />
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressPercentage}>{progressPercent}%</Text>
              <Text style={styles.progressLabel}>Concluído</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Guardado</Text>
              <Text style={styles.statValue}>R$ {goal?.current_value.toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Objetivo</Text>
              <Text style={styles.statValue}>R$ {goal?.target_value.toLocaleString('pt-BR')}</Text>
            </View>
          </View>
        </View>

        {/* Add Contribution Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adicionar Valor</Text>
          <BlurView intensity={20} style={styles.inputCard}>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="cash-plus" size={24} color={Colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="Quanto você guardou?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="pencil-outline" size={24} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity 
              style={styles.inputRow} 
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={24} color="rgba(255,255,255,0.5)" />
              <Text style={styles.dateText}>
                Data: {date.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
            <TouchableOpacity style={styles.addButton} onPress={handleAddContribution}>
              <LinearGradient
                colors={[Colors.primary, '#8a90ff']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addButtonText}>Confirmar Aporte</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Aportes</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={48} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Nenhum registro ainda.</Text>
            </View>
          ) : (
            logs.map((log) => (
              <Swipeable
                key={log.id}
                renderLeftActions={() => renderLeftActions(log.id, log.value)}
                friction={2}
                leftThreshold={40}
              >
                <BlurView intensity={10} style={styles.logCard}>
                  <View style={styles.logIconContainer}>
                    <MaterialCommunityIcons name="arrow-up-circle" size={24} color="#4ade80" />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logDescription}>{log.description}</Text>
                    <Text style={styles.logDate}>
                      {new Date(log.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.logValue}>+ R$ {log.value.toLocaleString('pt-BR')}</Text>
                </BlurView>
              </Swipeable>
            ))
          )}
        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    padding: 20,
  },
  headerSpacer: {
    height: 100,
  },
  backButton: {
    marginLeft: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  progressCircleContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: 'rgba(190, 194, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(190, 194, 255, 0.05)',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    marginLeft: 5,
  },
  inputCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 55,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  addButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logDescription: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  logDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  logValue: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 10,
    fontSize: 14,
  },
  deleteAction: {
    backgroundColor: Colors.error || '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '84%',
    borderRadius: 20,
    marginBottom: 10,
  },
});
