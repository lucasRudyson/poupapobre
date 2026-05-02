import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    console.log('DEBUG: Iniciando logout...');
    try {
      // Marcamos que o usuário saiu manualmente
      await AsyncStorage.setItem('manually_logged_out', 'true');
      
      // Pequeno fôlego para o AsyncStorage persistir
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (e) {
      console.error('Logout error:', e);
      router.replace('/');
    }
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, color = Colors.onSurface }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      style={styles.optionContainer}
      onPress={onPress}
    >
      <BlurView intensity={20} tint="light" style={styles.optionBlur}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header / Avatar Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>L</Text>
          </LinearGradient>
          <Text style={styles.userName}>Lucas Rudyson</Text>
          <Text style={styles.userEmail}>lucas@exemplo.com</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <ProfileOption 
            icon="notifications" 
            title="Notificações" 
            subtitle="Central de alertas e avisos"
          />
          <ProfileOption 
            icon="security" 
            title="Segurança" 
            subtitle="Biometria e senhas"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <ProfileOption 
            icon="palette" 
            title="Aparência" 
            subtitle="Tema escuro e cores"
          />
          <ProfileOption 
            icon="language" 
            title="Idioma" 
            subtitle="Português (Brasil)"
          />
        </View>

        {/* Logout Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#FF5252" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>PoupaPobre v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  userName: {
    fontSize: 24,
    color: Colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  userEmail: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.primary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  optionContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: Colors.onSurface,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF525215',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF525230',
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginLeft: 10,
  },
  versionText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 20,
    fontFamily: 'PlusJakartaSans_400Regular',
  }
});
