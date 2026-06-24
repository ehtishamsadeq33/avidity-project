import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline";
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: Props) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? "#000000" : "#FFFFFF"} />
      ) : (
        <View style={styles.row}>
          <Text
            style={[
              styles.text,
              isOutline ? styles.textOutline : styles.textPrimary,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primary: { backgroundColor: "#000000" },
  outline: {
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#000000",
  },
  disabled: { opacity: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontFamily: "Inter_600SemiBold", fontSize: 15, letterSpacing: 0.5 },
  textPrimary: { color: "#FFFFFF" },
  textOutline: { color: "#FFFFFF" },
});
