import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface Props {
  value: number | undefined;
  onChange: (v: number) => void;
}

const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function ScaleInput({ value, onChange }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {VALUES.map((v) => {
          const selected = value === v;
          return (
            <Pressable
              key={v}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync().catch(() => {});
                }
                onChange(v);
              }}
              style={({ pressed }) => [
                styles.cell,
                selected && styles.cellSelected,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.cellText, selected && styles.cellTextSelected]}>{v}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>1 — Lowest</Text>
        <Text style={styles.legend}>10 — Highest</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: {
    flexBasis: "18%",
    flexGrow: 1,
    minWidth:44,
    aspectRatio: 2,
    borderWidth: 3,
    borderColor: "#E6E1EE",
    borderRadius: 6,
    backgroundColor: "#E6E1EE",
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  cellText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#1A1A1A",
  },
  cellTextSelected: { color: "#FFFFFF" },
  legendRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legend: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#6B6480",
    letterSpacing: 0.5,
  },
});
