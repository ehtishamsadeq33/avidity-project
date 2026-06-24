import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAdmin } from "@/context/AdminContext";

export default function AdminLayout() {
  const { token, isLoading } = useAdmin();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments.includes("(tabs)" as never);
    if (!token && inTabsGroup) {
      router.replace("/admin/login");
    }
  }, [token, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#18012C" }}>
        <ActivityIndicator color="#FFEB00" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="report-preview"
        options={{
          headerShown: true,
          title: "Report Preview",
          headerStyle: { backgroundColor: "#18012C" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFFFFF" },
        }}
      />
      <Stack.Screen
        name="group-detail"
        options={{
          headerShown: true,
          title: "Group Detail",
          headerStyle: { backgroundColor: "#18012C" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#FFFFFF" },
        }}
      />
    </Stack>
  );
}
