import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAdmin } from "@/context/AdminContext";
import { adminLogin } from "@/lib/api";

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAdmin();
  const isWeb = Platform.OS === "web";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin(username.trim(), password);
      await login(result.token, result.username);
      router.replace("/admin/(tabs)/overview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.root,
          { paddingTop: (isWeb ? 67 : insets.top) + 32, paddingBottom: (isWeb ? 34 : insets.bottom) + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.eyebrow}>ADMIN ACCESS</Text>
          <Text style={styles.title}>Dashboard Login</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="admin"
            placeholderTextColor="#9B8EC4"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9B8EC4"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace("/")} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: "#18012C",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  header: { alignItems: "center", gap: 12 },
  logo: { width: 160, height: 58, borderRadius: 8 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFEB00",
    letterSpacing: 4,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    gap: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#18012C",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6E1EE",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    backgroundColor: "#F8F6FC",
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#D14343",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#FFEB00",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#18012C",
  },
  backLink: { marginTop: 8 },
  backLinkText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#D9CDE8",
  },
});
