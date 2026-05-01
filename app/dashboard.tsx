import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function DashboardScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-900">
      <Text className="text-2xl font-bold text-black dark:text-white">Dashboard Screen</Text>
      <Link href="/" className="mt-4 text-blue-500">Back to Login</Link>
    </View>
  );
}
