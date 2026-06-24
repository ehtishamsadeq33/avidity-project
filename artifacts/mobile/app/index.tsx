import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.hero,
          { paddingTop: (isWeb ? 67 : insets.top) + 32, paddingBottom: 36 },
        ]}
      >
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            The Global Authority In Applied Regenerative Leadership.
          </Text>
        </View>
        <View style={styles.heroSpacer} />
        <Text style={styles.eyebrow}>ASSESSMENT</Text>
        <Text style={styles.title}>Coach Readiness</Text>
        <Text style={styles.title}>Assessment</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hi There,</Text>
        <Text style={styles.paragraph}>
          You have been selected to complete the Coach Readiness Assessment with
          Avidity International.
        </Text>
        <Text style={styles.paragraph}>
          This assessment will provide invaluable insights into your potential
          as a coach. We will explore your skills, will, and environmental
          support to coach, guiding us in identifying your strengths and areas
          for development further.
        </Text>
        <Text style={styles.paragraph}>
          When answering the assessment, please ensure the following:
        </Text>

        <View style={styles.list}>
          <ConditionItem
            n="1"
            text="Kindly do the assessment in one sitting (avoid going to the washroom and taking breaks in between)."
          />
          <ConditionItem
            n="2"
            text="Please do the assessment in a conducive environment with minimal distractions."
          />
          <ConditionItem
            n="3"
            text="Kindly answer the questions based on the most practical response from a professional perspective."
          />
        </View>

        <Text style={styles.thanks}>Thank you.</Text>

        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/group-entry")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Begin Assessment</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => router.push("/admin/login")}
        >
          <Text style={styles.adminLinkText}>Admin Login</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Avidity International. © Copyrighted. All Rights Reserved
        </Text>
      </ScrollView>
    </View>
  );
}

function ConditionItem({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemBadge}>
        <Text style={styles.itemBadgeText}>{n}</Text>
      </View>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FCFCFC" },
  hero: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  brandRow: { justifyContent: "center", alignItems: "center", gap: 0 },
  logo: { width: 189, height: 50, borderRadius: 5 },
  heroSpacer: { height: 16 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FFEB00",
    letterSpacing: 4,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 32,
    lineHeight: 38,
    color: "#FFFFFF",
  },
  tagline: {
    marginTop: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#D9CDE8",
    lineHeight: 20,
    textAlign: "center",
  },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 24, paddingTop: 28 },
  greeting: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#18012C",
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    lineHeight: 22,
    color: "#3A3346",
    marginBottom: 20,
  },
  list: { gap: 14, marginBottom: 22 },
  itemRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  itemBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#18012C",
    alignItems: "center",
    justifyContent: "center",
  },
  itemBadgeText: {
    color: "#FFEB00",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  itemText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    lineHeight: 21,
    color: "#3A3346",
  },
  thanks: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#3A3346",
    marginBottom: 28,
  },
  cta: { gap: 12, marginTop: 4 },
  primaryBtn: {
    backgroundColor: "#000000",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#FFEB00",
  },
  secondaryBtn: {
    backgroundColor: "#18012C",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  footerText: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: "#9B8EC4",
    lineHeight: 18,
  },
  adminLink: { marginTop: 24, alignItems: "center", paddingVertical: 10 },
  adminLinkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#9B8EC4",
    textDecorationLine: "underline",
  },
});
