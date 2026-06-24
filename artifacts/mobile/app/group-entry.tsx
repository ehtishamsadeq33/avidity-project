import { Image } from "react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE } from "@/lib/api";

export default function GroupEntryScreen() {
  const [groupCode, setGroupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    if (!groupCode.trim()) {
      setError("Please enter a group code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/survey/verify-group-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode: groupCode.trim().toUpperCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Invalid group code");
        return;
      }
      const {
        groupId,
        groupName,
        groupCode: verifiedCode,
        phase,
      } = data as {
        groupId: string;
        groupName: string;
        groupCode: string;
        phase: "pre" | "post" | null;
      };
      router.push({
        pathname: "/personal",
        params: {
          groupCode: verifiedCode,
          groupId,
          groupName,
          phase: phase ?? "",
          submissionType: "group",
        },
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Platform.OS === "web" ? 0 : insets.top },
      ]}
    >
      {/* LOGO AT TOP */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Group Survey</Text>
        <Text style={styles.subtitle}>
          Enter the group code for your cohort
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. ABC123"
          placeholderTextColor="#AAA"
          value={groupCode}
          onChangeText={(t) => {
            setGroupCode(t.toUpperCase());
            if (error) setError("");
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnText}>Continue →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Go back</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Avidity International. © Copyrighted. All Rights Reserved
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#18012C",
    padding: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#18012C",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B6480",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D5C9E8",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    backgroundColor: "#FAFAFA",
    color: "#18012C",
    marginBottom: 12,
    letterSpacing: 3,
    textAlign: "center",
  },
  error: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#D14343",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#FFEB00",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000000",
  },
  back: { alignItems: "center", paddingVertical: 6 },
  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#9B8EC4",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: -150, // 👈 moves logo UP only
  },

  logo: {
    width: 180,
    height: 60,
  },
  footerText: {
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#000000",
    lineHeight: 18,
  },
});
