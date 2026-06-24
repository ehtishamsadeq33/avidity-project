import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ReportPage1Content, {
  type CandidateInfo,
  type Composites,
  type PerceivedActual,
} from "@/components/ReportPage1Content";
import { adminFetch } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import type { GroupAverages } from "@/components/ReportPage2Content";

function safeParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function ReportScreen() {
  const router = useRouter();
  const { token } = useAdmin();
  const params = useLocalSearchParams<{
    submittedAt?: string;
    totalResponses?: string;
    scores?: string;
    candidateInfo?: string;
    perceivedActual?: string;
    composites?: string;
    groupId?: string;
  }>();
  const totalResponses = Number(params.totalResponses ?? 0);
  const submittedAt = params.submittedAt ?? new Date().toISOString();
  const scores: Record<string, number> = useMemo(() => {
    try { return params.scores ? JSON.parse(params.scores) : {}; } catch { return {}; }
  }, [params.scores]);
  const candidateInfo = useMemo<CandidateInfo>(() => safeParse<CandidateInfo>(params.candidateInfo, {}), [params.candidateInfo]);
  const perceivedActual = useMemo<PerceivedActual>(() => safeParse<PerceivedActual>(params.perceivedActual, {}), [params.perceivedActual]);
  const composites = useMemo<Composites>(() => safeParse<Composites>(params.composites, {}), [params.composites]);
  const groupId = params.groupId ?? "";

  const [groupAverages, setGroupAverages] = useState<GroupAverages | null>(null);
  useEffect(() => {
    if (!groupId) return;
    adminFetch<GroupAverages>(`/admin/groups/${groupId}/averages`, token)
      .then((d) => setGroupAverages(d))
      .catch(() => {});
  }, [groupId, token]);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ReportPage1Content candidateInfo={candidateInfo} perceivedActual={perceivedActual} composites={composites} scores={scores} totalResponses={totalResponses} groupAverages={groupAverages} />
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/report-page-2",
            params: {
              candidateInfo: JSON.stringify(candidateInfo),
              composites: JSON.stringify(composites),
              perceivedActual: JSON.stringify(perceivedActual),
              scores: JSON.stringify(scores),
              totalResponses: String(totalResponses),
              submittedAt,
              groupId: params.groupId ?? "",
            },
          })}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FCFCFC" },
  scrollContent: { padding: 20, paddingBottom: 20 },
  buttonRow: { flexDirection: "row", padding: 16, gap: 12, backgroundColor: "#FCFCFC", borderTopWidth: 1, borderTopColor: "#eee" },
  continueButton: { flex: 1, backgroundColor: "#f5c842", padding: 14, borderRadius: 10, alignItems: "center" },
  continueButtonText: { fontFamily: "Inter_700Bold", fontWeight: "bold", fontSize: 16, color: "#000000" },
});
