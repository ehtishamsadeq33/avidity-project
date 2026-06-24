import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
        />
        <View>
          <Text style={styles.brand}>AVIDITY</Text>
          <Text style={styles.brandSub}>INTERNATIONAL</Text>
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 8 },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#18012C",
    letterSpacing: 2,
  },
  brandSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#A886CD",
    letterSpacing: 3,
    marginTop: -2,
  },
  subtitle: {
    marginTop: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#6B6480",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
