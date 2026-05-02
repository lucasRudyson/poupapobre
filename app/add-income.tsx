import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Platform as RNPlatform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/services/database';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'salario', name: 'Salário', icon: 'payments' },
  { id: 'investimento', name: 'Investimento', icon: 'trending-up' },
  { id: 'presente', name: 'Presente', icon: 'card-giftcard' },
  { id: 'venda', name: 'Venda', icon: 'sell' },
  { id: 'outros', name: 'Outros', icon: 'more-horiz' },
];

export default function AddIncomeScreen() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('salario');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [dueDay, setDueDay] = useState('10');
  const [frequency, setFrequency] = useState('Mensal');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleValueChange = (text: string) => {
    const cleanValue = text.replace(/\D/g, '');
    if (!cleanValue || parseInt(cleanValue) === 0) {
      setValue('');
      return;
    }
    const floatValue = parseFloat(cleanValue) / 100;
    setValue(floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  const handleSave = async () => {
    const numericValue = parseFloat(value.replace('.', '').replace(',', '.'));
    
    if (numericValue <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    if (!description) {
      Alert.alert('Erro', 'Por favor, insira uma descrição.');
      return;
    }

    setLoading(true);
    try {
      const db = await getDatabase();
      
      // Get the first user for now (since we don't have a session context yet)
      const user = await db.getFirstAsync<{ id: number }>('SELECT id FROM users LIMIT 1');
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      const date = selectedDate.toISOString();

      await db.runAsync(
        'INSERT INTO transactions (user_id, type, description, value, category, date, is_recurrent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, 'income', description, numericValue, selectedCategory, date, isRecurrent ? 1 : 0]
      );

      // If recurrent, also add to fixed_incomes
      if (isRecurrent) {
        await db.runAsync(
          'INSERT INTO fixed_incomes (user_id, name, value, category, frequency, due_day) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, description, numericValue, selectedCategory, frequency, parseInt(dueDay) || 1]
        );
      }

      router.back();
    } catch (error) {
      console.error('Error saving income:', error);
      Alert.alert('Erro', 'Não foi possível salvar a receita.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialIcons name="close" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Receita</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Value Input Section ── */}
        <View style={styles.valueSection}>
          <Text style={styles.valueLabel}>VALOR DO GANHO</Text>
          <View style={styles.valueRow}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={handleValueChange}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="rgba(228, 225, 238, 0.4)"
            />
          </View>
        </View>

        {/* ── Form Canvas ── */}
        <View style={styles.formCanvas}>
          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Salário Mensal"
                placeholderTextColor="rgba(143, 143, 160, 0.4)"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Category Grid */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat.id && styles.categoryItemActive
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <MaterialIcons 
                    name={cat.icon as any} 
                    size={24} 
                    color={selectedCategory === cat.id ? Colors.primary : Colors.outline} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recurrent Toggle */}
          <TouchableOpacity 
            style={styles.toggleCard}
            onPress={() => setIsRecurrent(!isRecurrent)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIconBox}>
                <MaterialIcons name="update" size={24} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Receita Recurrente</Text>
                <Text style={styles.toggleSubtitle}>Repetir automaticamente todo mês</Text>
              </View>
            </View>
            <View style={[
              styles.switch,
              isRecurrent && { backgroundColor: Colors.primaryContainer }
            ]}>
              <View style={[
                styles.switchThumb,
                isRecurrent && { transform: [{ translateX: 24 }] }
              ]} />
            </View>
          </TouchableOpacity>

          {/* Conditional Recurrence Settings */}
          {isRecurrent && (
            <View style={styles.fixedSettings}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Frequência do Recebimento</Text>
                <View style={styles.frequencyRow}>
                  {['Semanal', 'Mensal', 'Anual'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyBtn,
                        frequency === freq && styles.frequencyBtnActive
                      ]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text style={[
                        styles.frequencyText,
                        frequency === freq && styles.frequencyTextActive
                      ]}>{freq}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {frequency === 'Mensal' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Dia do Recebimento</Text>
                  <View style={styles.dueDayInputContainer}>
                    <MaterialIcons name="event" size={20} color={Colors.primary} />
                    <TextInput
                      style={styles.dueDayInput}
                      value={dueDay}
                      onChangeText={(t) => setDueDay(t.replace(/\D/g, '').slice(0, 2))}
                      keyboardType="numeric"
                      placeholder="Ex: 05"
                      placeholderTextColor="rgba(198, 197, 215, 0.3)"
                      maxLength={2}
                    />
                    <Text style={styles.dueDaySuffix}>de cada mês</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Date Picker Button */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Data do Recebimento</Text>
            <TouchableOpacity 
              style={styles.dateCard}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <MaterialIcons name="edit" size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={RNPlatform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(RNPlatform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
            />
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Save Button ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'SALVANDO...' : 'SALVAR GANHO'}
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'rgba(19, 18, 28, 0.8)',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  valueSection: {
    alignItems: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  valueLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 2,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currencySymbol: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    color: 'rgba(190, 194, 255, 0.6)',
  },
  valueInput: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 64,
    color: Colors.onSurface,
    textAlign: 'center',
    minWidth: 150,
  },
  formCanvas: {
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.outline,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.onSurface,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: (width - 48 - 20) / 3, // 3 columns
    height: 80,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(190, 194, 255, 0.1)',
    borderColor: 'rgba(190, 194, 255, 0.2)',
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.outline,
    textTransform: 'uppercase',
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  toggleSubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: Colors.outline,
  },
  switch: {
    width: 56,
    height: 32,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 16,
    padding: 4,
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: Colors.outline,
    borderRadius: 12,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(228, 225, 238, 0.05)',
  },
  dateText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.surface,
  },
  saveButton: {
    height: 64,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  saveButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    color: Colors.onPrimaryContainer,
    letterSpacing: 1,
  },
  fixedSettings: {
    backgroundColor: 'rgba(52, 52, 62, 0.2)',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(190, 194, 255, 0.05)',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(190, 194, 255, 0.1)',
  },
  frequencyBtnActive: {
    backgroundColor: 'rgba(190, 194, 255, 0.1)',
    borderColor: Colors.primary,
  },
  frequencyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.outline,
  },
  frequencyTextActive: {
    color: Colors.primary,
  },
  dueDayInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  dueDayInput: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    width: 40,
  },
  dueDaySuffix: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.outline,
  },
});
