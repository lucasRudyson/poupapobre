import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-900">
      <Text className="text-2xl font-bold text-black dark:text-white">Login Screen</Text>
      <Link href="/dashboard" className="mt-4 text-blue-500">Go to Dashboard</Link>
    </View>
  );
}
