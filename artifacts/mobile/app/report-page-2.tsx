import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ReportPage2Content from "@/components/ReportPage2Content";
import type {
  CandidateInfo,
  Composites,
  PerceivedActual,
} from "@/components/ReportPage1Content";
import { adminFetch } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import type { GroupAverages } from "@/components/ReportPage2Content";

function safeParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export default function ReportPage2() {
  const router = useRouter();
  const { token } = useAdmin();
  const params = useLocalSearchParams<{
    candidateInfo?: string;
    composites?: string;
    perceivedActual?: string;
    scores?: string;
    totalResponses?: string;
    submittedAt?: string;
    groupId?: string;
  }>();

  const candidateInfo = useMemo<CandidateInfo>(() => safeParse<CandidateInfo>(params.candidateInfo, {}), [params.candidateInfo]);
  const composites = useMemo<Composites>(() => safeParse<Composites>(params.composites, {}), [params.composites]);
  const perceivedActual = useMemo<PerceivedActual>(() => safeParse<PerceivedActual>(params.perceivedActual, {}), [params.perceivedActual]);
  const scores: Record<string, number> = useMemo(() => { try { return params.scores ? JSON.parse(params.scores) : {}; } catch { return {}; } }, [params.scores]);
  const totalResponses = Number(params.totalResponses ?? 0);
  const submittedAt = params.submittedAt ?? new Date().toISOString();
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
        <ReportPage2Content
          candidateInfo={candidateInfo}
          composites={composites}
          groupAverages={groupAverages}
        />
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/report-page-3",
            params: {
              candidateInfo: JSON.stringify(candidateInfo),
              composites: JSON.stringify(composites),
              perceivedActual: JSON.stringify(perceivedActual),
              scores: JSON.stringify(scores),
              totalResponses: String(totalResponses),
              submittedAt,
              groupId,
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
  root: { flex: 1, backgroundColor: "#fffde7" },
  scrollContent: { padding: 16, paddingBottom: 20 },
  buttonRow: { flexDirection: "row", padding: 16, gap: 12, backgroundColor: "#fffde7", borderTopWidth: 1, borderTopColor: "#f0e6b8" },
  backButton: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", padding: 14, borderRadius: 10, alignItems: "center" },
  backButtonText: { fontWeight: "bold", fontSize: 16, color: "#333" },
  continueButton: { flex: 1, backgroundColor: "#f5c842", padding: 14, borderRadius: 10, alignItems: "center" },
  continueButtonText: { fontWeight: "bold", fontSize: 16, color: "#000" },
});
