import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SurveyProvider } from "@/context/SurveyContext";
import { AdminProvider } from "@/context/AdminContext";
import { Image, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
function CustomHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <View
      style={{
        height: 170,
        backgroundColor: "#000000",
        paddingTop: 30,
        justifyContent: "center",
      }}
    >
      {/* Back button (left) */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          left: 16,
          top: 55,
          zIndex: 10,
          paddingTop: 30,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 30 }}>← </Text>
      </Pressable>

      {/* Center logo */}
      <View style={{ alignItems: "center", width: "100%" }}>
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 160, height: 55 }}
          resizeMode="contain"
        />

        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Inter_600SemiBold",
            fontSize: 25,
            marginTop: 10,
            textAlign: "center",
            lineHeight: 25,
          }}
        >
          Coach Readiness{"\n"}Assessment
        </Text>
      </View>
    </View>
  );
}
function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#000000" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
        contentStyle: { backgroundColor: "#FCFCFC" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ic-entry" options={{ headerShown: false }} />
      <Stack.Screen name="group-entry" options={{ headerShown: false }} />
      <Stack.Screen
        name="personal"
        options={{
          header: () => <CustomHeader title={""} />,
        }}
      />

      <Stack.Screen
        name="questions"
        options={{
          header: () => <CustomHeader title={""} />,
        }}
      />
      <Stack.Screen name="complete" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AdminProvider>
                <SurveyProvider>
                  <StatusBar style="light" />
                  <RootLayoutNav />
                </SurveyProvider>
              </AdminProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
