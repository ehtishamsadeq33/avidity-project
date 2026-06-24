import React from "react";
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function TextField({ label, value, onChangeText, placeholder, required, keyboardType, autoCapitalize }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A89FBC"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#18012C", letterSpacing: 0.3 },
  req: { color: "#D14343" },
  input: {
    borderWidth: 1,
    borderColor: "#E6E1EE",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
});
