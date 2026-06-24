import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE } from "@/lib/api";

export default function ICEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();
  const isGroup = params.type === "group";

  const [icNumber, setIcNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!icNumber.trim()) {
      setError("Please enter your IC number");
      return;
    }

    // Optional validation for exactly 12 digits
    if (icNumber.length !== 12) {
      setError("IC number must be 12 digits");
      return;
    }

    setError("");

    if (isGroup) {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/survey/verify-ic`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            icNumber: icNumber.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(
            (data as { error?: string }).error ?? "Verification failed"
          );
          return;
        }

        const { groupId } = data as {
          groupId: string;
          groupName: string;
        };

        router.push({
          pathname: "/personal",
          params: {
            icNumber: icNumber.trim(),
            groupId,
            submissionType: "group",
          },
        });
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      router.push({
        pathname: "/personal",
        params: {
          icNumber: icNumber.trim(),
          type: "individual",
        },
      });
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: (Platform.OS === "web" ? 0 : insets.top) + 32,
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isGroup ? "Group Survey" : "Individual Survey"}
        </Text>

        <Text style={styles.subtitle}>
          Please enter your IC number to continue
        </Text>

        <TextInput
          style={styles.input}
          placeholder="IC Number (e.g. 901234567890)"
          placeholderTextColor="#AAA"
          value={icNumber}
          onChangeText={(t) => {
            // Allow only numbers
            const numericValue = t.replace(/[^0-9]/g, "");

            setIcNumber(numericValue);

            if (error) setError("");
          }}
          keyboardType="numeric"
          maxLength={12}
          autoCapitalize="none"
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

        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Go back</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    backgroundColor: "#FAFAFA",
    color: "#18012C",
    marginBottom: 12,
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

  btnDisabled: {
    opacity: 0.6,
  },

  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000000",
  },

  back: {
    alignItems: "center",
    paddingVertical: 6,
  },

  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#9B8EC4",
  },
});