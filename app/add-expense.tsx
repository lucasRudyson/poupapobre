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
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant' },
  { id: 'transporte', name: 'Transporte', icon: 'directions-car' },
  { id: 'moradia', name: 'Moradia', icon: 'home' },
  { id: 'saude', name: 'Saúde', icon: 'medical-services' },
  { id: 'lazer', name: 'Lazer', icon: 'theater-comedy' },
  { id: 'compras', name: 'Compras', icon: 'shopping-bag' },
  { id: 'educacao', name: 'Educação', icon: 'school' },
  { id: 'outros', name: 'Outros', icon: 'add' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('alimentacao');
  const [isFixed, setIsFixed] = useState(false);
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
      const user = await db.getFirstAsync<{ id: number }>('SELECT id FROM users LIMIT 1');
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      const date = selectedDate.toISOString();

      // Save as transaction
      await db.runAsync(
        'INSERT INTO transactions (user_id, type, description, value, category, date, is_recurrent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, 'expense', description, numericValue, selectedCategory, date, isFixed ? 1 : 0]
      );

      // If fixed, also add to fixed_expenses
      if (isFixed) {
        await db.runAsync(
          'INSERT INTO fixed_expenses (user_id, name, value, category, frequency, due_day) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, description, numericValue, selectedCategory, frequency, parseInt(dueDay) || 1]
        );
      }

      router.back();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Erro', 'Não foi possível salvar a despesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Gasto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Value Input Section ── */}
        <View style={styles.valueSection}>
          <Text style={styles.valueLabel}>VALOR DA TRANSAÇÃO</Text>
          <View style={styles.valueRow}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.valueInput}
              value={value}
              onChangeText={handleValueChange}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor="rgba(228, 225, 238, 0.4)"
              autoFocus
            />
          </View>
          <View style={styles.underline} />
        </View>

        {/* ── Form Canvas ── */}
        <View style={styles.formCanvas}>
          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Descrição do Gasto</Text>
            <View style={styles.sunkenInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Café da Manhã"
                placeholderTextColor="rgba(198, 197, 215, 0.3)"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Category Grid */}
          <View style={styles.fieldGroup}>
            <View style={styles.categoryHeader}>
              <Text style={styles.fieldLabel}>Categoria</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>VER TODAS</Text>
              </TouchableOpacity>
            </View>
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
                  <View style={[
                    styles.categoryIconBox,
                    selectedCategory === cat.id && { backgroundColor: Colors.primaryContainer }
                  ]}>
                    <MaterialIcons 
                      name={cat.icon as any} 
                      size={24} 
                      color={selectedCategory === cat.id ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
                    />
                  </View>
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

          {/* Fixed Expense Toggle */}
          <TouchableOpacity 
            style={styles.toggleCard}
            onPress={() => setIsFixed(!isFixed)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIconBox}>
                <MaterialIcons name="update" size={24} color={Colors.tertiary} />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Despesa Fixa</Text>
                <Text style={styles.toggleSubtitle}>Repetir todos os meses</Text>
              </View>
            </View>
            <View style={[
              styles.switch,
              isFixed && { backgroundColor: Colors.primaryContainer }
            ]}>
              <View style={[
                styles.switchThumb,
                isFixed && { transform: [{ translateX: 24 }] }
              ]} />
            </View>
          </TouchableOpacity>

          {/* Conditional Fixed Settings */}
          {isFixed && (
            <View style={styles.fixedSettings}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Frequência</Text>
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
                  <Text style={styles.fieldLabel}>Dia do Vencimento</Text>
                  <View style={styles.dueDayInputContainer}>
                    <MaterialIcons name="event" size={20} color={Colors.primary} />
                    <TextInput
                      style={styles.dueDayInput}
                      value={dueDay}
                      onChangeText={(t) => setDueDay(t.replace(/\D/g, '').slice(0, 2))}
                      keyboardType="numeric"
                      placeholder="Ex: 10"
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
            <Text style={styles.fieldLabel}>Data da Transação</Text>
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
          <MaterialIcons name="check" size={24} color={Colors.onPrimaryContainer} />
          <Text style={styles.saveButtonText}>
            {loading ? 'SALVANDO...' : 'Salvar Despesa'}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  valueSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  valueLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(198, 197, 215, 0.6)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 32,
    color: 'rgba(190, 194, 255, 0.4)',
    marginRight: 4,
  },
  valueInput: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 56,
    color: Colors.onSurface,
    textAlign: 'center',
    minWidth: 100,
  },
  underline: {
    height: 4,
    width: 80,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.5,
  },
  formCanvas: {
    gap: 32,
  },
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'rgba(228, 225, 238, 0.7)',
    marginLeft: 4,
  },
  sunkenInput: {
    backgroundColor: '#0d0d16',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  textInput: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: Colors.onBackground,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  seeAllText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: (width - 48 - 36) / 4, // 4 columns
    alignItems: 'center',
    gap: 8,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(190, 194, 255, 0.4)',
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
    borderRadius: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 171, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  toggleSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(198, 197, 215, 0.6)',
  },
  switch: {
    width: 50,
    height: 28,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 14,
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(19, 18, 28, 0.9)',
  },
  saveButton: {
    height: 64,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 18,
    color: Colors.onPrimaryContainer,
    letterSpacing: -0.5,
  },
  fixedSettings: {
    backgroundColor: 'rgba(20, 20, 30, 0.4)',
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
    backgroundColor: '#0d0d16',
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
    backgroundColor: '#0d0d16',
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
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: 'rgba(52, 52, 62, 0.4)',
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
});
