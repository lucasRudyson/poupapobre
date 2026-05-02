import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export default function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Em breve...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.onSurface, fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold' }
});
