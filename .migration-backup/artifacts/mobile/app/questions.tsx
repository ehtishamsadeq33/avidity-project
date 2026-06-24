import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { fetchQuestions, submitSurvey, type SurveyQuestion } from "@/lib/api";
import { useSurvey } from "@/context/SurveyContext";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScaleInput } from "@/components/ScaleInput";

const PAGE_SIZE = 5;

export default function QuestionsScreen() {
  const router = useRouter();
  const { personal, answers, setAnswer, reset } = useSurvey();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["survey-questions"],
    queryFn: fetchQuestions,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!personal.name || !personal.email) {
      router.replace("/personal");
    }
  }, [personal.email, personal.name, router]);

  const questions = data ?? [];
  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const slice = useMemo(() => questions.slice(start, start + PAGE_SIZE), [questions, start]);

  const allAnsweredOnPage = slice.every((q) => typeof answers[q.id] === "number");
  const allAnsweredTotal = questions.length > 0 && questions.every((q) => typeof answers[q.id] === "number");

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const onNext = () => {
    if (!allAnsweredOnPage) {
      setErrorText("Please answer all questions on this page.");
      return;
    }
    setErrorText(null);
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
      scrollToTop();
    }
  };

  const onPrev = () => {
    if (page > 0) {
      setPage((p) => p - 1);
      scrollToTop();
    }
  };

  const onSubmit = async () => {
    if (!allAnsweredTotal) {
      const answeredCount = questions.filter((q) => typeof answers[q.id] === "number").length;
      setErrorText(
        answeredCount === questions.length
          ? `Please answer every question (1–10) before submitting.`
          : `Please answer all ${questions.length} questions before submitting.`,
      );
      return;
    }
    setSubmitting(true);
    setErrorText(null);
    try {
      const isGroup = personal.submissionType === "group";
      await submitSurvey({
        ...personal,
        date: new Date(personal.date).toISOString(),
        answers,
        totalQuestions: questions.length,
        icNumber: personal.icNumber ?? "",
        groupCode: isGroup ? (personal.groupCode ?? null) : null,
        groupId: isGroup ? (personal.groupId ?? null) : null,
        phase: isGroup ? (personal.phase ?? null) : null,
        submissionType: personal.submissionType ?? "individual",
      });
      router.replace("/complete");
      setTimeout(() => reset(), 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      setErrorText(msg);
      if (Platform.OS !== "web") Alert.alert("Submission failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#18012C" size="large" />
        <Text style={styles.loadingText}>Loading assessment…</Text>
      </View>
    );
  }

  if (error || questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load the assessment</Text>
        <Text style={styles.errorBody}>Please check your connection and try again.</Text>
        <View style={{ height: 16 }} />
        <PrimaryButton title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const isLast = page === totalPages - 1;
  const progress = ((page + 1) / totalPages) * 100;

  return (
    <View style={styles.root}>
      <View style={styles.headerWrap}>
        <Text style={styles.eyebrow}>SECTION 2 OF 2</Text>
        <Text style={styles.title}>Coach Readiness Assessment</Text>
        <Text style={styles.subtitle}>
          Please scale the following statements on a scale of 1 to 10 whether you
          agree or if the statement relates to you, with 1 being the lowest and
          10 being the highest.
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          Page {page + 1} of {totalPages}  ·  {Object.keys(answers).length} / {questions.length} answered
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {slice.map((q: SurveyQuestion) => (
          <View key={q.id} style={styles.qCard}>
            <View style={styles.qHeader}>
              <View style={styles.qBadge}>
                <Text style={styles.qBadgeText}>{q.label}</Text>
              </View>
              <Text style={styles.qText}>{q.text}</Text>
            </View>
            <View style={{ height: 14 }} />
            <ScaleInput
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
            />
          </View>
        ))}

        {errorText ? <Text style={styles.errorInline}>{errorText}</Text> : null}

        <View style={styles.navRow}>
          {page > 0 ? (
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Back" onPress={onPrev} variant="outline" />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Back" onPress={() => router.replace("/personal")} variant="outline" />
            </View>
          )}
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            {isLast ? (
              <PrimaryButton title="Submit" onPress={onSubmit} loading={submitting} />
            ) : (
              <PrimaryButton title="Next" onPress={onNext} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFEB00" },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#FFEB00",
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#FFEB00",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    color: "#FFFFFF",
    lineHeight: 18,
    marginBottom: 14,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F2EEF7",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFEB00",
  },
  progressLabel: {
    marginTop: 8,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  qCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E1EE",
    padding: 18,
    marginBottom: 14,
  },
  qHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  qBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#18012C",
    minWidth: 36,
    alignItems: "center",
  },
  qBadgeText: {
    color: "#FFEB00",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  qText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14.5,
    lineHeight: 21,
    color: "#1A1A1A",
  },
  navRow: { flexDirection: "row", marginTop: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#FCFCFC" },
  loadingText: { marginTop: 12, fontFamily: "Inter_500Medium", fontSize: 13, color: "#6B6480" },
  errorTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#18012C", marginBottom: 6 },
  errorBody: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#6B6480", textAlign: "center" },
  errorInline: { color: "#D14343", fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4, marginBottom: 4 },
});
