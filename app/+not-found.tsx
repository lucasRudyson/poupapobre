import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const pathname = usePathname();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Rota não encontrada</Text>
        <Text style={styles.subtitle}>O caminho "{pathname}" não existe.</Text>
        
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para o Início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  linkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
