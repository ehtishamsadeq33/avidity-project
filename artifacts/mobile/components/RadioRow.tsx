import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}

export function RadioRow({ options, value, onChange, columns = 2 }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={({ pressed }) => [
              styles.option,
              { width: `${100 / columns - 2}%` },
              selected && styles.optionSelected,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.dot, selected && styles.dotSelected]}>
              {selected ? <View style={styles.dotInner} /> : null}
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E6E1EE",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  optionSelected: {
    borderColor: "#FFEB00",
    backgroundColor: "#FFEB00",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#A886CD",
    alignItems: "center",
    justifyContent: "center",
  },
  dotSelected: { borderColor: "#18012C" },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFEB00",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#1A1A1A",
    flexShrink: 1,
  },
  labelSelected: { color: "#18012C", fontFamily: "Inter_600SemiBold" },
});
