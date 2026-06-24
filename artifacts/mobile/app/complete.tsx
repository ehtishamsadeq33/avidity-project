import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/PrimaryButton";

export default function CompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.root, { paddingTop: (isWeb ? 67 : insets.top) + 32, paddingBottom: (isWeb ? 34 : insets.bottom) + 32 }]}>
      <View style={styles.brandRow}>
        <Image source={require("../assets/images/icon.png")} style={styles.logo} />
      </View>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Feather name="check" size={42} color="#000000" />
        </View>
        <Text style={styles.title}>Thank You!</Text>
        <Text style={styles.subtitle}>
          Your response has been submitted successfully. Our team will review your assessment.
        </Text>
      </View>

      <PrimaryButton title="Return to Home" onPress={() => router.replace("/")} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000", paddingHorizontal: 24, justifyContent: "space-between" },
  brandRow: { justifyContent: "center", alignItems: "center", gap: 12 },
  logo: { width: 189, height: 68, borderRadius: 8 },
  center: { alignItems: "center", paddingHorizontal: 8 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    marginBottom: 26,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 32,
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#D9CDE8",
    textAlign: "center",
    lineHeight: 22,
  },
});
