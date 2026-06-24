import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { RadioRow } from "@/components/RadioRow";
import { useSurvey, type PersonalInfo } from "@/context/SurveyContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const AGE_GROUPS = [
  "20-25",
  "26-30",
  "31-35",
  "36-40",
  "41-45",
  "46-50",
  "51-55",
  "56-60",
  "61-65",
  "66-76",
];
const YEARS = [
  "less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "16-20 years",
  "21 years and more",
];
const YEARS_POSITION = [
  "less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "16-20 years",
  "21 years and more",
];
const REPORTS = [
  "None",
  "1 to 3",
  "4 to 6",
  "7 to 10",
  "11 to 20",
  "21 and more",
];

export default function PersonalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    icNumber?: string;
    groupCode?: string;
    groupId?: string;
    groupName?: string;
    phase?: string;
    submissionType?: string;
  }>();
  const { personal, setPersonal } = useSurvey();
  const rawPhase = params.phase;
  const resolvedPhase: "pre" | "post" | null =
    rawPhase === "pre" || rawPhase === "post" ? rawPhase : null;
  const [form, setForm] = useState<PersonalInfo>({
    ...personal,
    date: personal.date || new Date().toISOString().slice(0, 10),
    icNumber: params.icNumber ?? personal.icNumber ?? "",
    groupCode: params.groupCode ?? personal.groupCode ?? "",
    groupId: params.groupId ?? personal.groupId ?? "",
    groupName: params.groupName ?? personal.groupName ?? "",
    phase: resolvedPhase ?? personal.phase ?? null,
    submissionType:
      params.submissionType === "group" || personal.submissionType === "group"
        ? "group"
        : "individual",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof PersonalInfo) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onContinue = () => {
    const required: (keyof PersonalInfo)[] = [
      "name",
      "company",
      "date",
      "email",
      "gender",
      "ageGroup",
      "yearsInOrganization",
      "yearsInPosition",
      "numberOfReports",
    ];
    for (const k of required) {
      if (!form[k] || (form[k] as string).trim() === "") {
        setError("All fields are required to continue.");
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setPersonal(form);
    router.push("/questions");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.root}
      contentContainerStyle={styles.content}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      
      <Text style={styles.eyebrow}>SECTION 1 OF 2</Text>
      <Text style={styles.title}>Your Information</Text>
      <Text style={styles.subtitle}>
        All fields are required. Please complete every field to continue.
      </Text>

      {form.groupCode ? (
        <View style={styles.icBadge}>
          <Text style={styles.icLabel}>Group</Text>
          <Text style={styles.icValue}>
            {form.groupName ? `${form.groupName} · ` : ""}{form.groupCode}
          </Text>
        </View>
      ) : form.icNumber ? (
        <View style={styles.icBadge}>
          <Text style={styles.icLabel}>IC Number</Text>
          <Text style={styles.icValue}>{form.icNumber}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <TextField
          label="Name"
          value={form.name}
          onChangeText={update("name")}
          placeholder="Full name"
          required
          autoCapitalize="words"
        />
        <TextField
          label="Company Name"
          value={form.company}
          onChangeText={update("company")}
          placeholder="Your organization"
          required
          autoCapitalize="words"
        />
        <TextField
          label="Date"
          value={form.date}
          onChangeText={update("date")}
          placeholder="YYYY-MM-DD"
          required
          keyboardType={
            Platform.OS === "web" ? "default" : "numbers-and-punctuation"
          }
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={update("email")}
          placeholder="you@company.com"
          required
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.group}>
          <Text style={styles.groupLabel}>
            Gender <Text style={styles.req}>*</Text>
          </Text>
          <RadioRow
            options={["Male", "Female"]}
            value={form.gender}
            onChange={update("gender")}
            columns={2}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>
            Age <Text style={styles.req}>*</Text>
          </Text>
          <RadioRow
            options={AGE_GROUPS}
            value={form.ageGroup}
            onChange={update("ageGroup")}
            columns={3}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>
            Years in Organization <Text style={styles.req}>*</Text>
          </Text>
          <RadioRow
            options={YEARS}
            value={form.yearsInOrganization}
            onChange={update("yearsInOrganization")}
            columns={2}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>
            Years in Position <Text style={styles.req}>*</Text>
          </Text>
          <RadioRow
            options={YEARS_POSITION}
            value={form.yearsInPosition}
            onChange={update("yearsInPosition")}
            columns={2}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>
            Number of Direct Report(s) <Text style={styles.req}>*</Text>
          </Text>
          <RadioRow
            options={REPORTS}
            value={form.numberOfReports}
            onChange={update("numberOfReports")}
            columns={3}
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.cta}>
        <PrimaryButton title="Continue" onPress={onContinue} />
      </View>
      <Text style={styles.footerText}>
        Avidity International. © Copyrighted. All Rights Reserved
      </Text>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FCFCFC" },
  content: { padding: 24, paddingBottom: 60 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#A886CD",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 26,
    color: "#18012C",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B6480",
    marginBottom: 16,
    lineHeight: 20,
  },
  icBadge: {
    backgroundColor: "#F0EBF8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#6B6480",
  },
  icValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#18012C",
  },
  form: { gap: 18 },
  group: { gap: 10 },
  groupLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#18012C",
    letterSpacing: 0.3,
  },
  req: { color: "#D14343" },
  error: {
    marginTop: 18,
    color: "#D14343",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  footerText: {
    marginTop: 32,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#000000",
    lineHeight: 18,
  },
  cta: { marginTop: 26 },
});
